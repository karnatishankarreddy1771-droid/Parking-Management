import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  SquareParking, 
  AlertTriangle, 
  Sliders, 
  ShieldCheck, 
  TrendingUp, 
  Building2,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/common/StatCard';
import { parkingService } from '../../services/parkingService';
import { userService } from '../../services/userService';
import { violationService } from '../../services/violationService';
import { analyticsService } from '../../services/analyticsService';
import { ParkingSlot, User, Violation } from '../../types';
import { seedInitialData } from '../../utils/seedData';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();

  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    // Listen to real-time slots
    const unsubSlots = parkingService.listenToSlots((data) => {
      setSlots(data);
      setLoading(false);
      clearTimeout(timer);
    });

    // Listen to users
    const unsubUsers = userService.listenToUsers((uData) => {
      setUsers(uData);
    });

    // Listen to violations
    const unsubViolations = violationService.listenToViolations((vData) => {
      setViolations(vData);
    });

    return () => {
      clearTimeout(timer);
      if (typeof unsubSlots === 'function') unsubSlots();
      if (typeof unsubUsers === 'function') unsubUsers();
      if (typeof unsubViolations === 'function') unsubViolations();
    };
  }, []);

  const handleRunSeed = async () => {
    setSeeding(true);
    setSeedDone(false);
    try {
      await seedInitialData();
      setSeedDone(true);
      setTimeout(() => setSeedDone(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading Admin Command Center..." />;

  const occupiedSlots = slots.filter(s => s.status === 'Occupied').length;
  const totalSlots = slots.length || 100;
  const occupancyRate = Math.round((occupiedSlots / totalSlots) * 100);

  // Hourly trend chart mock data (computed or analytical)
  const occupancyData = [
    { hour: '06:00', occupancy: 25 },
    { hour: '09:00', occupancy: 70 },
    { hour: '12:00', occupancy: 85 },
    { hour: '15:00', occupancy: 80 },
    { hour: '18:00', occupancy: 95 },
    { hour: '21:00', occupancy: 90 },
    { hour: '23:59', occupancy: 40 }
  ];

  const categoryDistribution = [
    { category: 'Resident Reserved', count: slots.filter(s => s.type === 'Resident').length || 45 },
    { category: 'Visitor Slots', count: slots.filter(s => s.type === 'Visitor').length || 20 },
    { category: 'EV Charging', count: slots.filter(s => s.type === 'EV Charging').length || 10 },
    { category: 'Handicapped', count: slots.filter(s => s.type === 'Handicapped').length || 5 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Admin Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            System Administration Portal
          </h1>
          <p className="text-xs text-purple-100 mt-1">
            Property parking allocation, real-time analytics, user roles & seed tool
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunSeed}
            disabled={seeding}
            className="px-4 py-2.5 rounded-2xl bg-white text-purple-900 font-extrabold text-xs hover:bg-purple-50 transition-colors shadow-md flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 text-purple-600 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding Firestore...' : 'Seed Test Data'}
          </button>
        </div>
      </div>

      {seedDone && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <span>✅ Firestore collections (Slots & Settings) seeded successfully!</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Parking Capacity"
          value={totalSlots}
          subtitle={`${slots.filter(s => s.status === 'Available').length} Available Now`}
          icon={SquareParking}
          color="indigo"
        />
        <StatCard
          title="Current Occupancy Rate"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedSlots} / ${totalSlots} Slots Occupied`}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Registered Users"
          value={users.length}
          subtitle="Residents, Security & Admins"
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Active Violations"
          value={violations.filter(v => v.status === 'Open').length}
          subtitle="Unresolved infractions"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Occupancy Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Hourly Occupancy Trend
              </h3>
              <p className="text-xs text-slate-500">Live property parking slot utilization</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800">
              Peak: 95% at 18:00
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#occupancyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Slot Category Allocation Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="mb-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Slot Category Breakdown
            </h3>
            <p className="text-xs text-slate-500">Total capacity allocation by category</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Admin Operations Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/parking-slots"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 shadow-xs transition-all group"
        >
          <SquareParking className="w-6 h-6 text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Manage Parking Slots</h4>
          <p className="text-xs text-slate-500 mt-1">Configure buildings, floors, and slot assignments</p>
        </Link>

        <Link
          to="/admin/users"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500/50 shadow-xs transition-all group"
        >
          <Users className="w-6 h-6 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">User Management</h4>
          <p className="text-xs text-slate-500 mt-1">Assign Resident, Security & Admin permissions</p>
        </Link>

        <Link
          to="/admin/visitor-rules"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/50 shadow-xs transition-all group"
        >
          <Sliders className="w-6 h-6 text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Visitor Rules</h4>
          <p className="text-xs text-slate-500 mt-1">Set max visitor duration, curfews & quotas</p>
        </Link>

        <Link
          to="/admin/analytics"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs transition-all group"
        >
          <BarChart3 className="w-6 h-6 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Advanced Analytics</h4>
          <p className="text-xs text-slate-500 mt-1">Peak hour trends, traffic, and overstay audit</p>
        </Link>
      </div>

    </div>
  );
};
