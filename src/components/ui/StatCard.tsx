import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

export const StatCard = ({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'cyan'
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone?: 'cyan' | 'violet' | 'emerald' | 'amber';
}) => {
  const tones = {
    cyan: 'from-cyan-400 to-blue-500',
    violet: 'from-violet-400 to-fuchsia-500',
    emerald: 'from-emerald-400 to-cyan-500',
    amber: 'from-amber-300 to-orange-500'
  } as const;

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400">{label}</div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">{value}</div>
          {hint ? <div className="mt-2 text-xs text-slate-500">{hint}</div> : null}
        </div>
        <div className={`rounded-2xl bg-gradient-to-br ${tones[tone]} p-3 text-slate-950 shadow-lg shadow-cyan-500/20`}>
          <Icon size={20} />
        </div>
      </div>
    </GlassCard>
  );
};