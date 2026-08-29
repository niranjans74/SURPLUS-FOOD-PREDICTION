import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Leaf, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-bg/85 backdrop-blur-md border-b border-slate-200 dark:border-dark-border py-4 px-6 md:px-12 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-green-600 dark:text-brand-green-500">
        <Leaf className="w-6 h-6 animate-pulse" />
        <span>ResqFood <span className="text-brand-orange-500 font-medium">Link</span></span>
      </Link>
      
      <div className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <Link to="/" className="hover:text-brand-green-600 dark:hover:text-brand-green-500 transition-colors">Home</Link>
        <Link to="/about" className="hover:text-brand-green-600 dark:hover:text-brand-green-500 transition-colors">About</Link>
        <Link to="/contact" className="hover:text-brand-green-600 dark:hover:text-brand-green-500 transition-colors">Contact</Link>
        
        {user ? (
          <div className="flex items-center gap-4">
            <Link 
              to={user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/donor'} 
              className="flex items-center gap-1.5 bg-brand-green-50 text-brand-green-600 dark:bg-brand-green-500/10 dark:text-brand-green-500 px-3 py-1.5 rounded-full hover:bg-brand-green-100 dark:hover:bg-brand-green-500/20 transition-all font-semibold"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-dark-border pl-4">
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{user.name}</span>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-brand-orange-500 dark:hover:text-brand-orange-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-dark-border">
            <Link to="/login" className="text-slate-600 dark:text-slate-300 hover:text-brand-green-600 dark:hover:text-brand-green-500 font-medium transition-colors">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-brand-green-600 hover:bg-brand-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm shadow-brand-green-500/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
