import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Car, Shield, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthPage() {
  const { login, apiBase } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode can be login or register
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [isRegister, setIsRegister] = useState(initialMode === 'register');

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'passenger',
    vehicleNumber: '',
    licenseNumber: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setSuccess('');
  };

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isRegister ? `${apiBase}/auth/register` : `${apiBase}/auth/login`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication operation failed.');
      }

      if (isRegister) {
        setSuccess('Registration successful! Please login.');
        setIsRegister(false);
        setForm({ ...form, password: '' });
      } else {
        login(data.user, data.token);

        // Routing based on role
        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'driver') navigate('/driver');
        else navigate('/passenger');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100-screen-64px)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card p-8 bg-white/60 dark:bg-slate-900/40"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl text-white shadow-md shadow-indigo-500/20 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Access secure Smart Auto Complaint tracking
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200/30 rounded-xl p-3 mb-6 text-sm font-medium leading-normal"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>{error}</div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200/30 rounded-xl p-3 mb-6 text-sm font-medium"
          >
            <Shield className="h-5 w-5 shrink-0" />
            <div>{success}</div>
          </motion.div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="John Doe"
                  value={form.username}
                  onChange={handleInput}
                  className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@domain.com"
                value={form.email}
                onChange={handleInput}
                className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
              Secret Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={handleInput}
                className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 pl-11 pr-11 text-sm font-medium outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 h-5 w-5 text-slate-400 hover:text-indigo-500 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                  Profile Role
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'passenger' })}
                    className={`p-3 rounded-xl text-sm font-bold border transition-all duration-300 ${form.role === 'passenger' ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/60'}`}
                  >
                    Passenger
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, role: 'driver' })}
                    className={`p-3 rounded-xl text-sm font-bold border transition-all duration-300 ${form.role === 'driver' ? 'bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/60'}`}
                  >
                    Auto Driver
                  </button>
                </div>
              </div>

              {form.role === 'driver' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                      Vehicle registration Number
                    </label>
                    <div className="relative flex items-center">
                      <Car className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="vehicleNumber"
                        required
                        placeholder="KA 01 AB 1234"
                        value={form.vehicleNumber}
                        onChange={handleInput}
                        className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all uppercase text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wider uppercase mb-1">
                      Driver License Code
                    </label>
                    <div className="relative flex items-center">
                      <Shield className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        name="licenseNumber"
                        required
                        placeholder="DL-142023000"
                        value={form.licenseNumber}
                        onChange={handleInput}
                        className="w-full bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-indigo-500 transition-all uppercase text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold py-3.5 rounded-xl hover:opacity-95 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-300 text-sm flex justify-center items-center gap-2"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Confirm Account' : 'Authenticate'}{' '}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-200/50 dark:border-slate-800/40 pt-4">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {isRegister ? 'Already registered an account?' : "Don't have an account yet?"}{' '}
            <button
              onClick={toggleMode}
              className="font-bold text-indigo-500 hover:text-indigo-600 hover:underline transition-colors focus:outline-none"
            >
              {isRegister ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
