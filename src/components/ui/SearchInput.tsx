import { Search } from 'lucide-react';
import type { InputHTMLAttributes } from 'react';

export const SearchInput = (props: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input {...props} className={`glass-input pr-12 ${props.className ?? ''}`} />
    </div>
  );
};