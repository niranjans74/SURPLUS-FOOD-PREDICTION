import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import Button from '../components/Button';
import { ArrowLeft, Navigation, Clock, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Default Icon issues in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to dynamically center map and adjust zoom when route coordinates change
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function SmartRoute() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const predictionId = searchParams.get('prediction_id');
  const ngoId = searchParams.get('ngo_id');

  const [loading, setLoading] = useState(true);
  const [routing, setRouting] = useState(true);
  const [error, setError] = useState('');
  
  const [donorData, setDonorData] = useState(null);
  const [ngoData, setNgoData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  
  const [routeCoords, setRouteCoords] = useState([]);
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationMin, setDurationMin] = useState(0);

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Custom styling for map markers using DivIcon
  const donorIcon = new L.DivIcon({
    className: 'custom-marker-donor',
    html: `<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const ngoIcon = new L.DivIcon({
    className: 'custom-marker-ngo',
    html: `<div style="background-color: #ea580c; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  useEffect(() => {
    const loadRoutingData = async () => {
      if (!predictionId || !ngoId) {
        setError('Missing required prediction_id or ngo_id parameters.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        // 1. Fetch matching recommendations to get the donor and target NGO location details
        const response = await api.get(`/api/ngos/recommendations?prediction_id=${predictionId}`);
        const selectedNgo = response.data.find(n => n.ngo_id === parseInt(ngoId, 10));
        
        if (!selectedNgo) {
          throw new Error('Selected NGO recommendation data not found.');
        }

        setNgoData(selectedNgo);

        // Retrieve historical prediction logs to get donor info
        const meResponse = await api.get('/api/auth/me');
        const donorProfile = meResponse.data.donor_profile;
        if (!donorProfile || donorProfile.latitude === null || donorProfile.longitude === null) {
          throw new Error('Donor location coordinates are missing.');
        }

        setDonorData(donorProfile);

        // Fetch prediction record directly to display surplus details
        // Get list of predictions to find this specific prediction ID
        const predHistory = await api.get(`/api/predictions/${donorProfile.id}`);
        const predictionRecord = predHistory.data.find(p => p.id === parseInt(predictionId, 10));
        if (!predictionRecord) {
          throw new Error('Surplus prediction record not found.');
        }

        setPredictionData(predictionRecord);

        // 2. Fetch Driving Route from OSRM Public Server
        const donorLat = parseFloat(donorProfile.latitude);
        const donorLng = parseFloat(donorProfile.longitude);
        const ngoLat = parseFloat(selectedNgo.latitude);
        const ngoLng = parseFloat(selectedNgo.longitude);

        setRouting(true);
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${donorLng},${donorLat};${ngoLng},${ngoLat}?overview=full&geometries=geojson`;
        
        const osrmResponse = await fetch(osrmUrl);
        const osrmData = await osrmResponse.json();

        if (osrmData.code !== 'Ok' || !osrmData.routes || osrmData.routes.length === 0) {
          throw new Error('OSRM routing engine failed to compute a path between coordinates.');
        }

        const route = osrmData.routes[0];
        // Geometry contains [lng, lat] coords; reverse to [lat, lng] for Leaflet
        const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        setRouteCoords(coords);
        setDistanceKm(route.distance / 1000); // meters to km
        setDurationMin(route.duration / 60); // seconds to minutes
        setRouting(false);

      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load route coordinates.');
      } finally {
        setLoading(false);
      }
    };

    loadRoutingData();
  }, [predictionId, ngoId]);

  const handleConfirmDonation = async () => {
    setConfirmLoading(true);
    setError('');

    // Generate standard name based on category
    const category = predictionData?.features?.food_category || 'Surplus';
    const formattedCategory = category.replace('_', ' ').toUpperCase();
    const foodItemName = `Surplus ${formattedCategory} (Forecast Claim)`;
    
    // Set expiry as 12 hours from now
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 12);

    const payload = {
      ngo_id: parseInt(ngoId, 10),
      prediction_id: parseInt(predictionId, 10),
      food_item: foodItemName,
      quantity: parseFloat(predictionData?.predicted_quantity || 0.0),
      unit: "kg",
      expiry_time: expiryTime.toISOString()
    };

    try {
      await api.post('/api/donations', payload);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to dispatch donation request.');
    } finally {
      setConfirmLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 text-sm font-semibold">Loading transit vectors...</span>
        </div>
      </div>
    );
  }

  if (error && routeCoords.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 glass-card rounded-xl border border-brand-orange-500/20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-brand-orange-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Routing Failure</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <Link to={`/donor/recommendations?prediction_id=${predictionId}`} className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
          Return to Recommendations
        </Link>
      </div>
    );
  }

  const donorLat = parseFloat(donorData?.latitude || 0);
  const donorLng = parseFloat(donorData?.longitude || 0);
  const ngoLat = parseFloat(ngoData?.latitude || 0);
  const ngoLng = parseFloat(ngoData?.longitude || 0);
  const mapBounds = [[donorLat, donorLng], [ngoLat, ngoLng]];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl">
            <CheckCircle2 className="w-16 h-16 text-brand-green-500 mx-auto animate-scale-up" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Donation Created!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Your donation request has been dispatched to <strong>{ngoData?.organization_name}</strong> with the status <span className="font-extrabold text-brand-green-600 bg-brand-green-500/10 px-2 py-0.5 rounded text-xs uppercase">REQUEST CREATED</span>.
              </p>
            </div>
            <Button
              onClick={() => navigate('/donor')}
              className="w-full py-3 text-sm font-bold uppercase tracking-wider"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center gap-3">
        <Link to={`/donor/recommendations?prediction_id=${predictionId}`} className="p-2 border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            Smart Transit Routing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Review transport geography and confirm delivery listing claim.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 relative min-h-[550px]">
        {/* Left Side: Map Column (takes 2 cols) */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border border-slate-200 dark:border-dark-border shadow-md h-[550px] relative">
          {routing && (
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center z-20">
              <div className="bg-white dark:bg-dark-card px-4 py-2 rounded-lg shadow-md border text-xs font-semibold text-slate-500">
                Fetching OSRM driving nodes...
              </div>
            </div>
          )}
          
          <MapContainer
            center={[donorLat, donorLng]}
            zoom={13}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Donor Marker */}
            <Marker position={[donorLat, donorLng]} icon={donorIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <h4 className="font-bold text-brand-green-600">Origin (Donor)</h4>
                  <p className="font-semibold text-slate-800">{donorData?.company_name}</p>
                  <p className="text-[10px] text-slate-400">{donorData?.address}</p>
                </div>
              </Popup>
            </Marker>

            {/* NGO Marker */}
            <Marker position={[ngoLat, ngoLng]} icon={ngoIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <h4 className="font-bold text-brand-orange-500">Destination (NGO)</h4>
                  <p className="font-semibold text-slate-800">{ngoData?.organization_name}</p>
                  <p className="text-[10px] text-slate-400">{ngoData?.address}</p>
                </div>
              </Popup>
            </Marker>

            {/* Route path line */}
            {routeCoords.length > 0 && (
              <Polyline
                positions={routeCoords}
                color="#3b82f6"
                weight={4}
                opacity={0.8}
              />
            )}
            
            {/* Map Bounds Adjuster */}
            <FitBounds bounds={mapBounds} />
          </MapContainer>
        </div>

        {/* Right Side: Route Details Dashboard */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white space-y-6 shadow-xl flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-dark-border">
                Route Vector Breakdown
              </h3>

              {/* Transit Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-dark-border rounded-xl">
                  <Navigation className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Distance</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white text-base">
                      {distanceKm.toFixed(2)} km
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-dark-border rounded-xl">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Duration</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white text-base">
                      {Math.ceil(durationMin)} mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Cargo Details */}
              <div className="space-y-3">
                <span className="text-xs text-slate-400 uppercase font-black tracking-wider block">Surplus Cargo Details</span>
                <div className="flex items-start gap-3 p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-dark-border rounded-xl">
                  <Package className="w-5 h-5 text-brand-green-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-slate-800 dark:text-white text-sm block">
                      {predictionData?.features?.food_category?.replace('_', ' ').toUpperCase() || 'Surplus'}
                    </span>
                    <span className="font-mono text-slate-500 text-xs font-semibold block">
                      Quantity: {predictionData?.predicted_quantity} kg (~{Math.floor(predictionData?.predicted_quantity / 0.4)} meals)
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Node Details */}
              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-dark-border/60 pt-4">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">NGO Consignee:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-300 block">{ngoData?.organization_name}</span>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400 block font-semibold mb-0.5">Fulfillment Address:</span>
                  <span className="text-slate-600 dark:text-slate-400 leading-normal block">{ngoData?.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button
                variant="primary"
                onClick={handleConfirmDonation}
                disabled={confirmLoading || success}
                className="w-full py-3.5 font-bold uppercase tracking-wider shadow-md shadow-brand-green-500/10"
              >
                {confirmLoading ? 'Initiating Donation Request...' : 'Confirm Donation Request'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
