import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, TrendingUp, Navigation, Car, CreditCard, Layers, ArrowLeft, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComplaintRaisePage() {
  const { user, token, apiBase } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Route protection
  useEffect(() => {
    if (!user || user.role !== 'passenger') {
      navigate('/auth?mode=login');
    }
  }, [user]);

  const scannedVehicle = searchParams.get('vehicle') || '';

  const [form, setForm] = useState({
    vehicleNumber: scannedVehicle,
    pickupLocation: '',
    dropLocation: '',
    distanceKM: '',
    farePaid: '',
    expectedFare: '',
    screenshotProof: '',
    additionalEvidence: '',
    gpsLocation: { lat: 12.9716, lng: 77.5946 },
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('');

  // Auto-calculate expected fare whenever distance changes
  const baseFare = 30;
  const ratePerKm = 15;

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const nextForm = { ...prev, [name]: value };

      if (name === 'distanceKM') {
        const km = parseFloat(value) || 0;
        const calcFare = baseFare + km * ratePerKm;
        nextForm.expectedFare = calcFare.toFixed(2);
      }
      return nextForm;
    });
  };

  // Mock capture user current position
  const handleGPSCapture = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            gpsLocation: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            }
          }));
          alert('GPS Coordinates captured successfully!');
        },
        () => {
          alert('Unable to retrieve location. Defaulting to Smart City Headquarters.');
        }
      );
    }
  };

  const submitComplaint = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAiAnalysis('');

    if (parseFloat(form.farePaid) <= 0 || parseFloat(form.distanceKM) <= 0) {
      setError('Please enter valid numeric distance and amount paid.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBase}/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error processing complaint log.');
      }

      setSuccess(data.message);
      setAiAnalysis(data.aiAnalysis);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // After 3 seconds redirect to history
      setTimeout(() => navigate('/passenger'), 3500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-semibold text-indigo-500 hover:text-indigo-600 mb-2 focus:outline-none"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Register Auto Complaint
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Submit overcharging, route denial, or driver misconduct instances.
          </p>
        </div>
        <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
          <Shield className="h-6 w-6" />
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-2 bg-red-500/10 text-red-600 border border-red-200/30 rounded-xl p-4 mb-6 text-sm font-medium leading-normal"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>{error}</div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col gap-3 bg-green-500/10 text-green-600 border border-green-200/30 rounded-xl p-4 mb-6 text-sm font-medium"
        >
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <div>{success}</div>
          </div>
          {aiAnalysis && (
            <div className="bg-white/40 dark:bg-slate-900/40 p-3 rounded-lg border border-green-200/30 font-bold">
              {aiAnalysis}
            </div>
          )}
        </motion.div>
      )}

      <form onSubmit={submitComplaint} className="space-y-6">
        <div className="glass-card p-6 bg-white/60 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <Car className="h-4 w-4" /> Vehicle & Route Specifics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                Auto Vehicle Registration Number
              </label>
              <input
                type="text"
                name="vehicleNumber"
                required
                placeholder="KA 01 AB 1234"
                value={form.vehicleNumber}
                onChange={handleInput}
                className="w-full bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all uppercase text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                GPS Coordinate Logs
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`Lat: ${form.gpsLocation.lat.toFixed(4)}, Lng: ${form.gpsLocation.lng.toFixed(4)}`}
                  className="w-full bg-slate-100/50 dark:bg-slate-800/20 border border-slate-200/40 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGPSCapture}
                  className="p-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 border border-indigo-200/30 rounded-xl text-indigo-600 dark:text-indigo-400 transition-all font-bold text-sm"
                >
                  <Navigation className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                From (Pickup Location)
              </label>
              <input
                type="text"
                name="pickupLocation"
                required
                placeholder="Majestic Bus Stand"
                value={form.pickupLocation}
                onChange={handleInput}
                className="w-full bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                To (Drop Location)
              </label>
              <input
                type="text"
                name="dropLocation"
                required
                placeholder="Indiranagar Metro"
                value={form.dropLocation}
                onChange={handleInput}
                className="w-full bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 bg-white/60 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Fare Details (Auto Calculations)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                Distance Travelled (KM)
              </label>
              <input
                type="number"
                name="distanceKM"
                step="0.1"
                required
                placeholder="4.5"
                value={form.distanceKM}
                onChange={handleInput}
                className="w-full bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                Actual Fare Paid
              </label>
              <input
                type="number"
                name="farePaid"
                required
                placeholder="150"
                value={form.farePaid}
                onChange={handleInput}
                className="w-full bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                Standard Expected Fare
              </label>
              <input
                type="text"
                readOnly
                value={form.expectedFare ? `$${form.expectedFare}` : 'Calculated automatically'}
                className="w-full bg-slate-100/60 dark:bg-slate-800/20 border border-slate-200/40 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 bg-white/60 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <Layers className="h-4 w-4" /> Explanations & Evidence
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                Detailed Issue Description
              </label>
              <textarea
                name="description"
                rows="4"
                required
                placeholder="Driver demanded $150 instead of standard $100 fare, and used abusive behavior when questioned."
                value={form.description}
                onChange={handleInput}
                className="w-full bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white leading-normal"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                  Payment Screenshot URI / Receipt Link
                </label>
                <input
                  type="text"
                  name="screenshotProof"
                  placeholder="https://imgur.com/image.png"
                  value={form.screenshotProof}
                  onChange={handleInput}
                  className="w-full bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                  Additional Proof Link
                </label>
                <input
                  type="text"
                  name="additionalEvidence"
                  placeholder="https://drive.google.com/doc"
                  value={form.additionalEvidence}
                  onChange={handleInput}
                  className="w-full bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/passenger')}
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-95 text-white hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting Case...' : 'Submit Auto Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
