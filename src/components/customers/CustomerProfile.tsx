import { CalendarDays, MessageSquare, Phone, Store, Wallet } from 'lucide-react';
import { Customer, TransactionDetails } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { GlassCard } from '../ui/GlassCard';
import { Badge, StatusBadge } from '../ui/Badge';

export const CustomerProfile = ({
  customer,
  transactions,
  onEdit,
  onViewTransaction,
  onAddPayment
}: {
  customer: Customer | null;
  transactions: TransactionDetails[];
  onEdit: () => void;
  onViewTransaction: (transaction: TransactionDetails) => void;
  onAddPayment: (transaction: TransactionDetails) => void;
}) => {
  if (!customer) return null;

  const totalBought = transactions.reduce((sum, item) => sum + item.subtotal, 0);
  const totalPaid = transactions.reduce((sum, item) => sum + item.paid_total, 0);
  const remaining = transactions.reduce((sum, item) => sum + item.remaining, 0);
  const lastTransactionDate = transactions[0]?.date ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <GlassCard className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-slate-400">الزبون</div>
              <h3 className="mt-2 text-2xl font-extrabold text-white">{customer.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="info"><Phone size={14} className="ms-1 inline" />{customer.phone || 'بدون هاتف'}</Badge>
                <Badge tone="neutral"><Store size={14} className="ms-1 inline" />{customer.city || 'بدون مدينة'}</Badge>
              </div>
            </div>
            <button className="glass-button-secondary" onClick={onEdit}>
              تعديل الزبون
            </button>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">{customer.notes || 'لا توجد ملاحظات محفوظة لهذا الزبون.'}</p>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-4">
            <div className="text-xs text-slate-400">إجمالي الشراء</div>
            <div className="mt-2 text-2xl font-bold text-white">{formatCurrency(totalBought)}</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-xs text-slate-400">المدفوع</div>
            <div className="mt-2 text-2xl font-bold text-emerald-200">{formatCurrency(totalPaid)}</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-xs text-slate-400">المتبقي</div>
            <div className="mt-2 text-2xl font-bold text-amber-200">{formatCurrency(remaining)}</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-xs text-slate-400">آخر حركة</div>
            <div className="mt-2 text-2xl font-bold text-white">{formatDate(lastTransactionDate)}</div>
          </GlassCard>
        </div>
      </div>

      <GlassCard className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h4 className="text-lg font-bold text-white">حركات الزبون</h4>
          <div className="text-sm text-slate-400">{transactions.length} عملية</div>
        </div>
        <div className="space-y-3">
          {transactions.length ? transactions.map((transaction) => (
            <div key={transaction.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">#{transaction.id.slice(0, 8).toUpperCase()}</div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays size={14} /> {formatDate(transaction.date)}
                    <MessageSquare size={14} className="ms-3" /> {transaction.note || 'بدون ملاحظات'}
                  </div>
                </div>
                <StatusBadge status={transaction.status} />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/60 p-3 text-sm text-slate-300">المجموع: <span className="text-white">{formatCurrency(transaction.subtotal)}</span></div>
                <div className="rounded-2xl bg-slate-950/60 p-3 text-sm text-slate-300">المدفوع: <span className="text-emerald-200">{formatCurrency(transaction.paid_total)}</span></div>
                <div className="rounded-2xl bg-slate-950/60 p-3 text-sm text-slate-300">المتبقي: <span className="text-amber-200">{formatCurrency(transaction.remaining)}</span></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="glass-button-secondary px-3 py-2 text-sm" onClick={() => onViewTransaction(transaction)}>تفاصيل العملية</button>
                {transaction.remaining > 0 ? <button className="glass-button-primary px-3 py-2 text-sm" onClick={() => onAddPayment(transaction)}>إضافة دفعة</button> : null}
              </div>
            </div>
          )) : <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-400">لا توجد عمليات لهذا الزبون بعد.</div>}
        </div>
      </GlassCard>
    </div>
  );
};