import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { UserRole } from './types';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Resident Pages
import { ResidentDashboard } from './pages/resident/ResidentDashboard';
import { MyParking } from './pages/resident/MyParking';
import { VisitorBookingForm } from './pages/resident/VisitorBookingForm';
import { MyBookings } from './pages/resident/MyBookings';
import { MyVehicles } from './pages/resident/MyVehicles';
import { ResidentNotifications } from './pages/resident/ResidentNotifications';
import { ResidentProfile } from './pages/resident/ResidentProfile';

// Security Pages
import { SecurityDashboard } from './pages/security/SecurityDashboard';
import { TodaysVisitors } from './pages/security/TodaysVisitors';
import { VisitorEntry } from './pages/security/VisitorEntry';
import { VisitorExit } from './pages/security/VisitorExit';
import { VisitorLogs } from './pages/security/VisitorLogs';
import { SecurityViolations } from './pages/security/SecurityViolations';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageSlots } from './pages/admin/ManageSlots';
import { ManageUsers } from './pages/admin/ManageUsers';
import { VisitorRules } from './pages/admin/VisitorRules';
import { ManageViolations } from './pages/admin/ManageViolations';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { AdminSettings } from './pages/admin/AdminSettings';

// Protected Route Guard
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-slate-400">Verifying session...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to proper dashboard based on role
    if (role === 'Security') return <Navigate to="/security/dashboard" replace />;
    if (role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Route Redirect based on user role
const RoleBasedDefault: React.FC = () => {
  const { role } = useAuth();

  if (role === 'Security') return <Navigate to="/security/dashboard" replace />;
  if (role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
  return <ResidentDashboard />;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected App Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Default Dashboard Dispatcher */}
                <Route path="/dashboard" element={<RoleBasedDefault />} />

                {/* Resident Routes */}
                <Route path="/resident/parking" element={<MyParking />} />
                <Route path="/resident/booking" element={<VisitorBookingForm />} />
                <Route path="/resident/my-bookings" element={<MyBookings />} />
                <Route path="/resident/vehicles" element={<MyVehicles />} />
                <Route path="/notifications" element={<ResidentNotifications />} />
                <Route path="/profile" element={<ResidentProfile />} />

                {/* Security Routes */}
                <Route
                  path="/security/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['Security', 'Admin']}>
                      <SecurityDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/security/visitors-today"
                  element={
                    <ProtectedRoute allowedRoles={['Security', 'Admin']}>
                      <TodaysVisitors />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/security/entry"
                  element={
                    <ProtectedRoute allowedRoles={['Security', 'Admin']}>
                      <VisitorEntry />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/security/exit"
                  element={
                    <ProtectedRoute allowedRoles={['Security', 'Admin']}>
                      <VisitorExit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/security/visitor-logs"
                  element={
                    <ProtectedRoute allowedRoles={['Security', 'Admin']}>
                      <VisitorLogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/security/violations"
                  element={
                    <ProtectedRoute allowedRoles={['Security', 'Admin']}>
                      <SecurityViolations />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/parking-slots"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <ManageSlots />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/visitor-rules"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <VisitorRules />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/violations"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <ManageViolations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <AdminSettings />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
