import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, User, Info, Phone, Truck, ShieldAlert } from 'lucide-react';

export default function DonationTimeline({ donationId, currentStatus, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stages = [
    { key: 'REQUEST CREATED', label: 'Request Created', desc: 'Donor matches ML forecast and requests local NGO claim' },
    { key: 'NGO ACCEPTED', label: 'NGO Accepted', desc: 'Target NGO reviews parameters and accepts delivery' },
    { key: 'PICKUP ASSIGNED', label: 'Pickup Assigned', desc: 'NGO assigns driver dispatch coordinates' },
    { key: 'FOOD COLLECTED', label: 'Food Collected', desc: 'Driver collects surplus weight from donor depot' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Driver completes transit to NGO kitchen facility' },
    { key: 'DISTRIBUTION COMPLETED', label: 'Distribution Completed', desc: 'NGO distributes portions to community kitchen' }
  ];

  const fetchTrackingLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/donations/${donationId}/tracking`);
      setLogs(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve real-time tracking logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (donationId) {
      fetchTrackingLogs();
    }
  }, [donationId, currentStatus]);

  // Determine indices of current status
  const currentIdx = stages.findIndex(s => s.key === currentStatus);
  // If cancelled, handles fallback
  const isCancelled = currentStatus === 'cancelled';

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        <div className="w-6 h-6 border-2 border-brand-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        Reading tracking logs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-border pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Live Lifecycle Tracking</h3>
          <p className="text-xs text-slate-400">Donation ID: #{donationId} (Enforced state transitions)</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold uppercase cursor-pointer"
          >
            Close
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-500 rounded-lg text-xs font-semibold flex gap-1.5 items-center">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isCancelled ? (
        <div className="p-4 bg-brand-orange-50 dark:bg-brand-orange-500/10 border border-brand-orange-500/20 text-brand-orange-600 dark:text-brand-orange-500 rounded-xl text-center space-y-1">
          <ShieldAlert className="w-8 h-8 mx-auto mb-1" />
          <h4 className="font-bold text-sm">Donation Cancelled</h4>
          <p className="text-xs">This request lifecycle has been terminated by the donor or NGO.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-dark-border">
          {stages.map((stage, idx) => {
            const isCompleted = currentIdx >= idx;
            const isActive = currentIdx === idx;
            
            // Find DB log details for completed/active stage
            const stageLog = logs.find(l => l.status === stage.key);

            return (
              <div key={stage.key} className="relative space-y-1.5">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[24px] top-1.5 w-[12px] h-[12px] rounded-full border-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-orange-500 border-brand-orange-500 scale-125 ring-4 ring-brand-orange-500/20'
                      : isCompleted
                      ? 'bg-brand-green-500 border-brand-green-500'
                      : 'bg-white dark:bg-dark-card border-slate-300 dark:border-dark-border'
                  }`}
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                  <h4 className={`text-sm font-bold ${
                    isActive ? 'text-brand-orange-600 dark:text-brand-orange-500' : isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                  }`}>
                    {stage.label}
                  </h4>
                  {stageLog && (
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(stageLog.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {stage.desc}
                </p>

                {/* Show real DB log logs/details if they exist */}
                {stageLog && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-dark-border/40 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 mt-2">
                    <p className="font-medium flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      Remarks: "{stageLog.remarks}"
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 shrink-0" /> Updated by: {stageLog.updated_by}
                    </p>
                    
                    {/* Render driver info if present */}
                    {stageLog.driver_name && (
                      <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-blue-500 shrink-0" /> Driver: {stageLog.driver_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-blue-500 shrink-0" /> Phone: {stageLog.driver_phone}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
