import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, TrendingUp, HandHelping, ClipboardList, UserCheck, MapPin } from 'lucide-react';

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const linksByRole = {
    donor: [
      { to: '/donor', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/donor/prediction', label: 'Surplus Prediction', icon: TrendingUp },
      { to: '/donor/donations', label: 'Food Donations', icon: HandHelping },
    ],
    ngo: [
      { to: '/ngo', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/ngo/claim', label: 'Claim Donations', icon: MapPin },
      { to: '/ngo/requirements', label: 'Food Requirements', icon: ClipboardList },
    ],
    admin: [
      { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
      { to: '/admin/donors', label: 'Manage Donors', icon: UserCheck },
      { to: '/admin/ngos', label: 'Manage NGOs', icon: ClipboardList },
    ],
  };

  const currentLinks = linksByRole[user.role] || [];
  
  const getProfileTitle = () => {
    if (user.role === 'donor') return user.donor_profile?.company_name || 'Donor Profile';
    if (user.role === 'ngo') return user.ngo_profile?.organization_name || 'NGO Profile';
    return 'Admin Control';
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-[calc(100vh-73px)] p-6 flex flex-col justify-between">
      <div>
        <div className="mb-8 border-b border-slate-800 pb-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Authenticated As</h3>
          <p className="font-semibold text-lg text-brand-green-500 mt-1 truncate">{getProfileTitle()}</p>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1 uppercase font-semibold">
            {user.role}
          </span>
        </div>
        
        <nav className="space-y-2">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end
                className={({ isActive }) => 
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-brand-green-600 text-white font-semibold shadow-md shadow-brand-green-600/30' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 text-xs text-slate-500">
        <p>© 2026 ResqFood Link</p>
        <p className="mt-1">Sustainable Food Platform</p>
      </div>
    </aside>
  );
}
