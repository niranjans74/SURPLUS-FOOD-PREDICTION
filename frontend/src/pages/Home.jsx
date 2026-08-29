import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Flame, Route, TrendingUp, Compass, Award, ArrowRight, Leaf, Zap, Users, BarChart3 } from 'lucide-react';

const ModuleCard = ({ number, icon: Icon, title, desc, tag, gradient, iconBg, iconColor, tagColor }) => {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const rotateX = (y - 50) / 10;
    const rotateY = (50 - x) / 10;
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    cardRef.current.style.setProperty('--card-x', `${x}%`);
    cardRef.current.style.setProperty('--card-y', `${y}%`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = '';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 backdrop-blur-sm p-8 flex flex-col justify-between shadow-sm hover:shadow-xl group cursor-default"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(300px circle at var(--card-x, 50%) var(--card-y, 50%), ${gradient}, transparent 70%)` }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl font-black text-slate-100 dark:text-white/10 select-none leading-none">{number}</span>
          <div className={`p-2.5 rounded-xl ${iconBg} transition-transform group-hover:scale-110`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
      </div>
      <span className={`relative z-10 mt-6 text-[10px] font-black uppercase tracking-widest ${tagColor}`}>{tag}</span>
    </div>
  );
};

const StepCard = ({ num, title, desc }) => (
  <div className="text-center group">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-black text-xl mx-auto mb-4 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 group-hover:scale-110 transition-all">
      {num}
    </div>
    <h4 className="font-bold text-slate-800 dark:text-white mb-1">{title}</h4>
    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

export default function Home() {
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="flex flex-col min-h-screen mouse-glow-container"
    >
      <div className="mouse-glow-content flex flex-col min-h-screen">
        {/* ── HERO ───────────────────────────────────────────────── */}
        <header className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 py-28 px-6 md:px-12 text-center">
          {/* decorative blobs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-3xl -translate-y-1/2" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/6 rounded-full blur-3xl translate-y-1/2" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.06)_0%,transparent_70%)]" />

          <div className="relative max-w-4xl mx-auto z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-pulse">
              <Leaf className="w-3.5 h-3.5" />
              Zero Waste · Maximum Impact
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight mb-6">
              Redirect Surplus<br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-400 bg-clip-text text-transparent">
                Feed Communities
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
              ResqFood Link uses predictive analytics and smart routing to redirect commercial food surplus to verified NGOs — before it expires.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="group bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:shadow-emerald-500/40 hover:scale-105"
              >
                Join the Network
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="border border-white/15 text-slate-200 hover:bg-white/8 hover:border-white/25 font-bold px-8 py-3.5 rounded-xl transition-all backdrop-blur-sm"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative z-10 max-w-3xl mx-auto mt-16 grid grid-cols-3 gap-4">
            {[
              { v: '30%', l: 'Global Food Wasted' },
              { v: '800M', l: 'Food-Insecure People' },
              { v: '2.5kg', l: 'CO₂ per kg Redirected' },
            ].map(({ v, l }) => (
              <div key={l} className="bg-white/5 border border-white/10 rounded-xl py-4 px-3 backdrop-blur-sm">
                <div className="text-2xl font-black text-emerald-400 mb-0.5">{v}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{l}</div>
              </div>
            ))}
          </div>
        </header>

        {/* ── PROBLEM & SOLUTION ─────────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">The Challenge & Our Answer</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">Over a third of global food supply is lost or wasted. We solve this disconnect right at the commercial source.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/30 border border-rose-100 dark:border-rose-500/15">
                <div className="absolute top-4 right-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl" />
                <div className="p-3 bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 rounded-xl inline-block mb-5">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">The Waste Crisis</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  Supermarkets, hotels, and caterers routinely dispose of perfectly edible surplus food due to lack of real-time supply visibility, transport delays, and short shelf lives.
                </p>
              </div>

              <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-500/15">
                <div className="absolute top-4 right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl inline-block mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">The ResqFood Bridge</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  We provide a fully integrated digital coordination model. Donors report surplus easily; NGOs receive instant smart matches; logistics partners execute verified pickups immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── THREE CORE MODULES ─────────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-emerald-600 dark:text-emerald-500 text-xs font-black uppercase tracking-widest">Core Modules</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2 mb-3">Engineered for Sustainable Impact</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">Three precision modules covering the full food redistribution lifecycle.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <ModuleCard
                number="01"
                icon={TrendingUp}
                title="Surplus Prediction"
                desc="Leverages historical data and regression models to forecast excess food quantities. Donors prepare collection containers before surplus occurs."
                tag="Predictive Analytics"
                gradient="rgba(5, 150, 105, 0.08)"
                iconBg="bg-emerald-100 dark:bg-emerald-500/15"
                iconColor="text-emerald-600 dark:text-emerald-400"
                tagColor="text-emerald-600 dark:text-emerald-500"
              />
              <ModuleCard
                number="02"
                icon={Route}
                title="Smart Routing"
                desc="Haversine-calculated distances, 5-factor weighted NGO scoring, and real Leaflet/OSM map overlays for verified physical routing."
                tag="Geographic Optimization"
                gradient="rgba(217, 119, 6, 0.08)"
                iconBg="bg-amber-100 dark:bg-amber-500/15"
                iconColor="text-amber-600 dark:text-amber-400"
                tagColor="text-amber-600 dark:text-amber-500"
              />
              <ModuleCard
                number="03"
                icon={Compass}
                title="Distribution & Impact"
                desc="6-stage lifecycle tracking with timestamped audit logs, Recharts analytics dashboards, and real-time ecological impact metrics."
                tag="Real-Time Auditing"
                gradient="rgba(99, 102, 241, 0.08)"
                iconBg="bg-indigo-100 dark:bg-indigo-500/15"
                iconColor="text-indigo-600 dark:text-indigo-400"
                tagColor="text-indigo-600 dark:text-indigo-400"
              />
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 bg-white dark:bg-slate-950">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Seamless Distribution Workflow</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">From commercial surplus to community meals — four coordinated steps.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* connector line */}
              <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 dark:from-emerald-900 dark:via-emerald-600 dark:to-emerald-900" />
              <StepCard num={1} title="Forecasting" desc="Surplus models forecast food quantities before expiry risk." />
              <StepCard num={2} title="Logging" desc="Donors log available items with shelf-life and location." />
              <StepCard num={3} title="Matching" desc="NGOs receive smart match scores and claim donations." />
              <StepCard num={4} title="Delivery" desc="Drivers route food with live tracking and confirmation." />
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ─────────────────────────────────────────── */}
        <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black text-white mb-4">Ready to Make a Difference?</h2>
            <p className="text-emerald-100 mb-8 text-sm leading-relaxed">Join hundreds of donors and NGOs already redirecting surplus food to communities in need.</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              Get Started Today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
