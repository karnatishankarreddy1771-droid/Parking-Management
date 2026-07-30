import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Car, 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Shield, 
  Users, 
  KeyRound,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirebaseSetupModal } from '../components/common/FirebaseSetupModal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const profile = await login(email.trim(), password);
      setLoading(false);
      
      if (profile?.role === 'Security') {
        navigate('/security/dashboard');
      } else if (profile?.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setLoading(false);
    }
  };

  // Demo credentials quick filler
  const fillDemoCredentials = (roleType: 'resident' | 'security' | 'admin') => {
    clearAuthError();
    if (roleType === 'resident') {
      setEmail('resident@parkings.com');
      setPassword('Resident@123');
    } else if (roleType === 'security') {
      setEmail('security@parkings.com');
      setPassword('Security@123');
    } else {
      setEmail('admin@parkings.com');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/15 blur-3xl pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-xl shadow-indigo-600/40">
            <Car className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-black text-white tracking-tight">
          Welcome to Parking<span className="text-indigo-400">'s</span>
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Sign in to access your Resident, Security, or Admin Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          
          {/* Auth Error Banner */}
          {authError && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="grow">
                <p className="font-bold">Authentication Failed</p>
                <p className="mt-1 leading-relaxed text-[11px] opacity-90">{authError}</p>
              </div>
            </div>
          )}

          {forgotSent && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Password reset instructions sent if account exists.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (authError) clearAuthError();
                  }}
                  placeholder="resident@parkings.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) clearAuthError();
                  }}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In with Firebase
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Quick Role Test Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('resident')}
                className="py-2 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 flex flex-col items-center gap-1 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Resident
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('security')}
                className="py-2 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 flex flex-col items-center gap-1 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Security
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="py-2 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 flex flex-col items-center gap-1 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300">
                Register Now
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Configure Firebase SDK Credentials
            </button>
          </div>

        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300">
            ← Back to Landing Page
          </Link>
        </div>
      </div>

      <FirebaseSetupModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  );
};
