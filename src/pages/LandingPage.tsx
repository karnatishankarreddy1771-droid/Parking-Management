import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, 
  ShieldCheck, 
  Clock, 
  QrCode, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Lock, 
  Sparkles,
  Zap,
  Building2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();

  const handleGetStarted = () => {
    if (currentUser) {
      if (role === 'Security') navigate('/security/dashboard');
      else if (role === 'Admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden">
      
      {/* Background Radial Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <nav className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-500/30">
            <Car className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Parking<span className="text-indigo-400">'s</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-xs font-semibold px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <button
            onClick={handleGetStarted}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
          >
            {currentUser ? 'Go to Dashboard' : 'Explore Platform'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 text-xs font-semibold mb-8 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Next-Gen Intelligent Parking SaaS Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Smart Parking Management for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Modern Communities</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate parking stress for Residents, streamline gate verification for Security Guards, and gain real-time occupancy analytics for Admins — backed by Firebase Realtime DB.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm transition-all"
            >
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Hero Illustration / Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 p-4 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-2xl backdrop-blur-md max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            
            {/* Slot Card Mock */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">Resident Slot</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Occupied
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">Slot A-101</h3>
              <p className="text-xs text-slate-400 mt-1">Assigned to Flat 402 • Alex Johnson</p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Vehicle: KA-05-MN-2024</span>
                <Car className="w-4 h-4 text-indigo-400" />
              </div>
            </div>

            {/* Visitor Pass Mock */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">Active Visitor Pass</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Code #849201
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Guest: Marcus Vance</h3>
              <p className="text-xs text-slate-400 mt-1">Slot V-04 • Today 02:00 PM - 06:00 PM</p>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Pass Status: Approved</span>
                <QrCode className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            {/* Live Analytics Mock */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400">Live Occupancy</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  82% Capacity
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">142 / 175 Slots</h3>
              <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[82%]" />
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>3 Active Violations</span>
                <BarChart3 className="w-4 h-4 text-rose-400" />
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Engineered for Operations
          </h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tailored Experiences for Every Role
          </p>
          <p className="mt-4 text-slate-400 text-sm">
            Instant synchronization between Resident passes, Security gatekeeper controls, and Admin policy enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Resident Feature */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Resident Portal</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Book visitor parking passes in under 10 seconds, manage personal vehicles, receive instant gate entry alerts, and view assigned slots.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> 6-Digit Gate Passcodes</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Vehicle Registration & Tagging</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Real-time Pass Status Alerts</li>
            </ul>
          </div>

          {/* Security Feature */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Security Console</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Rapid visitor verification by passcode or vehicle license plate, one-tap check-in/check-out logging, and instant violation reporting.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Passcode & Plate Verification</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Live Visitor Entry/Exit Logs</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Parking Violation Logger</li>
            </ul>
          </div>

          {/* Admin Feature */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Admin Command Center</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Complete oversight over building parking slots, user accounts, visitor allocation rules, peak hour trends, and system settings.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Parking Slot CRUD & Mapping</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Role-Based Access Control</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Recharts Capacity Visualizer</li>
            </ul>
          </div>

        </div>
      </section>

      {/* Benefits Banner */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-indigo-950/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to Upgrade Community Parking Operations?
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Plug in your Firebase project configuration and start managing parking slots immediately.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs hover:bg-slate-100 transition-colors shrink-0 flex items-center gap-2 shadow-lg"
          >
            Access Login Portal
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
