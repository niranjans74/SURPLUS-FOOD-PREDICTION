import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Trophy, ArrowRight, MapPin, Compass, AlertCircle, RefreshCw, BarChart2, Eye, EyeOff } from 'lucide-react';

export default function NgoRecommendations() {
  const [searchParams] = useSearchParams();
  const predictionId = searchParams.get('prediction_id');

  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBreakdown, setShowBreakdown] = useState({}); // ngoId -> boolean

  const fetchRecommendations = async () => {
    if (!predictionId) {
      setError('Missing prediction_id in URL parameters.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Get prediction details from predictions list (or we can just fetch recommendations directly)
      const recResponse = await api.get(`/api/ngos/recommendations?prediction_id=${predictionId}`);
      setRecommendations(recResponse.data);
      
      // Let's retrieve predictions list for the history log to find our specific prediction features
      // Or we can mock the prediction title details from response data since we know the prediction_id
      if (recResponse.data.length > 0) {
        // We can just calculate prediction details
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to retrieve NGO recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [predictionId]);

  const toggleBreakdown = (ngoId) => {
    setShowBreakdown(prev => ({ ...prev, [ngoId]: !prev[ngoId] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 text-sm font-semibold">Running weighted match-scoring service...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 glass-card rounded-xl border border-brand-orange-500/20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-brand-orange-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Matching Error</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <Link to="/donor/prediction" className="inline-block bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
          Back to surplus prediction
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Compass className="w-8 h-8 text-brand-green-500 animate-spin-slow" />
            Smart NGO Recommendations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time ranked compatibility scores matching your surplus prediction to approved food charities.
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-dark-border rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-Evaluate
        </button>
      </div>

      {recommendations.length === 0 ? (
        <div className="glass-card p-12 text-center border border-dashed rounded-xl border-slate-200 dark:border-dark-border">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-semibold">No Matching NGOs Found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Ensure that local NGOs have published their active requirements and food compatibility rules.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((ngo, index) => {
            const isTopMatch = index === 0;
            const openBreakdown = showBreakdown[ngo.ngo_id] || false;
            
            return (
              <div
                key={ngo.ngo_id}
                className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isTopMatch
                    ? 'border-brand-green-500 bg-gradient-to-br from-white to-brand-green-50/10 dark:from-dark-card dark:to-brand-green-500/5 shadow-lg shadow-brand-green-500/5 ring-1 ring-brand-green-500/20'
                    : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card'
                }`}
              >
                {/* Top Badge */}
                {isTopMatch && (
                  <div className="bg-brand-green-500 text-white text-[10px] uppercase font-black tracking-widest px-4 py-1.5 inline-flex items-center gap-1 rounded-br-xl">
                    <Trophy className="w-3 h-3" /> Recommended Top Compatibility
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-6">
                  {/* NGO header & score */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        {ngo.organization_name}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        {ngo.address || 'Address not listed'}
                      </p>
                    </div>

                    {/* Match Score Indicator */}
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-dark-border shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Match Score</span>
                        <span className={`text-2xl font-black ${
                          ngo.match_score >= 80 ? 'text-brand-green-500' : ngo.match_score >= 50 ? 'text-yellow-500' : 'text-brand-orange-500'
                        }`}>
                          {ngo.match_score}%
                        </span>
                      </div>
                      <div className={`w-2 h-10 rounded-full ${
                        ngo.match_score >= 80 ? 'bg-brand-green-500' : ngo.match_score >= 50 ? 'bg-yellow-500' : 'bg-brand-orange-500'
                      }`} />
                    </div>
                  </div>

                  {/* Operational Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-100 dark:border-dark-border/40 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">Distance</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white mt-0.5 block">
                        {ngo.distance_km} km
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">Quantity Needed</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white mt-0.5 block">
                        {ngo.quantity_needed} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">Max Storage Capacity</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-white mt-0.5 block">
                        {ngo.capacity ? `${ngo.capacity} kg` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">Urgency Status</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider mt-1 ${
                        ngo.urgency_level === 'high'
                          ? 'bg-brand-orange-100 text-brand-orange-700 dark:bg-brand-orange-500/10 dark:text-brand-orange-500'
                          : ngo.urgency_level === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500'
                          : 'bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-500/10 dark:text-brand-green-500'
                      }`}>
                        {ngo.urgency_level}
                      </span>
                    </div>
                  </div>

                  {/* Accepted food categories */}
                  <div className="text-sm">
                    <span className="text-xs text-slate-400 font-bold block mb-1.5">Accepted Food Categories:</span>
                    <div className="flex flex-wrap gap-2">
                      {ngo.food_type_needed.split(',').map((type) => (
                        <span key={type} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-1 rounded-md capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Explainable details section */}
                  <div className="border-t border-slate-100 dark:border-dark-border/50 pt-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => toggleBreakdown(ngo.ngo_id)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-green-500 font-bold uppercase tracking-wider cursor-pointer"
                      >
                        <BarChart2 className="w-4 h-4" />
                        {openBreakdown ? 'Hide Match Details' : 'Explain Match Breakdown'}
                      </button>

                      {/* Route Page redirection */}
                      <Link to={`/donor/route?prediction_id=${predictionId}&ngo_id=${ngo.ngo_id}`}>
                        <button className="flex items-center gap-1 px-4 py-2 bg-brand-green-600 hover:bg-brand-green-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-200 cursor-pointer">
                          Select & View Route <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </Link>
                    </div>

                    {/* Score Breakdown visualization */}
                    {openBreakdown && (
                      <div className="p-5 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-dark-border/60 rounded-xl space-y-4 animate-fade-in text-sm">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                          Weighted Component Diagnostics
                        </h4>
                        
                        <div className="space-y-4">
                          {/* 1. Food Type Compatibility */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Food Compatibility (30% weight)</span>
                              <span className="text-slate-700 dark:text-slate-300 font-mono">
                                {ngo.breakdown.food_type.score}% (Score: {ngo.breakdown.food_type.weighted}/30.0)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${ngo.breakdown.food_type.score}%` }} />
                            </div>
                            <p className="text-[11px] text-slate-400 italic">{ngo.breakdown.food_type.detail}</p>
                          </div>

                          {/* 2. Distance */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Distance Compatibility (25% weight)</span>
                              <span className="text-slate-700 dark:text-slate-300 font-mono">
                                {ngo.breakdown.distance.score}% (Score: {ngo.breakdown.distance.weighted}/25.0)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${ngo.breakdown.distance.score}%` }} />
                            </div>
                            <p className="text-[11px] text-slate-400 italic">{ngo.breakdown.distance.detail}</p>
                          </div>

                          {/* 3. Quantity Fit */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Quantity Fit (20% weight)</span>
                              <span className="text-slate-700 dark:text-slate-300 font-mono">
                                {ngo.breakdown.quantity_fit.score}% (Score: {ngo.breakdown.quantity_fit.weighted}/20.0)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${ngo.breakdown.quantity_fit.score}%` }} />
                            </div>
                            <p className="text-[11px] text-slate-400 italic">{ngo.breakdown.quantity_fit.detail}</p>
                          </div>

                          {/* 4. NGO Capacity */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">NGO Capacity Limit (15% weight)</span>
                              <span className="text-slate-700 dark:text-slate-300 font-mono">
                                {ngo.breakdown.capacity.score}% (Score: {ngo.breakdown.capacity.weighted}/15.0)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${ngo.breakdown.capacity.score}%` }} />
                            </div>
                            <p className="text-[11px] text-slate-400 italic">{ngo.breakdown.capacity.detail}</p>
                          </div>

                          {/* 5. Urgency */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-500">Urgency Level (10% weight)</span>
                              <span className="text-slate-700 dark:text-slate-300 font-mono">
                                {ngo.breakdown.urgency.score}% (Score: {ngo.breakdown.urgency.weighted}/10.0)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div className="bg-brand-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${ngo.breakdown.urgency.score}%` }} />
                            </div>
                            <p className="text-[11px] text-slate-400 italic">{ngo.breakdown.urgency.detail}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
