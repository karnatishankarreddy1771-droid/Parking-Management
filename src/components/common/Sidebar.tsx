import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  CalendarPlus, 
  Ticket, 
  ShieldCheck, 
  UserCheck, 
  LogIn, 
  LogOut as LogOutIcon, 
  History, 
  AlertTriangle, 
  Users, 
  Sliders, 
  BarChart3, 
  Settings, 
  Bell, 
  User,
  SquareParking
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const residentNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Parking', path: '/resident/parking', icon: SquareParking },
    { label: 'Visitor Booking', path: '/resident/booking', icon: CalendarPlus },
    { label: 'My Bookings', path: '/resident/my-bookings', icon: Ticket },
    { label: 'Vehicles', path: '/resident/vehicles', icon: Car },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  const securityNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/security/dashboard', icon: LayoutDashboard },
    { label: "Today's Visitors", path: '/security/visitors-today', icon: UserCheck },
    { label: 'Visitor Entry', path: '/security/entry', icon: LogIn },
    { label: 'Visitor Exit', path: '/security/exit', icon: LogOutIcon },
    { label: 'Visitor Logs', path: '/security/visitor-logs', icon: History },
    { label: 'Violations', path: '/security/violations', icon: AlertTriangle }
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Parking Slots', path: '/admin/parking-slots', icon: SquareParking },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Visitor Rules', path: '/admin/visitor-rules', icon: Sliders },
    { label: 'Violations', path: '/admin/violations', icon: AlertTriangle },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const getNavItems = (userRole: UserRole | null): NavItem[] => {
    switch (userRole) {
      case 'Security':
        return securityNavItems;
      case 'Admin':
        return adminNavItems;
      case 'Resident':
      default:
        return residentNavItems;
    }
  };

  const navItems = getNavItems(role);

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-4 transition-colors">
      <div className="mb-4 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Role Portal
        </span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          {role || 'Resident'}
        </span>
      </div>

      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
