import { Loader2 } from 'lucide-react';

export const LoadingState = ({ label = 'جاري التحميل...' }: { label?: string }) => {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-slate-300">
      <Loader2 className="animate-spin text-cyan-300" size={36} />
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};