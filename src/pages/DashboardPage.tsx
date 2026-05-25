import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Boxes, CalendarDays, ChartColumn, CreditCard, Users, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats } from '../services/dashboardService';
import { DashboardStats } from '../types';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { StatCard } from '../components/ui/StatCard';
import { GlassCard } from '../components/ui/GlassCard';
import { formatCurrency, formatDate } from '../lib/formatters';
import { StatusBadge } from '../components/ui/Badge';

export const DashboardPage = () => {
  const { shopId } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    getDashboardStats(shopId).then((result) => {
      setStats(result);
      setLoading(false);
    });
  }, [shopId]);

  if (loading) return <LoadingState label="جاري تحميل لوحة التحكم..." />;
  if (!stats) return <EmptyState icon={ChartColumn} title="لا توجد بيانات بعد" description="ابدأ بإضافة زبائن وبضائع وعملية بيع لعرض أرقام المتجر هنا." />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2">
        <StatCard label="إجمالي المبيعات" value={formatCurrency(stats.totalSales)} icon={ArrowUpRight} tone="cyan" />
        <StatCard label="إجمالي المدفوع" value={formatCurrency(stats.totalPaid)} icon={CreditCard} tone="emerald" />
        <StatCard label="إجمالي المتبقي" value={formatCurrency(stats.totalRemaining)} icon={Wallet} tone="amber" />
        <StatCard label="الزبائن" value={String(stats.customerCount)} icon={Users} tone="violet" />
        <StatCard label="البضائع" value={String(stats.productCount)} icon={Boxes} tone="cyan" />
        <StatCard label="العمليات" value={String(stats.transactionCount)} icon={CalendarDays} tone="emerald" />
        <StatCard label="منخفض المخزون" value={String(stats.lowStockCount)} icon={ArrowDownLeft} tone="amber" />
        <StatCard label="مبيعات اليوم" value={formatCurrency(stats.todaySales)} icon={ChartColumn} tone="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <GlassCard className="p-5">
          <h3 className="text-lg font-bold text-white">آخر العمليات</h3>
          <div className="mt-4 space-y-3">
            {stats.latestTransactions.length ? stats.latestTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{transaction.customer?.name || 'زبون غير معروف'}</div>
                    <div className="mt-1 text-xs text-slate-400">{formatDate(transaction.date)} - #{transaction.id.slice(0, 8).toUpperCase()}</div>
                  </div>
                  <StatusBadge status={transaction.status} />
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                  <div>المجموع: <span className="text-white">{formatCurrency(transaction.subtotal)}</span></div>
                  <div>المدفوع: <span className="text-emerald-200">{formatCurrency(transaction.paid_total)}</span></div>
                  <div>المتبقي: <span className="text-amber-200">{formatCurrency(transaction.remaining)}</span></div>
                </div>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">لا توجد عمليات حديثة.</div>}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-5">
            <h3 className="text-lg font-bold text-white">أكبر الأرصدة</h3>
            <div className="mt-4 space-y-3">
              {stats.topCustomers.length ? stats.topCustomers.map((customer) => (
                <div key={customer.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{customer.name}</div>
                      <div className="text-xs text-slate-400">{customer.phone || 'بدون هاتف'}</div>
                    </div>
                    <div className="text-amber-200">{formatCurrency(customer.totalRemaining)}</div>
                  </div>
                </div>
              )) : <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-400">لا توجد أرصدة بعد.</div>}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-lg font-bold text-white">مبيعات الشهر</h3>
            <div className="mt-4 text-4xl font-black text-cyan-200">{formatCurrency(stats.monthSales)}</div>
            <p className="mt-2 text-sm text-slate-400">إجمالي المبيعات منذ بداية الشهر الحالي.</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};