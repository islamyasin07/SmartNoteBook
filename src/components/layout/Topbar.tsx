import { Menu, MoonStar, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { roleLabel } from '../../lib/formatters';

export const Topbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user, profile, role } = useAuth();

  return (
    <header className="glass-panel flex items-center justify-between rounded-3xl px-4 py-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button className="glass-button-secondary lg:hidden" onClick={onMenuClick}>
          <Menu size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2 text-sm text-cyan-200">
            <ShieldCheck size={16} />
            <span>{profile?.full_name || 'المستخدم الحالي'}</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">{user?.email}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 md:flex">
          {role ? roleLabel[role] : 'غير محدد'}
        </div>
        <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-200">
          <MoonStar size={16} />
        </div>
      </div>
    </header>
  );
};