import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, ShieldCheck } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  
  const hourlyOccupancy = [
    { time: '00:00', rate: 30 },
    { time: '04:00', rate: 20 },
    { time: '08:00', rate: 65 },
    { time: '12:00', rate: 85 },
    { time: '16:00', rate: 75 },
    { time: '20:00', rate: 95 },
    { time: '22:00', rate: 50 }
  ];

  const weeklyTraffic = [
    { day: 'Mon', visitors: 42, residents: 120 },
    { day: 'Tue', visitors: 38, residents: 118 },
    { day: 'Wed', visitors: 45, residents: 122 },
    { day: 'Thu', visitors: 50, residents: 125 },
    { day: 'Fri', visitors: 85, residents: 130 },
    { day: 'Sat', visitors: 110, residents: 135 },
    { day: 'Sun', visitors: 95, residents: 128 }
  ];

  const categoryShare = [
    { name: 'Resident Slots', value: 55, color: '#6366f1' },
    { name: 'Visitor Passes', value: 25, color: '#8b5cf6' },
    { name: 'EV Chargers', value: 12, color: '#06b6d4' },
    { name: 'Handicapped', value: 8, color: '#ec4899' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Parking System Analytics & Insights
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical occupancy curves, peak traffic patterns, and slot utilization metrics
        </p>
      </div>

      {/* Top Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hourly Curve */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
            24-Hour Peak Occupancy (%)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Average slot occupancy rate throughout the day</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyOccupancy}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
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
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Visitor vs Resident Traffic */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
            Weekly Traffic Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">Visitor entries vs Resident vehicle volume</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTraffic}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
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
                <Bar dataKey="visitors" name="Visitors" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="residents" name="Residents" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Category Share & Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pie Distribution */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-1/2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">Proportion of parking slots allocated by type</p>

            <div className="space-y-2 text-xs">
              {categoryShare.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-48 w-full md:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryShare}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
              Key Insights
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <span className="font-bold text-indigo-700 dark:text-indigo-300 block mb-1">
                  Peak Visitor Hours
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  Highest guest entry requests occur between 18:00 and 21:00 on Fridays and Saturdays.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <span className="font-bold text-purple-700 dark:text-purple-300 block mb-1">
                  Average Stay Duration
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  Visitor passes average 3.4 hours per stay, well within the 8-hour max policy limit.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
