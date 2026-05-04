import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, CheckCircle, Search, Clock, Shield, Plus, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PassengerDashboard() {
  const { user, token, apiBase } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Protect route
  useEffect(() => {
    if (!user || user.role !== 'passenger') {
      navigate('/auth?mode=login');
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch complaints
      const resC = await fetch(`${apiBase}/complaints/passenger`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataC = await resC.json();
      if (!resC.ok) throw new Error(dataC.message || 'Error loading complaints data');
      setComplaints(Array.isArray(dataC) ? dataC : []);

      // 2. Fetch refunds
      const resR = await fetch(`${apiBase}/refunds/passenger`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataR = await resR.json();
      if (resR.ok) setRefunds(Array.isArray(dataR) ? dataR : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'passenger') {
      loadData();
    }
  }, [user]);

  // Filtering based on search
  const filtered = complaints.filter((c) =>
    c.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.complaintId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header and Call to Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/40 dark:border-indigo-900/40 px-3 py-1.5 rounded-full shadow-sm">
            Passenger Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mt-3 tracking-tight">
            Greetings, {user ? user.username : 'User'}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Track existing cases, monitor approved refunds, and report new instances of driver misconduct or overcharging.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition border border-transparent hover:border-slate-300/30"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/complaint/raise"
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 text-sm"
          >
            <Plus className="h-4 w-4" /> Raise New Complaint
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/30 rounded-xl p-4 mb-8 text-sm font-bold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Analytics Briefing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Cases Submitted</span>
            <div className="text-3xl font-black text-slate-800 dark:text-white mt-1 leading-none">{complaints.length}</div>
          </div>
          <div className="p-3.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Cases Approved/Verified</span>
            <div className="text-3xl font-black text-slate-800 dark:text-white mt-1 leading-none">
              {complaints.filter(c => ['Verified', 'Driver Notified', 'Refund Initiated', 'Refund Completed'].includes(c.status)).length}
            </div>
          </div>
          <div className="p-3.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Approved Refund Records</span>
            <div className="text-3xl font-black text-slate-800 dark:text-white mt-1 leading-none">
              {refunds.length}
            </div>
          </div>
          <div className="p-3.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main content grid: Left - complaints search table, Right - refunds tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" /> Recent Activity Logs
            </h2>
            <div className="relative flex items-center max-w-sm">
              <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search vehicle or case ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass p-12 rounded-2xl border-slate-200/40 dark:border-slate-800/40 text-center flex flex-col items-center">
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                No instances found.
              </h3>
              <p className="text-xs font-medium text-slate-500 max-w-xs leading-relaxed">
                Try logging a new overcharge complaint to populate records.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((c) => (
                <motion.div
                  key={c._id || c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-5 rounded-2xl border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:border-indigo-400/40"
                >
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
                            : c.status === 'Refund Initiated'
                            ? 'bg-indigo-500/10 text-indigo-600 border-indigo-200/20'
                            : c.status === 'Refund Completed'
                            ? 'bg-teal-500/10 text-teal-600 border-teal-200/20'
                            : 'bg-red-500/10 text-red-600 border-red-200/20'
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.complaintPriority === 'High' && (
                        <span className="text-xs font-black uppercase bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/40 px-2 py-1 rounded-lg animate-pulse">
                          High Risk
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-extrabold text-slate-800 dark:text-white capitalize">
                      Vehicle: <span className="uppercase">{c.vehicleNumber}</span>
                    </div>

                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Route: {c.pickupLocation} → {c.dropLocation} ({c.distanceKM} KM)
                    </div>

                    <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-1 leading-normal max-w-lg italic">
                      “{c.description}”
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="text-xs font-medium text-slate-400 tracking-wide uppercase">
                      Financial Summary
                    </div>
                    <div className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                      Paid: ${c.farePaid} / Standard: ${c.expectedFare}
                    </div>
                    <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      Excess: ${Math.max(0, c.farePaid - c.expectedFare).toFixed(2)}
                    </div>
                    {c.fakeComplaintReason && (
                      <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 max-w-[200px] leading-tight">
                        {c.fakeComplaintReason}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Refund Ledger Dashboard Right Side */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-500" /> Compensation Tracker
          </h2>

          {loading ? (
            <div className="h-44 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl animate-pulse" />
          ) : refunds.length === 0 ? (
            <div className="glass p-8 rounded-2xl border-slate-200/40 dark:border-slate-800/40 text-center flex flex-col items-center">
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl mb-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                No Pending Compensations
              </h4>
              <p className="text-xs font-medium text-slate-400 mt-1 leading-relaxed">
                Once a complaint gets verified by the administration, payouts automatically process.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {refunds.map((r) => (
                <div
                  key={r._id || r.id}
                  className="glass p-4 rounded-xl border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-lg">
                      {r.refundId}
                    </span>
                    <span className={`text-xs font-bold border px-3 py-1 rounded-lg ${r.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="text-sm font-extrabold text-slate-800 dark:text-white">
                    Payout Amount: ${r.amount}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase leading-tight">
                    Ref ID: {r.complaintId}
                  </div>
                  {r.transactionId && (
                    <div className="text-xs font-bold text-slate-500 mt-1">
                      Txn: {r.transactionId}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
