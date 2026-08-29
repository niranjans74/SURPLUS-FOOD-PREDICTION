import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import DashboardCard from '../components/DashboardCard';
import { Users, Building, HeartHandshake, ShieldAlert, BarChart3, TrendingUp, Check, X, Award, CheckCircle, PackageOpen, Utensils } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const CHART_COLORS = ['#10b981', '#ea580c', '#3b82f6', '#8b5cf6', '#eab308', '#f43f5e'];

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  
  const [donors, setDonors] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('donors'); // 'donors' or 'ngos' or 'analytics'

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const donorsResponse = await api.get('/api/admin/donors');
      const ngosResponse = await api.get('/api/admin/ngos');
      setDonors(donorsResponse.data);
      setNgos(ngosResponse.data);

      const analyticsResponse = await api.get('/api/analytics');
      setAnalytics(analyticsResponse.data);
    } catch (err) {
      console.error("Error retrieving admin details:", err);
      setError("Failed to retrieve platform directories. Verify backend API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateUserStatus = async (role, id, newStatus) => {
    setError('');
    try {
      const endpoint = role === 'donor' ? `/api/admin/donors/${id}/status` : `/api/admin/ngos/${id}/status`;
      await api.put(endpoint, { status: newStatus });
      // Refresh directories
      fetchAdminData();
    } catch (err) {
      console.error(err);
      setError(`Failed to update ${role} approval status.`);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Admin Control Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review platforms listings, approve organizations, and audit redistribution transactions.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 rounded-lg flex gap-2 text-sm font-medium border border-brand-orange-500/20 items-center">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Admin Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <DashboardCard
          title="Registered Donors"
          value={loading ? "..." : donors.length}
          description="Commercial businesses"
          icon={Building}
          colorClass="text-brand-green-600 bg-brand-green-50 dark:bg-brand-green-500/10 dark:text-brand-green-500"
        />
        <DashboardCard
          title="Registered NGOs"
          value={loading ? "..." : ngos.length}
          description="Local food charities"
          icon={HeartHandshake}
          colorClass="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400"
        />
        <DashboardCard
          title="Active Users"
          value={loading ? "..." : donors.length + ngos.length + 1}
          description="Redistribution directory"
          icon={Users}
          colorClass="text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400"
        />
        <DashboardCard
          title="Total Rescued"
          value={loading || !analytics ? "0.0 kg" : `${analytics.total_donated_weight} kg`}
          description="Delivered weight log"
          icon={CheckCircle}
          colorClass="text-brand-green-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <DashboardCard
          title="Meals Provided"
          value={loading || !analytics ? "0" : analytics.meals_served.toString()}
          description="Est. Portions Served"
          icon={Utensils}
          colorClass="text-pink-600 bg-pink-50 dark:bg-pink-500/10 dark:text-pink-400"
        />
        <DashboardCard
          title="Carbon Prevented"
          value={loading || !analytics ? "0 kg" : `${analytics.co2_saved} kg`}
          description="Waste Reduction Est."
          icon={Award}
          colorClass="text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400"
        />
      </div>

      {/* Directory & Analytics Navigation Tabs */}
      <div className="glass-card rounded-xl border border-slate-200 dark:border-dark-border overflow-hidden bg-white">
        <div className="flex border-b border-slate-200 dark:border-dark-border bg-slate-50/50 dark:bg-slate-900/20 px-6 py-3">
          <button
            onClick={() => setActiveTab('donors')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'donors'
                ? 'border-brand-green-600 text-brand-green-600 dark:text-brand-green-500'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Registered Donors List ({donors.length})
          </button>
          <button
            onClick={() => setActiveTab('ngos')}
            className={`ml-4 px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'ngos'
                ? 'border-brand-green-600 text-brand-green-600 dark:text-brand-green-500'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Registered NGOs List ({ngos.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`ml-4 px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-brand-green-600 text-brand-green-600 dark:text-brand-green-500'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Redistribution Analytics Charts
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-sm text-slate-400">
              Syncing configurations with databases...
            </div>
          ) : activeTab === 'donors' ? (
            donors.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">No donors registered in platform databases.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-dark-border text-slate-500 font-semibold uppercase">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Company Name</th>
                      <th className="py-3 px-4">Donor Type</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Approval Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map((donor) => (
                      <tr key={donor.id} className="border-b border-slate-100 dark:border-dark-border/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono">{donor.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">{donor.company_name}</td>
                        <td className="py-3.5 px-4 capitalize">{donor.donor_type}</td>
                        <td className="py-3.5 px-4 truncate max-w-xs">{donor.address || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            donor.approval_status === 'approved' 
                              ? 'bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-500/10 dark:text-brand-green-500'
                              : donor.approval_status === 'rejected'
                              ? 'bg-brand-orange-100 text-brand-orange-700 dark:bg-brand-orange-500/10 dark:text-brand-orange-500'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500'
                          }`}>
                            {donor.approval_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {donor.approval_status === 'pending' && (
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleUpdateUserStatus('donor', donor.id, 'approved')}
                                className="bg-brand-green-500 hover:bg-brand-green-600 text-white font-bold p-1.5 rounded transition-all cursor-pointer"
                                title="Approve Donor"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleUpdateUserStatus('donor', donor.id, 'rejected')}
                                className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold p-1.5 rounded transition-all cursor-pointer"
                                title="Reject Donor"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeTab === 'ngos' ? (
            ngos.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">No NGOs registered in platform databases.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-dark-border text-slate-500 font-semibold uppercase">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Organization Name</th>
                      <th className="py-3 px-4">Reg Number</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Approval Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ngos.map((ngo) => (
                      <tr key={ngo.id} className="border-b border-slate-100 dark:border-dark-border/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono">{ngo.id}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100">{ngo.organization_name}</td>
                        <td className="py-3.5 px-4">{ngo.registration_number || 'N/A'}</td>
                        <td className="py-3.5 px-4 truncate max-w-xs">{ngo.address || 'N/A'}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            ngo.approval_status === 'approved' 
                              ? 'bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-500/10 dark:text-brand-green-500'
                              : ngo.approval_status === 'rejected'
                              ? 'bg-brand-orange-100 text-brand-orange-700 dark:bg-brand-orange-500/10 dark:text-brand-orange-500'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500'
                          }`}>
                            {ngo.approval_status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {ngo.approval_status === 'pending' && (
                            <div className="flex gap-1 justify-end">
                              <button
                                onClick={() => handleUpdateUserStatus('ngo', ngo.id, 'approved')}
                                className="bg-brand-green-500 hover:bg-brand-green-600 text-white font-bold p-1.5 rounded transition-all cursor-pointer"
                                title="Approve NGO"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleUpdateUserStatus('ngo', ngo.id, 'rejected')}
                                className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white font-bold p-1.5 rounded transition-all cursor-pointer"
                                title="Reject NGO"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* Analytics Charts */
            analytics && (
              <div className="space-y-8 pt-4">
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-500 block">Redistribution Efficiency Rate</span>
                  <span className="font-mono font-black text-brand-green-600 text-lg block">
                    {analytics.waste_reduction_efficiency}% Prevented Waste
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Monthly Donations Trend */}
                  <div className="glass-card p-6 rounded-xl border border-slate-100 shadow-sm bg-slate-50/20">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-brand-green-500" /> Monthly Rescued Food Volume (kg)
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.monthly_trends}>
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                          <YAxis stroke="#94a3b8" fontSize={10} />
                          <Tooltip />
                          <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Food Category Pie Distribution */}
                  <div className="glass-card p-6 rounded-xl border border-slate-100 shadow-sm bg-slate-50/20">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-brand-green-500" /> Food Category Distribution (kg)
                    </h4>
                    <div className="h-64 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="h-full w-full max-w-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.category_distribution}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={75}
                              paddingAngle={3}
                            >
                              {analytics.category_distribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-500 shrink-0 w-full sm:w-auto">
                        {analytics.category_distribution.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                            <span>{entry.name}: <strong>{entry.value} kg</strong></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Status counter */}
                  <div className="glass-card p-6 rounded-xl border border-slate-100 shadow-sm bg-slate-50/20">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-brand-green-500" /> Current Listing Status Counts
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.status_distribution}>
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                          <YAxis stroke="#94a3b8" fontSize={10} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Contributions breakdown */}
                  <div className="glass-card p-6 rounded-xl border border-slate-100 shadow-sm bg-slate-50/20">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-brand-green-500" /> Organization Rescue Leaderboard (kg)
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.contributions} layout="vertical">
                          <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={120} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
