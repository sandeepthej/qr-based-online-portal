import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Menu, X, Sun, Moon, LogOut, FileWarning, HelpCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Run on first load to match initial mode
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/20 dark:border-slate-800/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl group-hover:rotate-6 transition-transform duration-300 shadow-lg shadow-indigo-500/20">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                  AutoFare Safe
                </span>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wider">
                  Smart Transport Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg">
              Home
            </Link>

            {user && user.role === 'passenger' && (
              <>
                <Link to="/passenger" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg">
                  Dashboard
                </Link>
                <Link to="/complaint/raise" className="text-sm font-semibold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200/30 dark:border-indigo-800/30 rounded-xl px-4 py-2 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 transition-all duration-300">
                  Raise Complaint
                </Link>
              </>
            )}

            {user && user.role === 'driver' && (
              <Link to="/driver" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg">
                Driver Panel
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg">
                Admin Station
              </Link>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all border border-transparent hover:border-slate-300/40"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200/60 dark:border-slate-800">
                <div className="text-right">
                  <div className="text-sm font-bold capitalize text-slate-800 dark:text-slate-100">
                    {user.username}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                    {user.role}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all border border-red-200/20 duration-300"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth?mode=login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Link to="/auth?mode=register" className="text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl px-5 py-2 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-md shadow-indigo-500/20">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-slate-100 dark:border-slate-800/30 px-4 py-4 space-y-3 flex flex-col items-stretch">
          <Link onClick={() => setMobileOpen(false)} to="/" className="text-sm font-medium py-2">
            Home
          </Link>
          {user && user.role === 'passenger' && (
            <>
              <Link onClick={() => setMobileOpen(false)} to="/passenger" className="text-sm font-medium py-2">
                Dashboard
              </Link>
              <Link onClick={() => setMobileOpen(false)} to="/complaint/raise" className="text-sm font-medium py-2 bg-indigo-50 text-indigo-600 rounded-lg text-center font-bold">
                Raise Complaint
              </Link>
            </>
          )}
          {user && user.role === 'driver' && (
            <Link onClick={() => setMobileOpen(false)} to="/driver" className="text-sm font-medium py-2">
              Driver Panel
            </Link>
          )}
          {user && user.role === 'admin' && (
            <Link onClick={() => setMobileOpen(false)} to="/admin" className="text-sm font-medium py-2">
              Admin Station
            </Link>
          )}

          {user ? (
            <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/50 dark:border-slate-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-medium text-slate-400">Log In as</span>
                  <div className="font-bold text-slate-700 dark:text-slate-200 capitalize">{user.username}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg"
                >
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link onClick={() => setMobileOpen(false)} to="/auth?mode=login" className="text-sm font-bold border border-slate-200 text-center py-2 rounded-lg text-slate-700">
                Sign In
              </Link>
              <Link onClick={() => setMobileOpen(false)} to="/auth?mode=register" className="text-sm font-bold bg-indigo-600 text-white text-center py-2 rounded-lg">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
