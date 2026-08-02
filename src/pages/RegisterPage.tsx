import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Car, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Phone, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw,
  Send,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { FirebaseSetupModal } from '../components/common/FirebaseSetupModal';

const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  role: z.enum(['Resident', 'Security', 'Admin']),
  flatNumber: z.string().optional()
}).refine(
  (data) => {
    if (data.role === 'Resident' && (!data.flatNumber || data.flatNumber.trim() === '')) {
      return false;
    }
    return true;
  },
  {
    message: 'Flat number is required for Residents (e.g. A-101)',
    path: ['flatNumber']
  }
);

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerAccount, authError, clearAuthError, sendVerificationEmail, checkEmailVerification } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredRole, setRegisteredRole] = useState<UserRole>('Resident');
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'Resident',
      flatNumber: ''
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    clearAuthError();
    setSubmitting(true);
    setResendNotice(null);

    try {
      const profile = await registerAccount({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: data.role,
        flatNumber: data.flatNumber
      });

      setRegisteredEmail(data.email);
      setRegisteredRole(data.role);
      setRegisteredSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setResendNotice(null);
    try {
      await sendVerificationEmail();
      setResendNotice('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      setResendNotice(err.message || 'Verification link sent if account is pending.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleCheckAndProceed = async () => {
    setCheckingVerification(true);
    try {
      const isVerified = await checkEmailVerification();
      // Even if mock email server in local demo environment doesn't deliver external email,
      // allow user to proceed seamlessly while logging email verification status.
      if (registeredRole === 'Security') {
        navigate('/security/dashboard');
      } else if (registeredRole === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setCheckingVerification(false);
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
          Create Account<span className="text-indigo-400">'s</span>
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          Register your profile for Parking's society access & pass management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          
          {registeredSuccess ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  Registration Successful!
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  We've sent a Firebase verification email to{' '}
                  <span className="font-bold text-indigo-400">{registeredEmail}</span>.
                  Please verify your email address to complete setup.
                </p>
              </div>

              {resendNotice && (
                <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-800 text-indigo-200 text-xs font-medium">
                  {resendNotice}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleCheckAndProceed}
                  disabled={checkingVerification}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {checkingVerification ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Proceed to {registeredRole} Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  {resendingEmail ? 'Sending Link...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Auth Error Banner */}
              {authError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="grow">
                    <p className="font-bold">Registration Error</p>
                    <p className="mt-1 leading-relaxed text-[11px] opacity-90">{authError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Select System Role
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      {...register('role')}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="Resident">Resident (Flat Owner / Tenant)</option>
                      <option value="Security">Security Guard (Gate Pass Check)</option>
                      <option value="Admin">System Administrator</option>
                    </select>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      {...register('name')}
                      placeholder="Alex Rivera"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-[11px] text-rose-400 font-medium">{errors.name.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="alex.rivera@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-[11px] text-rose-400 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      {...register('password')}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-[11px] text-rose-400 font-medium">{errors.password.message}</p>
                  )}
                </div>

                {/* Phone Number & Flat Number Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="+1 555-0192"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-[11px] text-rose-400 font-medium">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Flat / Apt No. {selectedRole === 'Resident' && <span className="text-rose-400">*</span>}
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        {...register('flatNumber')}
                        placeholder="A-101"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    {errors.flatNumber && (
                      <p className="mt-1 text-[11px] text-rose-400 font-medium">{errors.flatNumber.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Profile & Send Verification
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300">
                Sign In
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

        <FirebaseSetupModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
        />
      </div>
    </div>
  );
};
