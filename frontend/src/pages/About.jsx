import React from 'react';
import { Target, Eye, Award, Leaf, Users, BarChart3, Zap } from 'lucide-react';

const StatCard = ({ value, label, color }) => (
  <div className="text-center p-6 rounded-2xl bg-white/60 dark:bg-white/5 border border-slate-100 dark:border-white/10 backdrop-blur-sm">
    <div className={`text-3xl font-black ${color} mb-1`}>{value}</div>
    <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{label}</div>
  </div>
);

const FeatureRow = ({ icon: Icon, title, desc, accent }) => (
  <div className="flex gap-4 items-start group">
    <div className={`p-3 rounded-xl ${accent} shrink-0 mt-0.5 transition-transform group-hover:scale-110`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 py-24 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Leaf className="w-3.5 h-3.5" /> Our Story & Mission
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Turning Surplus Into <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">Community Impact</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl mx-auto">
            ResqFood Link is a precision logistics platform built to eliminate commercial food waste by connecting donors directly with the nonprofits and communities who need it most.
          </p>
        </div>
      </div>

      {/* Stats Band */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 py-10 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard value="30%" label="Global Food Wasted" color="text-white" />
          <StatCard value="800M" label="People Food-Insecure" color="text-white" />
          <StatCard value="3.3GT" label="CO₂ from Food Waste" color="text-white" />
          <StatCard value="Zero" label="Our Waste Goal" color="text-amber-300" />
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-20 px-6 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/8 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl inline-block mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              To eliminate commercial food waste by predicting surpluses before they occur, facilitating instant NGO claims through smart matching, and tracking ecological recovery metrics transparently for every stakeholder.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-white/8 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl inline-block mb-5">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3">Our Vision</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              A waste-free world where food surplus distribution is highly optimized, predictable, and carbon-neutral — driven by collaborative, real-time technology accessible to every business and nonprofit.
            </p>
          </div>
        </div>
      </div>

      {/* How We Work */}
      <div className="py-20 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">How We Make It Work</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">Three integrated modules cover every step from prediction to distribution confirmation.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-7">
              <FeatureRow
                icon={BarChart3}
                title="Predictive Surplus Analytics"
                desc="Machine-learning regression models trained on historical donation data predict surplus quantities (in kg) before food is at risk, giving donors time to prepare collections."
                accent="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              />
              <FeatureRow
                icon={Zap}
                title="Weighted Smart Matching"
                desc="NGOs are ranked using 5 factors: food type compatibility, Haversine distance, quantity fit, NGO capacity, and urgency — ensuring the best possible match every time."
                accent="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
              />
            </div>
            <div className="space-y-7">
              <FeatureRow
                icon={Users}
                title="Real-Time Lifecycle Tracking"
                desc="Every donation passes through a verified 6-stage workflow from REQUEST CREATED to DISTRIBUTION COMPLETED, with timestamped audit logs for complete transparency."
                accent="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
              />
              <FeatureRow
                icon={Award}
                title="Environmental Pledge & Impact"
                desc="ResqFood Link partners exclusively with registered businesses and nonprofits committed to measurable ecological outcomes — tracking CO₂ savings and meals served for every delivery."
                accent="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Pledge Banner */}
      <div className="py-16 px-6 bg-gradient-to-br from-slate-900 to-emerald-950">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl inline-block mb-5">
            <Leaf className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Committed to a Greener Future</h3>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xl mx-auto">
            Every kilogram of food we redirect from landfill saves approximately 2.5 kg of CO₂ equivalent. Our platform is free for NGOs and designed to scale with every new donor partnership.
          </p>
        </div>
      </div>
    </div>
  );
}
