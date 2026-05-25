import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '../components/ui/GlassCard';
import type { FormEvent } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { session, signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'LensLedger Pro - تسجيل الدخول';
  }, []);

  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="relative overflow-hidden p-8 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,.18),transparent_26%)]" />
          <div className="relative">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 text-slate-950 shadow-lg shadow-cyan-500/30">
                <Camera size={28} />
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white">LensLedger Pro</div>
                <div className="text-sm text-cyan-200">Camera Shop Control Room</div>
              </div>
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight text-white lg:text-5xl">لوحة مالية مستقبلية لمتجر كاميرات المراقبة الخاص بك</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">سجلّ موحد متعدد المستخدمين، مبني على Supabase، مع صلاحيات، أرصدة، دفعات جزئية، ومخزون متصل بالحساب نفسه.</p>
            <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              {['بيئة RTL عربية', 'RLS على مستوى المتجر', 'إدارة العملاء والبضائع', 'تقارير وأرصدة مباشرة'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">{item}</div>
              ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 lg:p-10">
          <h2 className="text-2xl font-bold text-white">تسجيل الدخول</h2>
          <p className="mt-2 text-sm leading-7 text-slate-400">ادخل بريد Supabase وكلمة المرور للوصول إلى بيانات المتجر.</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-200">البريد الإلكتروني</span>
              <input className="glass-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-200">كلمة المرور</span>
              <input className="glass-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
            </label>
            {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
            <button type="submit" disabled={submitting || loading} className="glass-button-primary w-full justify-center disabled:opacity-60">
              {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
              {submitting ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};