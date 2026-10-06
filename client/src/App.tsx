import React, { useLayoutEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useAuth from './hooks/useAuth';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import PasswordRecovery from './pages/auth/PasswordRecovery';

// User Pages
import Home from './pages/user/Home';
import Events from './pages/user/Events';
import EventDetail from './pages/user/EventDetail';
import RegisterDonation from './pages/user/RegisterDonation';
import MyRegistrations from './pages/user/MyRegistrations';
import MyQRCode from './pages/user/MyQRCode';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import EventsManagement from './pages/admin/EventsManagement';
import EventCreate from './pages/admin/EventCreate';
import EventEdit from './pages/admin/EventEdit';
import RegistrationsManagement from './pages/admin/RegistrationsManagement';
import Checkin from './pages/admin/Checkin';
import Reports from './pages/admin/Reports';
import AccountsManagement from './pages/admin/AccountsManagement';

// Protected Route wrappers
const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false, donorOnly = false }) => {
  const { isAuthenticated, isAdmin, isStaff, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if ((adminOnly && !isAdmin) || (staffOnly && !isAdmin && !isStaff)) {
    return <Navigate to="/" replace />;
  }

  if (donorOnly && (isAdmin || isStaff)) {
    return <Navigate to={isStaff ? '/staff/registrations' : '/admin/dashboard'} replace />;
  }

  return children;
};

// Page Transition wrapper with 8px subtle slide + fade
const PageTransition = ({ children }) => {
  // Reset when the incoming page mounts, after the previous page exits.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export const App = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public & User Layout Routes */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/events"
            element={
              <PageTransition>
                <Events />
              </PageTransition>
            }
          />
          <Route
            path="/events/:id"
            element={
              <PageTransition>
                <EventDetail />
              </PageTransition>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/register-donation/:eventId"
            element={
              <ProtectedRoute donorOnly>
                <PageTransition>
                  <RegisterDonation />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute donorOnly>
                <PageTransition>
                  <MyRegistrations />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-qr"
            element={
              <ProtectedRoute donorOnly>
                <PageTransition>
                  <MyQRCode />
                </PageTransition>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/forgot-password" element={<PageTransition><PasswordRecovery /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><PasswordRecovery /></PageTransition>} />
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />
        </Route>

        <Route path="/staff" element={<ProtectedRoute staffOnly><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/staff/registrations" replace />} />
          <Route path="registrations" element={<PageTransition><RegistrationsManagement /></PageTransition>} />
          <Route path="checkin" element={<PageTransition><Checkin /></PageTransition>} />
        </Route>

        {/* Admin Protected Layout Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />
          <Route
            path="events"
            element={
              <PageTransition>
                <EventsManagement />
              </PageTransition>
            }
          />
          <Route
            path="events/new"
            element={
              <PageTransition>
                <EventCreate />
              </PageTransition>
            }
          />
          <Route
            path="events/edit/:id"
            element={
              <PageTransition>
                <EventEdit />
              </PageTransition>
            }
          />
          <Route
            path="registrations"
            element={
              <PageTransition>
                <RegistrationsManagement />
              </PageTransition>
            }
          />
          <Route
            path="checkin"
            element={
              <PageTransition>
                <Checkin />
              </PageTransition>
            }
          />
          <Route
            path="reports"
            element={
              <PageTransition>
                <Reports />
              </PageTransition>
            }
          />
          <Route
            path="accounts"
            element={
              <PageTransition>
                <AccountsManagement />
              </PageTransition>
            }
          />
        </Route>

        {/* Catch-all 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-porcelain">
              <h2 className="font-display text-4xl font-bold text-ink mb-2">404</h2>
              <p className="text-sm text-ink-muted mb-6">Trang bạn tìm kiếm không tồn tại.</p>
              <Navigate to="/" replace />
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
