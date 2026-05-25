import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { AppShell } from './components/layout/AppShell';
import { LoadingState } from './components/ui/LoadingState';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { NewSalePage } from './pages/NewSalePage';
import { LedgerPage } from './pages/LedgerPage';
import { SettingsPage } from './pages/SettingsPage';
import type { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { session, loading, error } = useAuth();

  if (loading) return <LoadingState label="جاري تحميل الجلسة..." />;
  if (error) return <div className="min-h-screen p-6 text-rose-200">{error}</div>;
  if (!session) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const LoginGate = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <LoadingState label="جاري التحميل..." />;
  if (session) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-grid-glow text-slate-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="min-h-screen"
        >
          <Routes>
            <Route
              path="/login"
              element={
                <LoginGate>
                  <LoginPage />
                </LoginGate>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="sales/new" element={<NewSalePage />} />
              <Route path="ledger" element={<LedgerPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}