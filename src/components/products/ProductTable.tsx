import { Pencil, Trash2, TriangleAlert } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/formatters';
import { Badge } from '../ui/Badge';

export const ProductTable = ({
  products,
  onEdit,
  onDelete,
  canDelete
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  canDelete: boolean;
}) => (
  <div className="overflow-x-auto rounded-[1.75rem] border border-white/10">
    <table className="min-w-full text-right">
      <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
        <tr>
          <th className="px-4 py-4">المنتج</th>
          <th className="px-4 py-4">الفئة</th>
          <th className="px-4 py-4">SKU</th>
          <th className="px-4 py-4">السعر</th>
          <th className="px-4 py-4">الكمية</th>
          <th className="px-4 py-4">التنبيه</th>
          <th className="px-4 py-4">الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="border-t border-white/5 bg-slate-950/35 transition hover:bg-white/5">
            <td className="px-4 py-4 text-white">{product.name}</td>
            <td className="px-4 py-4 text-slate-300">{product.category || '—'}</td>
            <td className="px-4 py-4 text-slate-300">{product.sku || '—'}</td>
            <td className="px-4 py-4 text-cyan-200">{formatCurrency(product.price)}</td>
            <td className="px-4 py-4 text-white">{product.stock}</td>
            <td className="px-4 py-4">{product.stock <= product.low_stock_threshold ? <Badge tone="warning"><TriangleAlert size={14} className="ms-1 inline" />منخفض</Badge> : <Badge tone="success">ممتاز</Badge>}</td>
            <td className="px-4 py-4">
              <div className="flex gap-2">
                <button className="glass-button-secondary px-3 py-2 text-sm" onClick={() => onEdit(product)}><Pencil size={14} /></button>
                {canDelete ? <button className="glass-button-danger px-3 py-2 text-sm" onClick={() => onDelete(product)}><Trash2 size={14} /></button> : <Badge tone="neutral">غير مسموح</Badge>}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);