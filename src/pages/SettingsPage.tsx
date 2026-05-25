import { useEffect, useState } from 'react';
import { Download, Settings2, ShieldCheck, Store } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { getShopById } from '../services/profileService';
import { getCustomers } from '../services/customersService';
import { getProducts } from '../services/productsService';
import { getTransactions } from '../services/transactionsService';
import { getPaymentsByTransaction } from '../services/paymentsService';
import { GlassCard } from '../components/ui/GlassCard';
import { LoadingState } from '../components/ui/LoadingState';
import { formatDateTime, roleLabel } from '../lib/formatters';

export const SettingsPage = () => {
  const { shopId, profile, user } = useAuth();
  const { canExport } = useRole();
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    getShopById(shopId).then((result) => {
      setShopName(result.shop?.name ?? '—');
      setLoading(false);
    });
  }, [shopId]);

  const exportJson = async () => {
    if (!shopId) return;
    const [customers, products, transactions] = await Promise.all([getCustomers(shopId), getProducts(shopId), getTransactions(shopId)]);
    const payload = {
      exportedAt: new Date().toISOString(),
      shopName,
      profile,
      customers: customers.customers,
      products: products.products,
      transactions: transactions.transactions
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `lensledger-pro-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <LoadingState label="جاري تحميل الإعدادات..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">الإعدادات</h1>
        <p className="mt-1 text-sm text-slate-400">معلومات المتجر، المستخدم الحالي، والتصدير الإداري.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 text-cyan-200"><Store size={18} /> معلومات المتجر</div>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div>اسم المتجر: <span className="text-white">{shopName}</span></div>
            <div>معرّف المتجر: <span className="text-white">{shopId}</span></div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3 text-violet-200"><ShieldCheck size={18} /> الملف الشخصي الحالي</div>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div>الاسم: <span className="text-white">{profile?.full_name || '—'}</span></div>
            <div>البريد: <span className="text-white">{user?.email}</span></div>
            <div>الدور: <span className="text-white">{profile?.role ? roleLabel[profile.role] : '—'}</span></div>
            <div>آخر تحديث: <span className="text-white">{formatDateTime(profile?.created_at)}</span></div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">أدوات المتجر</h2>
            <p className="mt-1 text-sm text-slate-400">التصدير متاح للمدير فقط في هذه النسخة.</p>
          </div>
          <button disabled={!canExport} className="glass-button-primary disabled:cursor-not-allowed disabled:opacity-50" onClick={() => void exportJson()}>
            <Download size={16} /> تصدير JSON
          </button>
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-4 text-sm leading-7 text-slate-400">
          لاحقًا يمكن إضافة استيراد JSON، طباعة كشف حساب الزبون، ونسخ احتياطي تلقائي.
        </div>
      </GlassCard>
    </div>
  );
};