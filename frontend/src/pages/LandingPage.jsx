import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle, TrendingUp, Compass, QrCode, ArrowRight, CheckCircle2, Star, Shield, Car, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Dynamic Futuristic Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Abstract Background Visuals */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-fuchsia-500/10 blur-3xl rounded-full z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 dark:bg-indigo-600/5 blur-3xl rounded-full z-0 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 shadow-md"
          >
            <ShieldCheck className="h-4 w-4" /> Trusted Smart City Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl"
          >
            Complete Zero-Tolerance <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
              Auto Fare Overcharging Portal
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium"
          >
            Scan vehicle QR code, verify route distance, log complaints against overcharging, and claim instant compensation within 7 working days.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-10 flex flex-wrap justify-center items-center gap-4"
          >
            <Link
              to="/complaint/raise"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold px-7 py-4 rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300 text-base"
            >
              Report Auto Issue <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/auth?mode=register"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 text-slate-700 dark:text-white backdrop-blur-md border border-slate-300/40 dark:border-slate-800 font-bold px-7 py-4 rounded-2xl shadow-sm hover:-translate-y-1 transition-all duration-300 text-base"
            >
              Register Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Cyber stats Overview */}
      <section className="py-12 bg-white/40 dark:bg-slate-900/20 border-y border-slate-200/30 dark:border-slate-800/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
          >
            {[
              { label: 'Drivers Reg.', value: '14,800+', icon: Car },
              { label: 'Verified Cases', value: '3,200+', icon: Shield },
              { label: 'Fares Managed', value: '42,000+', icon: DollarSign },
              { label: 'Resolution Rate', value: '98.4%', icon: TrendingUp }
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="glass-card flex flex-col items-center justify-center text-center p-6 border-slate-200/40 dark:border-slate-800/40 bg-white/50 dark:bg-slate-900/50"
              >
                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/20 rounded-xl mb-4">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mb-1 leading-none">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center max-w-3xl mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-800">
              Modern Operations
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              A Complete Resolution Workflow
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
              We leverage advanced automation, AI validity checks, and dynamic geo-tracking to optimize auto fare investigations.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
          >
            {[
              {
                title: 'QR Code Quick Fill',
                desc: 'Instantly view vehicle and driver details directly by scanning driver-assigned QR codes.',
                icon: QrCode
              },
              {
                title: 'AI Verification Analysis',
                desc: 'Intelligent fare calculators evaluate routes, preventing fraudulent logs and verifying real abuse cases.',
                icon: Shield
              },
              {
                title: '7 Working Day Refund',
                desc: 'Administrative actions initiate compensation automatically, transferring payouts straight to your account.',
                icon: TrendingUp
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="glass p-8 rounded-2xl border-slate-200/40 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/40 hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-400/40 transition-all duration-300 flex flex-col items-start"
              >
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl mb-6 shadow-md shadow-indigo-500/20">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modern footer */}
      <footer className="bg-slate-100/60 dark:bg-slate-900/60 border-t border-slate-200/30 dark:border-slate-800/30 py-12 text-center text-slate-500 dark:text-slate-400 font-medium">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="text-sm flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-indigo-500" />
            AutoFare Safe Smart Government Platform
          </div>
          <div className="text-xs max-w-md leading-relaxed text-slate-400 dark:text-slate-500">
            Automated transportation system designed to optimize passenger security, verify driver fairness, and handle refund operations.
          </div>
        </div>
      </footer>
    </div>
  );
}
