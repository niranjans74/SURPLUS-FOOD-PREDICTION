import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import DashboardCard from '../components/DashboardCard';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { HeartHandshake, MapPin, ClipboardList, Utensils, AlertCircle, Check, X, ShieldAlert, Truck } from 'lucide-react';

export default function NgoDashboard() {
  const { user } = useContext(AuthContext);

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Requirement status counters
  const [reqCount, setReqCount] = useState(0);

  // Status updating form states
  const [driverInfoByDonation, setDriverInfoByDonation] = useState({}); // donationId -> { driver_name, driver_phone, remarks }
  const [remarksByDonation, setRemarksByDonation] = useState({}); // donationId -> string

  const fetchNgoData = async () => {
    if (!user?.ngo_profile?.id) return;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch claims
      const claimsResponse = await api.get('/api/donations/my-claims');
      setClaims(claimsResponse.data);

      // 2. Fetch requirements to get active listing counts
      const recResponse = await api.get('/api/ngos/nearby');
      const myNgo = recResponse.data.find(n => n.ngo_id === user.ngo_profile.id);
      if (myNgo && myNgo.food_type_needed !== 'None') {
        setReqCount(1);
      } else {
        setReqCount(0);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve NGO claims directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
  }, [user]);

  const handleUpdateStatus = async (donationId, nextStatus, customBody = {}) => {
    setError('');
    try {
      const payload = {
        status: nextStatus,
        remarks: customBody.remarks || remarksByDonation[donationId] || `Status updated to ${nextStatus}`,
        ...customBody
      };
      
      await api.put(`/api/donations/${donationId}/status`, payload);
      
      // Clear forms
      setRemarksByDonation(prev => ({ ...prev, [donationId]: '' }));
      if (nextStatus === 'PICKUP ASSIGNED') {
        setDriverInfoByDonation(prev => {
          const updated = { ...prev };
          delete updated[donationId];
          return updated;
        });
      }
      
      // Re-fetch claims
      fetchNgoData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to update donation status.');
    }
  };

  if (!user) return null;

  // Filter metrics
  const activeClaims = claims.filter(c => ['NGO ACCEPTED', 'PICKUP ASSIGNED', 'FOOD COLLECTED', 'DELIVERED'].includes(c.status));
  const completedClaims = claims.filter(c => ['DELIVERED', 'DISTRIBUTION COMPLETED'].includes(c.status));
  const totalWeightRescued = completedClaims.reduce((sum, c) => sum + parseFloat(c.quantity), 0);

  // Claim Requests inbox
  const claimRequests = claims.filter(c => c.status === 'REQUEST CREATED');

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-500 text-sm">Synchronizing profiles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Welcome back, {user.name}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Co-ordinate food pickups, claim surplus listings, and log local kitchen requirements.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 rounded-lg flex gap-2 text-sm font-semibold border border-brand-orange-500/20 items-center">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actual Live Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Active Claims"
          value={activeClaims.length.toString()}
          description="In transit or awaiting pickup"
          icon={MapPin}
          colorClass="text-brand-orange-500 bg-brand-orange-50 dark:bg-brand-orange-500/10 dark:text-brand-orange-500"
        />
        <DashboardCard
          title="Requirements Listed"
          value={reqCount.toString()}
          description="Active food requests logged"
          icon={ClipboardList}
          colorClass="text-brand-green-600 bg-brand-green-50 dark:bg-brand-green-500/10 dark:text-brand-green-500"
        />
        <DashboardCard
          title="Surplus Rescued"
          value={`${totalWeightRescued.toFixed(1)} kg`}
          description="Total delivered weight"
          icon={HeartHandshake}
          colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400"
        />
        <DashboardCard
          title="Meals Provided"
          value={Math.floor(totalWeightRescued / 0.4).toString()}
          description="Community portions served"
          icon={Utensils}
          colorClass="text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400"
        />
      </div>

      {/* Available Claims Inbox */}
      <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          Incoming Donation Claims Inbox ({claimRequests.length})
        </h3>
        {claimRequests.length === 0 ? (
          <div className="border border-slate-100 dark:border-dark-border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 p-6 text-center text-xs text-slate-400">
            No incoming donor matching requests at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {claimRequests.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-slate-100 dark:border-dark-border rounded-xl bg-slate-50/30 gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">{req.food_item}</h4>
                  <p className="text-xs text-slate-500">
                    Weight: <span className="font-bold font-mono">{req.quantity} kg</span> | Expiry: {new Date(req.expiry_time).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'NGO ACCEPTED', { remarks: 'Donation claim accepted by NGO.' })}
                    className="flex items-center gap-1 bg-brand-green-500 hover:bg-brand-green-600 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-all"
                  >
                    <Check className="w-4 h-4" /> Accept Claim
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req.id, 'cancelled', { remarks: 'Donation claim rejected by NGO.' })}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-all border border-slate-200"
                  >
                    <X className="w-4 h-4" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Claims workflow controls */}
      <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          Fulfillment Controls & Transit Progress
        </h3>
        
        {activeClaims.length === 0 ? (
          <div className="border border-slate-100 dark:border-dark-border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 p-8 text-center text-xs text-slate-400">
            No accepted claims currently in progress.
          </div>
        ) : (
          <div className="space-y-6">
            {activeClaims.map((claim) => (
              <div key={claim.id} className="p-6 border border-slate-200 dark:border-dark-border rounded-xl space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">{claim.food_item}</h4>
                    <span className="font-mono text-xs text-slate-500 font-semibold block mt-0.5">Weight: {claim.quantity} kg</span>
                  </div>
                  <span className="bg-brand-orange-500/10 text-brand-orange-600 px-3 py-1 rounded text-xs font-black uppercase">
                    {claim.status}
                  </span>
                </div>

                {/* Workflow actions based on current status */}
                {claim.status === 'NGO ACCEPTED' && (
                  <div className="space-y-4">
                    <span className="text-xs text-slate-400 uppercase font-black tracking-wider block">Assign Transport Dispatch</span>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormInput
                        label="Driver Name *"
                        id={`driver_name_${claim.id}`}
                        type="text"
                        value={driverInfoByDonation[claim.id]?.driver_name || ''}
                        onChange={(e) => setDriverInfoByDonation(p => ({
                          ...p,
                          [claim.id]: { ...(p[claim.id] || {}), driver_name: e.target.value }
                        }))}
                        placeholder="e.g. Marcus V."
                      />
                      <FormInput
                        label="Driver Phone *"
                        id={`driver_phone_${claim.id}`}
                        type="text"
                        value={driverInfoByDonation[claim.id]?.driver_phone || ''}
                        onChange={(e) => setDriverInfoByDonation(p => ({
                          ...p,
                          [claim.id]: { ...(p[claim.id] || {}), driver_phone: e.target.value }
                        }))}
                        placeholder="e.g. +1-555-9876"
                      />
                    </div>
                    <FormInput
                      label="Audit Log Note / Remarks"
                      id={`driver_remarks_${claim.id}`}
                      type="text"
                      value={driverInfoByDonation[claim.id]?.remarks || ''}
                      onChange={(e) => setDriverInfoByDonation(p => ({
                        ...p,
                        [claim.id]: { ...(p[claim.id] || {}), remarks: e.target.value }
                      }))}
                      placeholder="e.g. Driver dispatched with cooled container van."
                    />
                    <Button
                      onClick={() => {
                        const info = driverInfoByDonation[claim.id] || {};
                        if (!info.driver_name || !info.driver_phone) {
                          setError('Driver name and phone are required to dispatch transport.');
                          return;
                        }
                        handleUpdateStatus(claim.id, 'PICKUP ASSIGNED', {
                          driver_name: info.driver_name,
                          driver_phone: info.driver_phone,
                          remarks: info.remarks || 'Driver assigned for pickup.'
                        });
                      }}
                      className="py-2 px-4 text-xs font-bold uppercase tracking-wider"
                    >
                      Dispatch Pickup Driver
                    </Button>
                  </div>
                )}

                {claim.status === 'PICKUP ASSIGNED' && (
                  <div className="space-y-4">
                    <span className="text-xs text-slate-400 uppercase font-black tracking-wider block">Depot Pickup Confirmation</span>
                    <FormInput
                      label="Transition remarks"
                      id={`remarks_${claim.id}`}
                      type="text"
                      value={remarksByDonation[claim.id] || ''}
                      onChange={(e) => setRemarksByDonation(p => ({ ...p, [claim.id]: e.target.value }))}
                      placeholder="e.g. Driver verified temperature bounds and collected bags."
                    />
                    <Button
                      onClick={() => handleUpdateStatus(claim.id, 'FOOD COLLECTED')}
                      className="py-2 px-4 text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700"
                    >
                      Confirm Food Collection
                    </Button>
                  </div>
                )}

                {claim.status === 'FOOD COLLECTED' && (
                  <div className="space-y-4">
                    <span className="text-xs text-slate-400 uppercase font-black tracking-wider block">Transit Completion Confirmation</span>
                    <FormInput
                      label="Transition remarks"
                      id={`remarks_${claim.id}`}
                      type="text"
                      value={remarksByDonation[claim.id] || ''}
                      onChange={(e) => setRemarksByDonation(p => ({ ...p, [claim.id]: e.target.value }))}
                      placeholder="e.g. Food delivered successfully to main kitchen receiving bay."
                    />
                    <Button
                      onClick={() => handleUpdateStatus(claim.id, 'DELIVERED')}
                      className="py-2 px-4 text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700"
                    >
                      Confirm Delivery
                    </Button>
                  </div>
                )}

                {claim.status === 'DELIVERED' && (
                  <div className="space-y-4">
                    <span className="text-xs text-slate-400 uppercase font-black tracking-wider block">Receipt Confirmation & Portions Distribution</span>
                    <FormInput
                      label="Transition remarks"
                      id={`remarks_${claim.id}`}
                      type="text"
                      value={remarksByDonation[claim.id] || ''}
                      onChange={(e) => setRemarksByDonation(p => ({ ...p, [claim.id]: e.target.value }))}
                      placeholder="e.g. Food portioned and served to community residents."
                    />
                    <Button
                      onClick={() => handleUpdateStatus(claim.id, 'DISTRIBUTION COMPLETED')}
                      className="py-2.5 px-5 text-xs font-bold uppercase tracking-wider bg-brand-green-600 hover:bg-brand-green-700"
                    >
                      Log Receipt & Complete Distribution
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
