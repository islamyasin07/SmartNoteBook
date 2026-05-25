import type { ReactNode } from 'react';

export const FormField = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label className="block space-y-2">
    <span className="text-sm font-semibold text-slate-200">{label}</span>
    {children}
    {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
  </label>
);