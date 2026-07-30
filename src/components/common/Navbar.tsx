import React, { useState } from 'react';
import { 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Shield, 
  Car, 
  Database,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { Badge } from './Badge';
import { FirebaseSetupModal } from './FirebaseSetupModal';

export const Navbar: React.FC = () => {
  const { userProfile, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/20">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Parking<span className="text-indigo-600 dark:text-indigo-400">'s</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-200 dark:border-indigo-900">
                SaaS
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Firebase Backend Indicator Button */}
            <button
              onClick={() => setShowFirebaseModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Firebase Configuration & Seed"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Firebase</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in zoom-in-95 duration-150">
                  <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-3.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 ${
                            !n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className="grow">
                            <p className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                              <span>{n.title}</span>
                              <span className="text-[10px] font-normal text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </p>
                            <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-snug">
                              {n.message}
                            </p>
                          </div>
                          {!n.read && n.id && (
                            <button
                              onClick={() => markAsRead(n.id!)}
                              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-200 dark:border-indigo-800">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                    {userProfile?.name || 'Account'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {role || 'Resident'}
                  </p>
                </div>
              </button>

              {/* Profile Menu Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {userProfile?.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {userProfile?.email}
                    </p>
                    {role && (
                      <div className="mt-1.5">
                        <Badge status={role} />
                      </div>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowFirebaseModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Database className="w-4 h-4 text-indigo-500" />
                      Firebase Setup
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Firebase Setup Modal */}
      <FirebaseSetupModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
      />
    </>
  );
};
