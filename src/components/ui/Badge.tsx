import { statusLabel, roleLabel } from '../../lib/formatters';
import { Role, TransactionStatus } from '../../types';
import type { ReactNode } from 'react';

export const Badge = ({
  children,
  tone = 'neutral'
}: {
  children?: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'role' | 'status';
}) => {
  const tones = {
    neutral: 'bg-white/10 text-slate-200 border-white/10',
    success: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20',
    warning: 'bg-amber-500/15 text-amber-200 border-amber-400/20',
    danger: 'bg-rose-500/15 text-rose-200 border-rose-400/20',
    info: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/20',
    role: 'bg-violet-500/15 text-violet-200 border-violet-400/20',
    status: 'bg-sky-500/15 text-sky-200 border-sky-400/20'
  } as const;

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
};

export const RoleBadge = ({ role }: { role: Role | null }) => <Badge tone="role">{role ? roleLabel[role] : 'غير محدد'}</Badge>;
export const StatusBadge = ({ status }: { status: TransactionStatus }) => <Badge tone="status">{statusLabel[status]}</Badge>;