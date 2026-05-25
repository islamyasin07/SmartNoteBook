import { Eye, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import { Customer, TransactionDetails } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { StatusBadge } from '../ui/Badge';

export const TransactionTable = ({
  transactions,
  onView,
  onEdit,
  onDelete,
  onAddPayment,
  canDelete
}: {
  transactions: TransactionDetails[];
  onView: (transaction: TransactionDetails) => void;
  onEdit?: (transaction: TransactionDetails) => void;
  onDelete: (transaction: TransactionDetails) => void;
  onAddPayment: (transaction: TransactionDetails) => void;
  canDelete: boolean;
}) => (
  <div className="overflow-x-auto rounded-[1.75rem] border border-white/10">
    <table className="min-w-full text-right">
      <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
        <tr>
          <th className="px-4 py-4">الرقم</th>
          <th className="px-4 py-4">الزبون</th>
          <th className="px-4 py-4">التاريخ</th>
          <th className="px-4 py-4">الحالة</th>
          <th className="px-4 py-4">المجموع</th>
          <th className="px-4 py-4">المدفوع</th>
          <th className="px-4 py-4">المتبقي</th>
          <th className="px-4 py-4">الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id} className="border-t border-white/5 bg-slate-950/35 hover:bg-white/5">
            <td className="px-4 py-4 text-white">#{transaction.id.slice(0, 8).toUpperCase()}</td>
            <td className="px-4 py-4 text-slate-200">{transaction.customer?.name ?? '—'}</td>
            <td className="px-4 py-4 text-slate-300">{formatDate(transaction.date)}</td>
            <td className="px-4 py-4"><StatusBadge status={transaction.status} /></td>
            <td className="px-4 py-4 text-cyan-200">{formatCurrency(transaction.subtotal)}</td>
            <td className="px-4 py-4 text-emerald-200">{formatCurrency(transaction.paid_total)}</td>
            <td className="px-4 py-4 text-amber-200">{formatCurrency(transaction.remaining)}</td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <button className="glass-button-secondary px-3 py-2 text-sm" onClick={() => onView(transaction)}><Eye size={14} /></button>
                {onEdit ? <button className="glass-button-secondary px-3 py-2 text-sm" onClick={() => onEdit(transaction)}><Pencil size={14} /></button> : null}
                <button className="glass-button-secondary px-3 py-2 text-sm" onClick={() => onAddPayment(transaction)}><PlusCircle size={14} /></button>
                {canDelete ? <button className="glass-button-danger px-3 py-2 text-sm" onClick={() => onDelete(transaction)}><Trash2 size={14} /></button> : null}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);