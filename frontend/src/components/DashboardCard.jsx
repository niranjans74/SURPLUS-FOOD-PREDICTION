import React from 'react';

export default function DashboardCard({ title, value, description, icon: Icon, colorClass = "text-brand-green-600 bg-brand-green-50 dark:bg-brand-green-500/10 dark:text-brand-green-500" }) {
  return (
    <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm flex items-center justify-between hover-scale">
      <div>
        <h4 className="text-slate-500 dark:text-slate-400 font-semibold text-sm uppercase tracking-wider">{title}</h4>
        <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">{value}</div>
        {description && <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">{description}</p>}
      </div>
      <div className={`p-4 rounded-xl ${colorClass}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </div>
  );
}
