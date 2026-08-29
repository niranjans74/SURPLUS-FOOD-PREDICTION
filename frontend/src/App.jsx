import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthProvider, { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DonorPrediction from './pages/DonorPrediction';
import NgoRecommendations from './pages/NgoRecommendations';
import SmartRoute from './pages/SmartRoute';
import NgoRequirements from './pages/NgoRequirements';
import 'leaflet/dist/leaflet.css';

// Route Guard for role-based routes
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultDashboard = user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/donor';
    return <Navigate to={defaultDashboard} replace />;
  }

  return <Outlet />;
};

// Route Guard for unauthenticated routes (redirects if logged in)
const PublicOnlyRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (user) {
    const defaultDashboard = user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo' : '/donor';
    return <Navigate to={defaultDashboard} replace />;
  }

  return <Outlet />;
};

// Layout for dashboard area with sidebar
const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Layout for public branding pages
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-bg">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 text-center border-t border-slate-800 text-xs">
        <p className="font-semibold text-slate-300">ResqFood Link Platform</p>
        <p className="mt-1">Eco-friendly Food Surplus Redistribution Network.</p>
        <p className="mt-4 text-slate-600">Dedicated to minimizing local food waste and protecting our ecological environment.</p>
      </footer>
    </div>
  );
};

// Placeholder sub-pages for future blocks
const PlaceholderPage = ({ title, description }) => (
  <div className="glass-card p-8 rounded-xl border border-slate-200 dark:border-dark-border text-center py-16">
    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h2>
    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">{description}</p>
    <div className="inline-block bg-brand-orange-50 text-brand-orange-600 dark:bg-brand-orange-500/10 dark:text-brand-orange-500 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
      Under Development in Next Block
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Branding Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Authenticated redirect for login/register */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          {/* Protected Donor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/donor" element={<DonorDashboard />} />
              <Route 
                path="/donor/prediction" 
                element={<DonorPrediction />} 
              />
              <Route 
                path="/donor/recommendations" 
                element={<NgoRecommendations />} 
              />
              <Route 
                path="/donor/route" 
                element={<SmartRoute />} 
              />
              <Route 
                path="/donor/donations" 
                element={<PlaceholderPage title="Food Donations Log" description="Log excess food items, shelf life, and mark available listings for local NGO claims." />} 
              />
            </Route>
          </Route>

          {/* Protected NGO Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ngo']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/ngo" element={<NgoDashboard />} />
              <Route 
                path="/ngo/claim" 
                element={<PlaceholderPage title="Claim Donations & Smart Routing" description="Query available local donations and view Leaflet/OSM physical transit maps." />} 
              />
              <Route 
                path="/ngo/requirements" 
                element={<NgoRequirements />} 
              />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route 
                path="/admin/donors" 
                element={<PlaceholderPage title="Manage Donors" description="Approve or decline registered commercial donors, verifying business profiles." />} 
              />
              <Route 
                path="/admin/ngos" 
                element={<PlaceholderPage title="Manage NGOs" description="Verify NGO registration status certificates and adjust approval criteria." />} 
              />
            </Route>
          </Route>

          {/* Catch-All redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
