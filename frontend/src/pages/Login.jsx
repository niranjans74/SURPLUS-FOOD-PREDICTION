import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { ShieldAlert, User, Key, Building2 } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'donor' // 'donor', 'ngo', 'admin'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password, formData.role);
      
      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'ngo') {
        navigate('/ngo');
      } else {
        navigate('/donor');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Login failed. Please check your credentials and selected role.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-6">
      <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-dark-border shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Sign In</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Access ResqFood Link platform
          </p>
        </div>

        {/* Role Tabs Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('donor')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              formData.role === 'donor'
                ? 'bg-white dark:bg-dark-card text-brand-green-600 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Donor
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('ngo')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              formData.role === 'ngo'
                ? 'bg-white dark:bg-dark-card text-brand-green-600 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            NGO
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              formData.role === 'admin'
                ? 'bg-white dark:bg-dark-card text-brand-orange-500 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Admin
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 rounded-lg flex gap-2 text-xs font-medium border border-brand-orange-500/20 items-center">
            <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />

          <FormInput
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
            variant={formData.role === 'admin' ? 'danger' : 'primary'}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>New to ResqFood Link? </span>
          <Link to="/register" className="text-brand-green-600 hover:text-brand-green-700 font-bold transition-all">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
