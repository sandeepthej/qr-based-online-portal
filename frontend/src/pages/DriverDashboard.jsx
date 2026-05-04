import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, QrCode, AlertCircle, TrendingUp, CheckCircle, Car, Shield, Send, CreditCard } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

export default function DriverDashboard() {
  const { user, token, apiBase } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState({});
  const [profile, setProfile] = useState(null);

  // Protection Check
  useEffect(() => {
    if (!user || user.role !== 'driver') {
      navigate('/auth?mode=login');
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch complaints logged against the driver
      const resC = await fetch(`${apiBase}/complaints/driver`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataC = await resC.json();
      if (!resC.ok) throw new Error(dataC.message || 'Error loading cases');
      setComplaints(Array.isArray(dataC) ? dataC : []);

      // 2. Fetch latest profile specifics
      const resP = await fetch(`${apiBase}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataP = await resP.json();
      if (resP.ok) setProfile(dataP);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'driver') {
      loadData();
    }
  }, [user]);

  const handleReplyChange = (id, text) => {
    setReplyText({ ...replyText, [id]: text });
  };

  const submitReply = async (id) => {
    const text = replyText[id];
    if (!text || text.trim() === '') return;

    try {
      const res = await fetch(`${apiBase}/complaints/driver/respond/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ driverResponse: text })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Response logged successfully!');
      setReplyText({ ...replyText, [id]: '' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const currentVehicle = profile?.driverProfile?.vehicleNumber || user?.driverProfile?.vehicleNumber || 'Unregistered';

  // Quick printable QR code URL payload
  const qrData = `http://localhost:5173/complaint/raise?vehicle=${encodeURIComponent(currentVehicle)}`;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/40 dark:border-indigo-900/40 px-3 py-1.5 rounded-full shadow-sm">
            Auto Driver Panel
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mt-3 tracking-tight">
            Vehicle Dashboard: {currentVehicle.toUpperCase()}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Check logs, submit responses to passenger reports, and review penalty or resolution summaries.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition border border-transparent hover:border-slate-300/30 self-start"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/30 rounded-xl p-4 mb-8 text-sm font-bold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Primary Analytics & Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-6 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4">
            <QrCode className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">Unique Quick Complaint QR</h3>
          <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200/40 mb-3 select-all">
            <QRCodeSVG value={qrData} size={130} level="H" includeMargin={true} />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-3">
            Download or share this unique QR. Passengers scan it to open the auto-filled complaint page.
          </p>
          <a
            href={`/complaint/raise?vehicle=${encodeURIComponent(currentVehicle)}`}
            target="_blank"
            className="text-xs font-bold text-indigo-500 hover:underline"
          >
            Preview Complaint Form Link
          </a>
        </div>

        <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Cases logged</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Shield className="h-5 w-5" />
            </div>
          </div>
          <div className="text-4xl font-black text-slate-800 dark:text-white mt-1 leading-none">
            {complaints.length}
          </div>
          <p className="text-xs font-medium text-slate-400 mt-2 leading-relaxed">
            Case logs reported against your vehicle directly. Ensure you submit defense responses promptly.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Warning Points:</span>
            <span className="text-xs font-black text-red-500 uppercase tracking-widest animate-pulse">
              {complaints.filter(c => c.status === 'Verified').length * 20} pts
            </span>
          </div>
        </div>

        <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Earnings & Penalties</span>
            <div className="p-2 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-slate-500">Earnings Balance</div>
              <div className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-0.5">$0.00</div>
            </div>
            <div className="pt-2">
              <div className="text-sm font-medium text-slate-500">Overcharging Claims</div>
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-0.5">
                ${complaints.reduce((sum, c) => sum + (c.penaltyAmount || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Reputation Balance:</span>
            <span className="text-xs font-extrabold text-green-500">
              {profile?.driverProfile?.driverReputationScore ?? 100}% Good
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Table containing Complaints */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500" /> Pending Responses & Investigations
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <div className="glass p-12 rounded-2xl border-slate-200/40 dark:border-slate-800/40 text-center flex flex-col items-center">
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Zero complaints recorded.
            </h3>
            <p className="text-xs font-medium text-slate-500 max-w-xs leading-relaxed">
              Your vehicle maintains clean operations and a perfect profile standing.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <motion.div
                key={c._id || c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-5 rounded-2xl border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col gap-4 transition-all duration-300 hover:border-indigo-400/40"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-black uppercase bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/30 px-3 py-1 rounded-lg">
                        {c.complaintId}
                      </span>
                      <span
                        className={`text-xs font-bold border px-3 py-1 rounded-lg ${
                          c.status === 'Submitted'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-200/20'
                            : c.status === 'Under Review'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-200/20'
                            : c.status === 'Verified'
                            ? 'bg-green-500/10 text-green-600 border-green-200/20'
                            : 'bg-red-500/10 text-red-600 border-red-200/20'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                      Raised by Passenger: {c.passenger}
                    </div>

                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Route: {c.pickupLocation} → {c.dropLocation} ({c.distanceKM} KM)
                    </div>

                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 leading-normal max-w-lg italic">
                      “{c.description}”
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-medium text-slate-400 tracking-wide uppercase">Financial summary</div>
                    <div className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                      Paid: ${c.farePaid} / Expected: ${c.expectedFare}
                    </div>
                    {c.penaltyAmount > 0 && (
                      <div className="text-sm font-black text-red-600 dark:text-red-400 mt-1 animate-pulse">
                        Penalty Owed: ${c.penaltyAmount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Response / Defense input */}
                <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
                  {c.driverResponse ? (
                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-indigo-800/40 rounded-xl">
                      <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">Your logged defense response:</span>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                        “{c.driverResponse}”
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Submit defense comments</label>
                      <div className="flex gap-2">
                        <textarea
                          rows="2"
                          placeholder="Provide clarification. E.g., Traffic route deviations, waiting times..."
                          value={replyText[c._id || c.id] || ''}
                          onChange={(e) => handleReplyChange(c._id || c.id, e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white leading-relaxed resize-none"
                        ></textarea>
                        <button
                          onClick={() => submitReply(c._id || c.id)}
                          className="px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition duration-300 flex items-center justify-center focus:outline-none"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
