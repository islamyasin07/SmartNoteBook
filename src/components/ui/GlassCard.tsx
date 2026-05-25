import type { ReactNode } from 'react';

export const GlassCard = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return <div className={`glass-panel rounded-3xl ${className}`}>{children}</div>;
};