import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { ShieldAlert, MapPin, Building, HeartHandshake, Check, X } from 'lucide-react';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'donor', // 'donor' or 'ngo'
    
    // Donor profile
    company_name: '',
    donor_type: 'restaurant', // 'restaurant', 'supermarket', 'hotel', 'caterer', 'other'
    
    // NGO profile
    organization_name: '',
    registration_number: '',
    
    // Shared profile
    address: '',
    latitude: '',
    longitude: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  // Live password validation checks
  const password = formData.password;
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let strengthScore = 0;
  if (password.length > 0) {
    if (hasMinLength) strengthScore += 1;
    if (hasUppercase) strengthScore += 1;
    if (hasSpecial) strengthScore += 1;
  }

  const getStrengthLabel = () => {
    if (strengthScore === 1) return { text: 'Weak', color: 'text-rose-500', barBg: 'bg-rose-500 w-1/3' };
    if (strengthScore === 2) return { text: 'Medium', color: 'text-amber-500', barBg: 'bg-amber-500 w-2/3' };
    if (strengthScore === 3) return { text: 'Strong & Secure', color: 'text-emerald-500', barBg: 'bg-emerald-500 w-full' };
    return { text: 'None', color: 'text-slate-400', barBg: 'bg-slate-200 dark:bg-slate-800 w-0' };
  };

  const strength = getStrengthLabel();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    setError('');
  };

  const getGeolocation = () => {
    setLocating(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Using default coordinates.');
      setFormData((prev) => ({
        ...prev,
        latitude: '12.97160000',
        longitude: '77.59460000'
      }));
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(8),
          longitude: position.coords.longitude.toFixed(8)
        }));
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation permission denied. Using default coordinates.");
        setFormData((prev) => ({
          ...prev,
          latitude: '12.97160000',
          longitude: '77.59460000'
        }));
        setLocating(false);
      },
      { timeout: 5000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation constraint checks
    if (!hasMinLength || !hasUppercase || !hasSpecial) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter, and one special character.');
      return;
    }

    setLoading(true);

    const submitData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone || null,
      role: formData.role,
      address: formData.address || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    };

    if (formData.role === 'donor') {
      submitData.company_name = formData.company_name;
      submitData.donor_type = formData.donor_type;
    } else {
      submitData.organization_name = formData.organization_name;
      submitData.registration_number = formData.registration_number || null;
    }

    try {
      await register(submitData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Registration failed. Please check the fields and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-16 px-6">
      <div className="glass-card p-8 rounded-2xl border border-slate-200 dark:border-dark-border shadow-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Register your profile to start redistributing food surplus
          </p>
        </div>

        {/* Role Tabs Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1.5 rounded-xl mb-6 max-w-sm mx-auto">
          <button
            type="button"
            onClick={() => handleRoleChange('donor')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              formData.role === 'donor'
                ? 'bg-white dark:bg-dark-card text-brand-green-600 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            Commercial Donor
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('ngo')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              formData.role === 'ngo'
                ? 'bg-white dark:bg-dark-card text-brand-green-600 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            NGO / Charity
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 rounded-lg flex gap-2 text-xs font-medium border border-brand-orange-500/20 items-center">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-brand-green-50 dark:bg-brand-green-500/10 text-brand-green-600 dark:text-brand-green-500 rounded-lg flex gap-2 text-xs font-medium border border-brand-green-500/20 items-center">
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-dark-border pb-1.5">
            Account Credentials
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormInput
              label="Email Address"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.org"
              required
            />
            <div className="flex flex-col gap-1 w-full">
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
              
              {/* Password Strength Indicators */}
              {password.length > 0 && (
                <div className="mt-2.5 space-y-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-dark-border/40 transition-all duration-300">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-400">PASSWORD STRENGTH</span>
                    <span className={strength.color}>{strength.text.toUpperCase()}</span>
                  </div>
                  
                  {/* Strength Bar */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${strength.barBg}`}></div>
                  </div>
                  
                  {/* Validation Criteria Ticks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[9px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1">
                      {hasMinLength ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                      )}
                      <span className={hasMinLength ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>8+ Characters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasUppercase ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                      )}
                      <span className={hasUppercase ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>1+ Uppercase</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasSpecial ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
                      )}
                      <span className={hasSpecial ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>1+ Special Char</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FormInput
              label="Contact Representative Name"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
            <FormInput
              label="Phone Number"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 0123"
            />
          </div>

          {/* Role specific forms */}
          {formData.role === 'donor' ? (
            <>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-dark-border pb-1.5 pt-4">
                Donor Profile Details
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormInput
                  label="Company Name"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="e.g. GreenFields Supermarket"
                  required
                />
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="donor_type" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Donor Type <span className="text-brand-orange-500">*</span>
                  </label>
                  <select
                    id="donor_type"
                    name="donor_type"
                    value={formData.donor_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 transition-all text-sm"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="supermarket">Supermarket</option>
                    <option value="hotel">Hotel</option>
                    <option value="caterer">Caterer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-dark-border pb-1.5 pt-4">
                NGO Profile Details
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormInput
                  label="Organization Name"
                  id="organization_name"
                  name="organization_name"
                  value={formData.organization_name}
                  onChange={handleChange}
                  placeholder="e.g. Food For All Foundation"
                  required
                />
                <FormInput
                  label="Registration Number"
                  id="registration_number"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleChange}
                  placeholder="e.g. NGO-123456"
                />
              </div>
            </>
          )}

          {/* Shared profile info */}
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-dark-border pb-1.5 pt-4">
            Physical Coordinates & Location
          </div>

          <FormInput
            label="Street Address"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Eco Ave, Green City"
          />

          <div className="grid md:grid-cols-3 gap-6 items-end">
            <FormInput
              label="Latitude"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g. 12.9716"
              required
            />
            <FormInput
              label="Longitude"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g. 77.5946"
              required
            />
            <div>
              <Button
                type="button"
                onClick={getGeolocation}
                disabled={locating}
                variant="outline"
                className="w-full flex items-center justify-center gap-1.5 py-3 border-dashed"
              >
                <MapPin className="w-4 h-4 text-brand-green-500" />
                {locating ? 'Locating...' : 'Get Location'}
              </Button>
            </div>
          </div>
          <span className="text-xs text-slate-400 block -mt-2">
            Click "Get Location" to automatically retrieve coordinates from your browser, or auto-fill simulated defaults.
          </span>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
            variant="primary"
          >
            {loading ? 'Registering...' : 'Register Profile'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Already have an account? </span>
          <Link to="/login" className="text-brand-green-600 hover:text-brand-green-700 font-bold transition-all">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
