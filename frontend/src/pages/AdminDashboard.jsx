import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Search, Shield, Users, DollarSign, Clock, ShieldAlert, Ban, Unlock, CheckCircle, Flame, ArrowRight, Download, FileWarning } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { user, token, apiBase } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local view selection: 'analytics' | 'complaints' | 'users'
  const [tab, setTab] = useState('analytics');
  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Status updates local form data
  const [statusUpdates, setStatusUpdates] = useState({});

  // Protections
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth?mode=login');
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Admin Statistics Summary
      const resS = await fetch(`${apiBase}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataS = await resS.json();
      if (resS.ok) setStats(dataS);

      // 2. Fetch all system complaints
      const resC = await fetch(`${apiBase}/complaints/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataC = await resC.json();
      if (resC.ok) setComplaints(Array.isArray(dataC) ? dataC : []);

      // 3. Fetch all system users
      const resU = await fetch(`${apiBase}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataU = await resU.json();
      if (resU.ok) setUsers(Array.isArray(dataU) ? dataU : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  const handleUpdateStatus = async (id) => {
    const statusForm = statusUpdates[id] || {};
    const complaint = complaints.find(c => (c._id || c.id) === id);
    const selectedStatus = statusForm.status || (complaint ? complaint.status : 'Submitted');

    try {
      const res = await fetch(`${apiBase}/complaints/admin/status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: selectedStatus,
          fakeComplaintReason: statusForm.reason || '',
          penaltyAmount: parseFloat(statusForm.penalty) || 0
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBanUser = async (uId, currentBanStatus) => {
    try {
      const res = await fetch(`${apiBase}/admin/users/ban/${uId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isBanned: !currentBanStatus, banReason: 'Spamming / Multiple fraudulent reports raised.' })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(data.message);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const downloadReport = () => {
    const content = complaints.map(c => `[${c.complaintId}] Vehicle: ${c.vehicleNumber}, User: ${c.passenger}, Paid: ${c.farePaid}, Expected: ${c.expectedFare}, Status: ${c.status}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto_system_report_${Date.now()}.txt`;
    a.click();
  };

  // Searches filtering
  const filteredComplaints = complaints.filter(c =>
    c.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
    c.complaintId.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Master Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/40 dark:border-indigo-900/40 px-3 py-1.5 rounded-full shadow-sm">
            Master System Operations Station
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white mt-3 tracking-tight">
            Administrator Center
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Evaluate metrics, initiate fast-track passenger compensations, and lock malicious accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/40 rounded-xl font-bold text-xs hover:bg-indigo-500 hover:text-white transition-all duration-300"
          >
            <Download className="h-4 w-4" /> Export logs
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition border border-transparent hover:border-slate-300/30 self-start"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/30 rounded-xl p-4 mb-8 text-sm font-bold">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Modern Dashboard Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
        {[
          { id: 'analytics', label: 'Platform Analytics', icon: Shield },
          { id: 'complaints', label: 'Verify Complaints', icon: Clock },
          { id: 'users', label: 'Accounts & Restrictions', icon: Users }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-300 focus:outline-none ${
              tab === item.id
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/30 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100/50 dark:bg-slate-900/30 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Platform Analytics Subview */}
          {tab === 'analytics' && stats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Overview Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Users</span>
                    <div className="text-2xl font-black text-slate-800 dark:text-white mt-1 leading-none">{stats.counts?.passengers + stats.counts?.drivers}</div>
                  </div>
                  <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Logged Complaints</span>
                    <div className="text-2xl font-black text-slate-800 dark:text-white mt-1 leading-none">{stats.counts?.complaints}</div>
                  </div>
                  <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fast Refunds Paid</span>
                    <div className="text-2xl font-black text-slate-800 dark:text-white mt-1 leading-none">{stats.counts?.refunds}</div>
                  </div>
                  <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-card bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 p-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Funds Recovered</span>
                    <div className="text-2xl font-black text-slate-800 dark:text-white mt-1 leading-none">${stats.earningsRecovered ?? 0}</div>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Flame className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Status Breakdown heatmap visual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-6 border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-6">
                    <Flame className="h-4 w-4 text-amber-500" /> Resolution Heatmap distribution
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(stats.statusDistribution || {}).map(([key, count]) => {
                      const percentage = stats.counts?.complaints > 0 ? (count / stats.counts.complaints * 100).toFixed(1) : 0;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-600 dark:text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="text-slate-500 dark:text-slate-400">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8 }}
                              className={`h-full bg-gradient-to-r ${
                                key === 'Submitted'
                                  ? 'from-amber-400 to-amber-500'
                                  : key === 'UnderReview'
                                  ? 'from-blue-400 to-blue-500'
                                  : key === 'Verified'
                                  ? 'from-green-400 to-green-500'
                                  : key === 'RefundCompleted'
                                  ? 'from-teal-400 to-teal-500'
                                  : 'from-red-400 to-red-500'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audit Trial Logging Section */}
                <div className="glass-card p-6 border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-indigo-500" /> Platform Audit Trail Logs
                  </h3>
                  <div className="space-y-3 overflow-y-auto max-h-56 pr-2">
                    {stats.recentActivity?.slice(0, 10).map((log, lIdx) => (
                      <div key={lIdx} className="flex flex-col border-b border-slate-200/30 dark:border-slate-800/30 pb-2.5 last:border-0">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-indigo-500 uppercase tracking-widest">{log.action}</span>
                          <span className="text-slate-400 text-[10px] font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                          {log.details}
                        </p>
                      </div>
                    ))}
                    {(!stats.recentActivity || stats.recentActivity.length === 0) && (
                      <div className="text-xs font-medium text-slate-500 text-center py-10">
                        No operations or logs registered.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Complaints tab Subview */}
          {tab === 'complaints' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-indigo-500" /> Master Verification Logs
                </h3>
                <div className="relative flex items-center max-w-sm">
                  <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search vehicle number or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {filteredComplaints.length === 0 ? (
                <div className="text-center py-14 glass rounded-2xl border-slate-200/40 text-slate-500 font-bold text-sm">
                  Zero active complaint cases matching searches.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredComplaints.map((c) => (
                    <div
                      key={c._id || c.id}
                      className="glass p-5 rounded-2xl border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:border-indigo-400/40"
                    >
                      <div className="flex flex-col gap-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black uppercase bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/30 px-3 py-1 rounded-lg">
                            {c.complaintId}
                          </span>
                          <span
                            className={`text-xs font-bold border px-3 py-1 rounded-lg ${
                              c.status === 'Submitted'
                                ? 'bg-amber-500/10 text-amber-600 border-amber-200/20'
                                : c.status === 'Verified'
                                ? 'bg-green-500/10 text-green-600 border-green-200/20'
                                : c.status === 'Fraudulent'
                                ? 'bg-red-500/10 text-red-600 border-red-200/20'
                                : 'bg-blue-500/10 text-blue-600 border-blue-200/20'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        <div className="text-sm font-extrabold text-slate-800 dark:text-white capitalize">
                          Logged by: {c.passenger} / Driver Vehicle:{' '}
                          <span className="uppercase text-indigo-500">{c.vehicleNumber}</span>
                        </div>

                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 leading-normal bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200/30 p-2 rounded-xl">
                          Description: “{c.description}”
                        </p>

                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          Route: {c.pickupLocation} → {c.dropLocation} ({c.distanceKM} KM)
                        </div>

                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          Paid: ${c.farePaid} / Standard expected: ${c.expectedFare}
                        </div>

                        {(c.screenshotProof || c.additionalEvidence) && (
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                            {c.screenshotProof && (
                              <a
                                href={c.screenshotProof.startsWith('http') ? c.screenshotProof : `http://${c.screenshotProof}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900 px-2.5 py-1.5 rounded-lg transition-all focus:outline-none"
                              >
                                <span>📄 View Payment Proof</span>
                              </a>
                            )}
                            {c.additionalEvidence && (
                              <a
                                href={c.additionalEvidence.startsWith('http') ? c.additionalEvidence : `http://${c.additionalEvidence}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 border border-indigo-100 dark:border-indigo-900 px-2.5 py-1.5 rounded-lg transition-all focus:outline-none"
                              >
                                <span>📁 View Additional Evidence</span>
                              </a>
                            )}
                          </div>
                        )}

                        {c.driverResponse && (
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 p-2 rounded-xl mt-1">
                            Driver Defense Note: “{c.driverResponse}”
                          </p>
                        )}

                        {c.fakeComplaintReason && (
                          <div className="text-xs font-bold text-amber-600 dark:text-amber-400 max-w-sm mt-1">
                            {c.fakeComplaintReason}
                          </div>
                        )}

                        {c.penaltyAmount > 0 && (
                          <div className="text-xs font-black text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 border border-red-200/30 p-2 rounded-xl max-w-sm mt-1">
                            Assessed Fine/Penalty: ${c.penaltyAmount}
                          </div>
                        )}
                      </div>

                      {/* Immediate Quick Action Verification Buttons */}
                      <div className="flex flex-col gap-3 min-w-[240px] bg-white/40 dark:bg-slate-900/20 p-4 border border-slate-200/40 dark:border-slate-800/40 rounded-2xl">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Modify Operation Status
                          </label>
                          <select
                            onChange={(e) =>
                              setStatusUpdates({
                                ...statusUpdates,
                                [c._id || c.id]: {
                                  ...(statusUpdates[c._id || c.id] || {}),
                                  status: e.target.value
                                }
                              })
                            }
                            value={statusUpdates[c._id || c.id]?.status || c.status}
                            className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-medium focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Verified">Verified</option>
                            <option value="Driver Notified">Driver Notified</option>
                            <option value="Refund Initiated">Refund Initiated</option>
                            <option value="Refund Completed">Refund Completed</option>
                            <option value="Fraudulent">Fraudulent</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Reason/Note
                          </label>
                          <input
                            type="text"
                            placeholder="Penalty or fraud reason..."
                            value={statusUpdates[c._id || c.id]?.reason || ''}
                            onChange={(e) =>
                              setStatusUpdates({
                                ...statusUpdates,
                                [c._id || c.id]: {
                                  ...(statusUpdates[c._id || c.id] || {}),
                                  reason: e.target.value
                                }
                              })
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-medium focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                            Enter Penalty/Fine Amount ($)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 50"
                            value={statusUpdates[c._id || c.id]?.penalty || ''}
                            onChange={(e) =>
                              setStatusUpdates({
                                ...statusUpdates,
                                [c._id || c.id]: {
                                  ...(statusUpdates[c._id || c.id] || {}),
                                  penalty: e.target.value
                                }
                              })
                            }
                            className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-2 px-3 text-xs font-medium focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                          />
                        </div>

                        <button
                          onClick={() => handleUpdateStatus(c._id || c.id)}
                          className="w-full mt-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black py-2.5 rounded-xl hover:opacity-95 text-xs hover:shadow-md transition duration-300"
                        >
                          Execute Update Action
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Accounts & Restrictions Subview */}
          {tab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" /> Platform User Database
                </h3>
                <div className="relative flex items-center max-w-sm">
                  <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search account name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-14 glass rounded-2xl border-slate-200/40 text-slate-500 font-bold text-sm">
                  Zero active accounts found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredUsers.map((u) => (
                    <div
                      key={u._id || u.id}
                      className="glass p-5 rounded-2xl border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:border-indigo-400/40"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/30 px-3 py-1 rounded-lg">
                            {u.role}
                          </span>
                          <span
                            className={`text-xs font-bold border px-3 py-1 rounded-lg ${
                              u.isBanned
                                ? 'bg-red-50 text-red-600 border-red-200'
                                : 'bg-green-50 text-green-600 border-green-200'
                            }`}
                          >
                            {u.isBanned ? 'Access Suspended' : 'Status Valid'}
                          </span>
                        </div>

                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white capitalize">
                          {u.username}
                        </h4>

                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          Email: {u.email}
                        </div>

                        {u.driverProfile && u.driverProfile.vehicleNumber && (
                          <div className="text-xs font-extrabold text-indigo-500 mt-1 uppercase">
                            Vehicle No: {u.driverProfile.vehicleNumber}
                          </div>
                        )}

                        {u.banReason && (
                          <p className="text-xs font-bold text-red-500 mt-1 leading-tight">
                            Ban details: {u.banReason}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleBanUser(u._id || u.id, u.isBanned)}
                            className={`flex items-center gap-1.5 font-bold text-xs px-4 py-2.5 rounded-xl transition duration-300 focus:outline-none ${
                              u.isBanned
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                                : 'bg-red-500/10 text-red-600 border border-red-200/30 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            {u.isBanned ? (
                              <>
                                <Unlock className="h-4 w-4" /> Revoke Restriction
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4" /> Apply Restriction
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
