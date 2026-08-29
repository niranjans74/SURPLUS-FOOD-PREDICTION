import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { TrendingUp, Award, Utensils, MapPin, Sparkles, ShieldAlert, History } from 'lucide-react';

export default function DonorPrediction() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    food_category: 'cooked_meals',
    meal_type: 'lunch',
    day_of_week: '0', // Will parse to integer on submit
    event_type: 'none',
    prepared_quantity: '',
    expected_people: '',
    actual_people: '',
    previous_surplus: '0.0',
    preparation_time: '2.0'
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');

  const fetchHistory = async () => {
    if (!user || !user.donor_profile) return;
    setHistoryLoading(true);
    try {
      const response = await api.get(`/api/predictions/${user.donor_profile.id}`);
      setHistory(response.data);
    } catch (err) {
      console.error(err);
      setHistoryError('Failed to retrieve forecast logs.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    const expected = parseInt(formData.expected_people, 10);
    const actual = parseInt(formData.actual_people, 10);

    if (actual > expected) {
      setError("Actual attendees cannot exceed expected headcount.");
      setLoading(false);
      return;
    }

    const payload = {
      food_category: formData.food_category,
      meal_type: formData.meal_type,
      day_of_week: parseInt(formData.day_of_week, 10),
      event_type: formData.event_type,
      prepared_quantity: parseFloat(formData.prepared_quantity),
      expected_people: expected,
      actual_people: actual,
      previous_surplus: parseFloat(formData.previous_surplus),
      preparation_time: parseFloat(formData.preparation_time)
    };

    try {
      const response = await api.post('/api/predictions', payload);
      setResult(response.data);
      // Refresh forecast log table
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to compute surplus forecast.');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayIndex) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[dayIndex] || "Unknown";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Surplus Quantity Forecasting
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Input your daily operations parameters to run the predictive regression ML model.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Form Column */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-green-500" />
            Parameter Configurations
          </h3>

          {error && (
            <div className="mb-6 p-4 bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 rounded-lg flex gap-2 text-xs font-semibold border border-brand-orange-500/20 items-center">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Food Category *
                </label>
                <select
                  name="food_category"
                  value={formData.food_category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 transition-all text-sm"
                >
                  <option value="bakery">Bakery Items</option>
                  <option value="cooked_meals">Cooked Meals / Buffet</option>
                  <option value="dairy">Dairy Products</option>
                  <option value="fresh_produce">Fresh Fruits & Vegetables</option>
                  <option value="meat_poultry">Meat & Poultry</option>
                  <option value="other">Other Miscellaneous</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Meal Type *
                </label>
                <select
                  name="meal_type"
                  value={formData.meal_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 transition-all text-sm"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="all_day">All Day Cycle</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Day of the Week *
                </label>
                <select
                  name="day_of_week"
                  value={formData.day_of_week}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 transition-all text-sm"
                >
                  <option value="0">Monday</option>
                  <option value="1">Tuesday</option>
                  <option value="2">Wednesday</option>
                  <option value="3">Thursday</option>
                  <option value="4">Friday</option>
                  <option value="5">Saturday</option>
                  <option value="6">Sunday</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Event / Occasion *
                </label>
                <select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-card text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-green-500 focus:border-brand-green-500 transition-all text-sm"
                >
                  <option value="none">Standard Day (No Event)</option>
                  <option value="wedding">Wedding Ceremony</option>
                  <option value="corporate">Corporate Gathering</option>
                  <option value="holiday">Holiday Season</option>
                  <option value="weekend_rush">Weekend Dining Rush</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <FormInput
                label="Prepared Qty (kg) *"
                id="prepared_quantity"
                name="prepared_quantity"
                type="number"
                step="0.1"
                min="0"
                value={formData.prepared_quantity}
                onChange={handleChange}
                placeholder="e.g. 150.0"
                required
              />
              <FormInput
                label="Expected Attendees *"
                id="expected_people"
                name="expected_people"
                type="number"
                min="1"
                value={formData.expected_people}
                onChange={handleChange}
                placeholder="e.g. 200"
                required
              />
              <FormInput
                label="Actual Attendees *"
                id="actual_people"
                name="actual_people"
                type="number"
                min="0"
                value={formData.actual_people}
                onChange={handleChange}
                placeholder="e.g. 170"
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <FormInput
                label="Prev Day Surplus (kg)"
                id="previous_surplus"
                name="previous_surplus"
                type="number"
                step="0.1"
                min="0"
                value={formData.previous_surplus}
                onChange={handleChange}
              />
              <FormInput
                label="Preparation Duration (hrs)"
                id="preparation_time"
                name="preparation_time"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.preparation_time}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3"
            >
              {loading ? 'Evaluating Model...' : 'Calculate Predicted Surplus'}
            </Button>
          </form>
        </div>

        {/* Results Panel Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white min-h-[400px] flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
                Forecasting Results
              </h3>
              
              {result ? (
                <div className="space-y-6">
                  {/* Predicted surplus in large font */}
                  <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-dark-border">
                    <TrendingUp className="w-8 h-8 text-brand-green-500 mx-auto mb-2 animate-bounce" />
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Predicted Waste Surplus</span>
                    <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {result.predicted_surplus} kg
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* Badge details */}
                    <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-dark-border pb-3">
                      <span className="text-slate-500">Surplus Level:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        result.surplus_level === 'Low'
                          ? 'bg-brand-green-100 text-brand-green-700 dark:bg-brand-green-500/10 dark:text-brand-green-500'
                          : result.surplus_level === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-500'
                          : 'bg-brand-orange-100 text-brand-orange-700 dark:bg-brand-orange-500/10 dark:text-brand-orange-500'
                      }`}>
                        {result.surplus_level}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-dark-border pb-3">
                      <span className="text-slate-500 flex items-center gap-1"><Utensils className="w-4 h-4 text-brand-green-500" /> Meals Recoverable:</span>
                      <span className="font-bold text-slate-800 dark:text-white text-base">
                        ~{result.estimated_meals} meals
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Action:</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-dark-border leading-relaxed">
                        {result.recommended_action}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 border border-dashed border-slate-200 dark:border-dark-border rounded-xl">
                  <TrendingUp className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                  <p className="text-sm font-semibold">No Forecast Calculated</p>
                  <p className="text-xs mt-1 max-w-xs mx-auto px-4">
                    Complete the operational parameters on the left and submit to view statistical indicators.
                  </p>
                </div>
              )}
            </div>

            {result && (
              <Button
                variant="primary"
                onClick={() => navigate(`/donor/recommendations?prediction_id=${result.prediction_id}`)}
                className="w-full flex items-center justify-center gap-2 py-3 mt-6 shadow-md shadow-brand-green-500/15"
              >
                <MapPin className="w-4 h-4" />
                Find Suitable NGOs
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card p-6 rounded-xl border border-slate-200 dark:border-dark-border bg-white">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-500" />
          Surplus Forecast Logs
        </h3>

        {historyLoading ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Loading historical data...
          </div>
        ) : historyError ? (
          <div className="text-center py-8 text-brand-orange-500 text-sm">
            {historyError}
          </div>
        ) : history.length === 0 ? (
          <p className="text-center py-12 text-slate-400 text-sm">
            No surplus predictions logged yet in the database.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-dark-border text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-semibold">Prediction Time</th>
                  <th className="py-3 px-4 font-semibold">Food Category</th>
                  <th className="py-3 px-4 font-semibold">Meal Type</th>
                  <th className="py-3 px-4 font-semibold">Event</th>
                  <th className="py-3 px-4 font-semibold">Prepared (kg)</th>
                  <th className="py-3 px-4 font-semibold">Expected/Actual</th>
                  <th className="py-3 px-4 font-semibold">Predicted Surplus</th>
                  <th className="py-3 px-4 font-semibold">Est. Meals</th>
                  <th className="py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => {
                  const features = record.features || {};
                  return (
                    <tr key={record.id} className="border-b border-slate-100 dark:border-dark-border/50 text-slate-600 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {new Date(record.predicted_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 capitalize">{features.food_category?.replace('_', ' ') || 'N/A'}</td>
                      <td className="py-3.5 px-4 capitalize">{features.meal_type || 'N/A'}</td>
                      <td className="py-3.5 px-4 capitalize">{features.event_type || 'N/A'}</td>
                      <td className="py-3.5 px-4 font-mono">{features.prepared_quantity || 'N/A'} kg</td>
                      <td className="py-3.5 px-4 font-mono">
                        {features.expected_people || 'N/A'} / {features.actual_people || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 font-mono">
                        {record.predicted_quantity} kg
                      </td>
                      <td className="py-3.5 px-4 font-mono text-brand-green-600 dark:text-brand-green-500 font-semibold">
                        ~{int(record.predicted_quantity / 0.4)}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => navigate(`/donor/recommendations?prediction_id=${record.id}`)}
                          className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-brand-green-600 hover:text-brand-green-700 bg-brand-green-500/10 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
                        >
                          Match NGOs
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
  
  // Quick portion rounding helper inside JSX
  function int(val) {
    return Math.floor(val);
  }
}
