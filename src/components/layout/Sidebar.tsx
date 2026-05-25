import { NavLink } from 'react-router-dom';
import { Camera, LayoutDashboard, LogOut, ReceiptText, Settings, ShoppingBag, SquarePlus, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { roleLabel } from '../../lib/formatters';

const navItems = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/customers', label: 'الزبائن', icon: Users },
  { to: '/products', label: 'البضائع', icon: ShoppingBag },
  { to: '/sales/new', label: 'عملية بيع جديدة', icon: SquarePlus },
  { to: '/ledger', label: 'السجل', icon: ReceiptText },
  { to: '/settings', label: 'الإعدادات', icon: Settings }
];

export const Sidebar = () => {
  const { profile, user, signOut } = useAuth();
  const { role } = useRole();

  return (
    <aside className="glass-panel sticky top-0 hidden h-screen w-80 flex-col overflow-hidden border-l border-white/10 lg:flex">
      <div className="border-b border-white/10 p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 text-slate-950 shadow-lg shadow-cyan-500/30">
            <Camera size={24} />
          </div>
          <div>
            <div className="text-lg font-extrabold tracking-wide text-white">LensLedger Pro</div>
            <div className="text-xs text-slate-400">Camera Shop Control Room</div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-slate-400">المستخدم</div>
          <div className="mt-1 font-semibold text-white">{user?.email}</div>
          <div className="mt-2 inline-flex rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-200">
            {role ? roleLabel[role] : 'غير محدد'}
          </div>
          <div className="mt-2 text-xs text-slate-400">{profile?.full_name || 'بدون اسم'}</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${isActive ? 'bg-cyan-500/15 text-cyan-200 shadow-inner shadow-cyan-500/10' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`
              }
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button className="glass-button-secondary w-full justify-between" onClick={() => void signOut()}>
          <span>تسجيل الخروج</span>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};