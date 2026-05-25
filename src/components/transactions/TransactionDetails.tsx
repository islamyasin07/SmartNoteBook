import { TransactionDetails as TransactionDetailsType } from '../../types';
import { formatCurrency, formatDate, formatDateTime, paymentMethodLabel } from '../../lib/formatters';
import { shortId } from '../../lib/ids';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/Badge';
import { PaymentForm } from './PaymentForm';

export const TransactionDetails = ({
  transaction,
  onAddPayment,
  onClose
}: {
  transaction: TransactionDetailsType | null;
  onAddPayment: (transactionId: string, payload: { amount: number; date: string; method: any; note: string }) => Promise<void> | void;
  onClose: () => void;
}) => {
  if (!transaction) return null;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-400">معرّف العملية</div>
              <div className="mt-2 text-2xl font-bold text-white">#{shortId(transaction.id)}</div>
            </div>
            <StatusBadge status={transaction.status} />
          </div>
          <div className="mt-5 space-y-2 text-sm text-slate-300">
            <div>الزبون: <span className="text-white">{transaction.customer?.name || '—'}</span></div>
            <div>التاريخ: <span className="text-white">{formatDate(transaction.date)}</span></div>
            <div>ملاحظات: <span className="text-white">{transaction.note || '—'}</span></div>
            <div>المنشئ: <span className="text-white">{transaction.created_by || '—'}</span></div>
            <div>آخر تحديث: <span className="text-white">{formatDateTime(transaction.updated_at)}</span></div>
          </div>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2">
          <GlassCard className="p-4"><div className="text-xs text-slate-400">المجموع</div><div className="mt-2 text-2xl font-bold text-white">{formatCurrency(transaction.subtotal)}</div></GlassCard>
          <GlassCard className="p-4"><div className="text-xs text-slate-400">المدفوع</div><div className="mt-2 text-2xl font-bold text-emerald-200">{formatCurrency(transaction.paid_total)}</div></GlassCard>
          <GlassCard className="p-4"><div className="text-xs text-slate-400">المتبقي</div><div className="mt-2 text-2xl font-bold text-amber-200">{formatCurrency(transaction.remaining)}</div></GlassCard>
          <GlassCard className="p-4"><div className="text-xs text-slate-400">عدد البنود</div><div className="mt-2 text-2xl font-bold text-white">{transaction.items.length}</div></GlassCard>
        </div>
      </div>

      <GlassCard className="p-5">
        <h4 className="text-lg font-bold text-white">البنود</h4>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-right">
            <thead className="text-xs text-slate-400">
              <tr>
                <th className="px-3 py-3">المنتج</th>
                <th className="px-3 py-3">الكمية</th>
                <th className="px-3 py-3">سعر الوحدة</th>
                <th className="px-3 py-3">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map((item) => (
                <tr key={item.id} className="border-t border-white/5">
                  <td className="px-3 py-3 text-white">{item.product_name}</td>
                  <td className="px-3 py-3 text-slate-300">{item.quantity}</td>
                  <td className="px-3 py-3 text-slate-300">{formatCurrency(item.unit_price)}</td>
                  <td className="px-3 py-3 text-cyan-200">{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h4 className="text-lg font-bold text-white">الدفعات</h4>
        <div className="mt-4 space-y-3">
          {transaction.payments.length ? transaction.payments.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{formatCurrency(payment.amount)}</div>
                  <div className="mt-1 text-xs text-slate-400">{formatDate(payment.date)} - {paymentMethodLabel[payment.method]}</div>
                </div>
                <div className="text-xs text-slate-400">{payment.note || '—'}</div>
              </div>
            </div>
          )) : <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-slate-400">لا توجد دفعات حتى الآن.</div>}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h4 className="text-lg font-bold text-white">إضافة دفعة</h4>
        <div className="mt-4">
          <PaymentForm initialAmount={String(Math.max(transaction.remaining, 0))} onCancel={onClose} onSubmit={(payload) => onAddPayment(transaction.id, payload)} />
        </div>
      </GlassCard>
    </div>
  );
};