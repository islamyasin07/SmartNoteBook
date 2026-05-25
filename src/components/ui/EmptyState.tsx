import { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) => {
  return (
    <div className="flex min-h-[28rem] flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-8 text-center">
      <div className="mb-4 rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-200">
        <Icon size={34} />
      </div>
      <h3 className="text-2xl font-bold text-white">{title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
};