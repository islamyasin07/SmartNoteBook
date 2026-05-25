import { Pencil, Phone, Trash2, UserRoundSearch } from 'lucide-react';
import { Customer } from '../../types';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { shortId } from '../../lib/ids';
import { Badge } from '../ui/Badge';

export const CustomerTable = ({
  customers,
  onSelect,
  onEdit,
  onDelete,
  canDelete
}: {
  customers: Array<Customer & { totalPurchases?: number; totalPaid?: number; remaining?: number; lastTransactionDate?: string | null }>;
  onSelect: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  canDelete: boolean;
}) => {
  return (
    <div className="overflow-x-auto rounded-[1.75rem] border border-white/10">
      <table className="min-w-full text-right">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-4">الاسم</th>
            <th className="px-4 py-4">الهاتف</th>
            <th className="px-4 py-4">المدينة</th>
            <th className="px-4 py-4">إجمالي الشراء</th>
            <th className="px-4 py-4">المدفوع</th>
            <th className="px-4 py-4">المتبقي</th>
            <th className="px-4 py-4">آخر عملية</th>
            <th className="px-4 py-4">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id} className="border-t border-white/5 bg-slate-950/35 transition hover:bg-white/5">
              <td className="px-4 py-4">
                <button className="flex items-center gap-3 text-right text-white hover:text-cyan-200" onClick={() => onSelect(customer)}>
                  <div className="rounded-2xl bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">{shortId(customer.id)}</div>
                  <div>
                    <div className="font-semibold">{customer.name}</div>
                    <div className="text-xs text-slate-500">{customer.notes || 'بدون ملاحظات'}</div>
                  </div>
                  <UserRoundSearch size={16} />
                </button>
              </td>
              <td className="px-4 py-4 text-slate-300">{customer.phone || '—'}</td>
              <td className="px-4 py-4 text-slate-300">{customer.city || '—'}</td>
              <td className="px-4 py-4 text-cyan-200">{formatCurrency(customer.totalPurchases ?? 0)}</td>
              <td className="px-4 py-4 text-emerald-200">{formatCurrency(customer.totalPaid ?? 0)}</td>
              <td className="px-4 py-4 text-amber-200">{formatCurrency(customer.remaining ?? 0)}</td>
              <td className="px-4 py-4 text-slate-300">{formatDate(customer.lastTransactionDate)}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <button className="glass-button-secondary px-3 py-2 text-sm" onClick={() => onEdit(customer)}>
                    <Pencil size={14} />
                  </button>
                  {canDelete ? (
                    <button className="glass-button-danger px-3 py-2 text-sm" onClick={() => onDelete(customer)}>
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <Badge tone="neutral">غير مسموح</Badge>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};