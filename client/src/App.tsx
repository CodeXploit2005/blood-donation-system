import React from 'react';
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
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Page Transition wrapper with 8px subtle slide + fade
const PageTransition = ({ children }) => {
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
              <ProtectedRoute>
                <PageTransition>
                  <RegisterDonation />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <MyRegistrations />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-qr"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <MyQRCode />
                </PageTransition>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Auth Layout Routes */}
        <Route element={<AuthLayout />}>
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
