import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, User, Car, CheckCircle2, Ticket, Copy, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { VehicleType } from '../../types';

const todayStr = new Date().toISOString().split('T')[0];

const bookingSchema = z.object({
  guestName: z.string().trim().min(2, 'Guest full name must be at least 2 characters').max(60, 'Guest name cannot exceed 60 characters'),
  guestPhone: z.string().trim().regex(/^[\d\+\-\s\(\)]{10,18}$/, 'Please enter a valid phone number with at least 10 digits'),
  vehicleNumber: z.string().trim().regex(/^[A-Za-z0-9\s\-]{4,15}$/, 'Enter a valid vehicle license plate (4-15 alphanumeric characters)'),
  vehicleType: z.enum(['Car', 'Bike', 'SUV', 'EV', 'Other']),
  date: z.string().min(1, 'Booking date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required')
}).refine(
  (data) => {
    if (data.date < todayStr) {
      return false;
    }
    return true;
  },
  {
    message: 'Booking date cannot be in the past',
    path: ['date']
  }
).refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return data.endTime > data.startTime;
    }
    return true;
  },
  {
    message: 'End time must be later than start time',
    path: ['endTime']
  }
);

type BookingFormData = z.infer<typeof bookingSchema>;

export const VisitorBookingForm: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [createdPass, setCreatedPass] = useState<{ passCode: string; bookingId: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guestName: '',
      guestPhone: '',
      vehicleNumber: '',
      vehicleType: 'Car',
      date: todayStr,
      startTime: '10:00',
      endTime: '18:00'
    }
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!userProfile?.uid) return;
    setSubmitting(true);

    try {
      const bookingId = await bookingService.createBooking({
        residentId: userProfile.uid,
        residentName: userProfile.name,
        flatNumber: userProfile.flatNumber || 'A-101',
        guestName: data.guestName.trim(),
        guestPhone: data.guestPhone.trim(),
        vehicleNumber: data.vehicleNumber.trim().toUpperCase(),
        vehicleType: data.vehicleType as VehicleType,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'Approved'
      });

      // Retrieve created booking pass code
      const created = await bookingService.getUserBookings(userProfile.uid);
      const pass = created.find(b => b.id === bookingId);

      setCreatedPass({
        passCode: pass?.passCode || '849201',
        bookingId
      });
    } catch (err) {
      console.error('Error creating booking:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPass = () => {
    if (createdPass) {
      navigator.clipboard.writeText(createdPass.passCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {createdPass ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Visitor Pass Issued!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Share this 6-digit gate code with your guest for security verification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 inline-block w-full max-w-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Gate Passcode
            </span>
            <span className="text-4xl font-black font-mono text-indigo-700 dark:text-indigo-300 tracking-widest">
              #{createdPass.passCode}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleCopyPass}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied to Clipboard!' : 'Copy Gate Passcode'}
            </button>
            <button
              onClick={() => navigate('/resident/my-bookings')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              View My Passes
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
          
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  Issue Visitor Parking Pass
                </h1>
                <p className="text-xs text-slate-500">
                  Pre-approve guest parking for instant security check-in
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Guest Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...register('guestName')}
                    placeholder="Marcus Vance"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {errors.guestName && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.guestName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Guest Phone Number
                </label>
                <input
                  type="tel"
                  {...register('guestPhone')}
                  placeholder="+1 555-0199"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {errors.guestPhone && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.guestPhone.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Registration Number
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...register('vehicleNumber')}
                    placeholder="KA05MN2024"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {errors.vehicleNumber && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.vehicleNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Category
                </label>
                <select
                  {...register('vehicleType')}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Car">Car</option>
                  <option value="Bike">Bike / Two-Wheeler</option>
                  <option value="SUV">SUV</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  {...register('date')}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {errors.date && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  {...register('startTime')}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {errors.startTime && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.startTime.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  {...register('endTime')}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                {errors.endTime && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.endTime.message}</p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                {submitting ? 'Generating Pass...' : 'Generate Gate Passcode'}
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
};
