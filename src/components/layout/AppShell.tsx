import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-4 py-4 lg:px-6 lg:py-6">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
          <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="glass-panel min-h-[calc(100vh-7.5rem)] rounded-[2rem] p-4 lg:p-6"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/80 p-4 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="h-full w-full max-w-sm" onClick={(event) => event.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      ) : null}
    </div>
  );
};