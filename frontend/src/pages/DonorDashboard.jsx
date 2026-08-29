import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import DashboardCard from '../components/DashboardCard';
import DonationTimeline from '../components/DonationTimeline';
import { TrendingUp, PackageOpen, Award, CheckCircle, Clock, Eye, AlertCircle } from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [predictions, setPredictions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected donation for timeline modal
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchDashboardData = async () => {
    if (!user?.donor_profile?.id) return;
    setLoading(true);
    setError('');
    try {
      // 1. Fetch prediction history
      const predResponse = await api.get(`/api/predictions/${user.donor_profile.id}`);
      setPredictions(predResponse.data.slice(0, 5)); // show recent 5

      // 2. Fetch donations listings
      const donResponse = await api.get('/api/donations/my-donations');
      setDonations(donResponse.data);

      // 3. Fetch global/personal analytics
      const analyticsResponse = await api.get('/api/analytics');
      setAnalytics(analyticsResponse.data);

    } catch (err) {
      console.error(err);
      setError('Failed to sync dashboard metrics with platform databases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  if (!user) return null;

  // Filter donor-specific metrics from donations lists
  const myCompletedDonations = donations.filter(d => ['DELIVERED', 'DISTRIBUTION COMPLETED'].includes(d.status));
  const myCompletedWeight = myCompletedDonations.reduce((sum, d) => sum + parseFloat(d.quantity), 0);
  const activeDonationsCount = donations.filter(d => !['cancelled', 'DISTRIBUTION COMPLETED', 'DELIVERED'].includes(d.status)).length;
  
  // Predicted surplus sum
  const totalPredictedSurplus = predictions.reduce((sum, p) => sum + parseFloat(p.predicted_quantity), 0);

  if (loading && predictions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-500 text-sm">Synchronizing profiles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Timeline Modal overlay */}
      {selectedDonation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-6 rounded-2xl max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <DonationTimeline
              donationId={selectedDonation.id}
              currentStatus={selectedDonation.status}
              onClose={() => setSelectedDonation(null)}
            />
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Welcome back, {user.name}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Monitor your commercial food surplus, predictions, and ecological contributions.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 rounded-lg flex gap-2 text-sm font-medium border border-brand-orange-500/20 items-center">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actual Live Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Predicted Surplus"
          value={`${totalPredictedSurplus.toFixed(1)} kg`}
          description="Accumulated forecasting runs"
          icon={TrendingUp}
          colorClass="text-brand-green-600 bg-brand-green-50 dark:bg-brand-green-500/10 dark:text-brand-green-500"
        />
        <DashboardCard
          title="Active Claims"
          value={activeDonationsCount.toString()}
          description="Rescues currently in progress"
          icon={PackageOpen}
          colorClass="text-brand-orange-500 bg-brand-orange-50 dark:bg-brand-orange-500/10 dark:text-brand-orange-500"
        />
        <DashboardCard
          title="Rescues Completed"
          value={myCompletedDonations.length.toString()}
          description="Delivered to local NGOs"
          icon={CheckCircle}
          colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400"
        />
        <DashboardCard
          title="Est. Carbon Rescued"
          value={`${(myCompletedWeight * 2.5).toFixed(1)} kg CO₂`}
          description="Estimated Impact Indicators"
          icon={Award}
          colorClass="text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Predictions Panel */}
        <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              Recent Surplus Forecasts
            </h3>
            {predictions.length === 0 ? (
              <div className="border border-slate-100 dark:border-dark-border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 p-8 text-center">
                <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  No Predictions Generated Yet
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Once you log operational parameters, the regression model will predict your food surplus here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-dark-border text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Predicted</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100 dark:border-dark-border/40 hover:bg-slate-50/50">
                        <td className="py-3 px-3 text-slate-500">{new Date(p.predicted_at).toLocaleDateString()}</td>
                        <td className="py-3 px-3 capitalize">{p.features?.food_category?.replace('_', ' ') || 'other'}</td>
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{p.predicted_quantity} kg</td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => navigate(`/donor/recommendations?prediction_id=${p.id}`)}
                            className="bg-brand-green-500/10 text-brand-green-600 dark:text-brand-green-500 text-[10px] font-bold px-2 py-1 rounded hover:bg-brand-green-500 hover:text-white transition-all cursor-pointer"
                          >
                            Match NGOs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/donor/prediction')}
            className="mt-6 text-xs text-brand-green-600 hover:text-brand-green-700 font-bold uppercase tracking-wider text-left flex items-center gap-1 cursor-pointer"
          >
            Compute New Surplus Forecast &rarr;
          </button>
        </div>

        {/* Listings Panel */}
        <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            Active Food Listings
          </h3>
          {donations.length === 0 ? (
            <div className="border border-slate-100 dark:border-dark-border rounded-lg bg-slate-50/50 dark:bg-slate-900/30 p-8 text-center">
              <PackageOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No Active Food Listings
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Your logged surplus donations will appear here for local NGOs to view and claim.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-dark-border text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100 dark:border-dark-border/40 hover:bg-slate-50/50 text-slate-600 dark:text-slate-300">
                      <td className="py-3 px-3 font-bold truncate max-w-[120px]">{d.food_item}</td>
                      <td className="py-3 px-3 font-mono">{d.quantity} {d.unit}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          ['DELIVERED', 'DISTRIBUTION COMPLETED'].includes(d.status)
                            ? 'bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-500/10 dark:text-brand-green-500'
                            : d.status === 'cancelled'
                            ? 'bg-brand-orange-100 text-brand-orange-700 dark:bg-brand-orange-500/10 dark:text-brand-orange-500'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500'
                        }`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedDonation(d)}
                          className="text-slate-500 hover:text-brand-green-500 font-bold transition-all flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" /> Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
