import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { ClipboardList, Check, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';

export default function NgoRequirements() {
  const { user } = useContext(AuthContext);

  const [foodTypes, setFoodTypes] = useState([
    { id: 'cooked_meals', label: 'Cooked Meals / Buffet', checked: false },
    { id: 'bakery', label: 'Bakery Items', checked: false },
    { id: 'dairy', label: 'Dairy Products', checked: false },
    { id: 'fresh_produce', label: 'Fresh Fruits & Vegetables', checked: false },
    { id: 'meat_poultry', label: 'Meat & Poultry', checked: false },
    { id: 'other', label: 'Other Miscellaneous', checked: false }
  ]);

  const [formData, setFormData] = useState({
    quantity_needed: '',
    capacity: '',
    urgency_level: 'medium'
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load existing requirement if active
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const response = await api.get('/api/ngos/nearby');
        // Find our NGO requirement
        const myNgo = response.data.find(n => n.ngo_id === user?.ngo_profile?.id);
        if (myNgo && myNgo.food_type_needed !== 'None') {
          const acceptedTypes = myNgo.food_type_needed.split(',');
          setFoodTypes(prev =>
            prev.map(type => ({
              ...type,
              checked: acceptedTypes.includes(type.id)
            }))
          );
          setFormData({
            quantity_needed: myNgo.quantity_needed.toString(),
            capacity: myNgo.capacity ? myNgo.capacity.toString() : '',
            urgency_level: myNgo.urgency_level
          });
        }
      } catch (err) {
        console.error("Failed to load existing requirements:", err);
      } finally {
        setFetching(false);
      }
    };

    if (user?.ngo_profile?.id) {
      fetchRequirements();
    }
  }, [user]);

  const toggleFoodType = (id) => {
    setFoodTypes(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setUrgency = (level) => {
    setFormData(prev => ({ ...prev, urgency_level: level }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const selectedFoodTypes = foodTypes.filter(f => f.checked).map(f => f.id);
    if (selectedFoodTypes.length === 0) {
      setErrorMsg('Please select at least one accepted food type.');
      return;
    }

    const qty = parseFloat(formData.quantity_needed);
    const cap = parseFloat(formData.capacity);

    if (qty > cap) {
      setErrorMsg('Required quantity cannot exceed total storage capacity.');
      return;
    }

    setLoading(true);
    const payload = {
      food_types: selectedFoodTypes,
      quantity_needed: qty,
      capacity: cap,
      urgency_level: formData.urgency_level
    };

    try {
      await api.post('/api/ngos/requirements', payload);
      setSuccessMsg('Operational requirements updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || 'Failed to update requirements.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-green-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-500 text-sm">Loading configurations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Manage Food Requirements
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Publish your accepted food categories, current demand volume, and active urgency.
        </p>
      </div>

      <div className="glass-card p-8 rounded-xl border border-slate-200 dark:border-dark-border bg-white shadow-xl shadow-slate-100/50 dark:shadow-none">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-dark-border pb-4">
          <ClipboardList className="w-5 h-5 text-brand-green-500" />
          Requirements Configuration
        </h3>

        {successMsg && (
          <div className="mb-6 p-4 bg-brand-green-50 dark:bg-brand-green-500/10 text-brand-green-700 dark:text-brand-green-500 rounded-lg flex gap-2 text-sm font-semibold border border-brand-green-500/20 items-center">
            <Check className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 rounded-lg flex gap-2 text-sm font-semibold border border-brand-orange-500/20 items-center">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Multi-select for Food Categories */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-green-500" /> Accepted Food Types *
            </label>
            <p className="text-xs text-slate-400">Select all types of food your organization is equipped to accept and distribute.</p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {foodTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleFoodType(item.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-sm transition-all duration-200 cursor-pointer ${
                    item.checked
                      ? 'border-brand-green-500 bg-brand-green-50/50 dark:bg-brand-green-500/10 text-brand-green-700 dark:text-brand-green-500 font-semibold shadow-sm'
                      : 'border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.checked && <Check className="w-4 h-4 text-brand-green-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quantities & Capacity */}
          <div className="grid sm:grid-cols-2 gap-6">
            <FormInput
              label="Quantity Needed (kg) *"
              id="quantity_needed"
              name="quantity_needed"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.quantity_needed}
              onChange={handleChange}
              placeholder="e.g. 50.0"
              required
            />
            <FormInput
              label="Max Storage Capacity (kg) *"
              id="capacity"
              name="capacity"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g. 150.0"
              required
            />
          </div>

          {/* Urgency selection */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Active Urgency Level *
            </label>
            <div className="flex gap-4">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setUrgency(level)}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    formData.urgency_level === level
                      ? level === 'low'
                        ? 'border-brand-green-500 bg-brand-green-500/10 text-brand-green-600 dark:text-brand-green-500'
                        : level === 'medium'
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
                        : 'border-brand-orange-500 bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500'
                      : 'border-slate-200 dark:border-dark-border text-slate-400 bg-white dark:bg-dark-card hover:bg-slate-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 shadow-md shadow-brand-green-500/10 font-bold"
          >
            {loading ? 'Saving Requirements...' : 'Publish Requirements'}
          </Button>
        </form>
      </div>
    </div>
  );
}
