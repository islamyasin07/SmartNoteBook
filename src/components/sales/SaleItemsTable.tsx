import { Plus, Trash2 } from 'lucide-react';
import { Product, SaleDraftItem } from '../../types';
import { formatCurrency } from '../../lib/formatters';

export const SaleItemsTable = ({
  items,
  products,
  onAddItem,
  onRemoveItem,
  onUpdateItem
}: {
  items: SaleDraftItem[];
  products: Product[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, next: SaleDraftItem) => void;
}) => {
  const options = products.map((product) => (
    <option key={product.id} value={product.id}>{product.name} - {product.stock} متوفر</option>
  ));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[1.75rem] border border-white/10">
        <table className="min-w-full text-right">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-4">المنتج</th>
              <th className="px-4 py-4">الكمية</th>
              <th className="px-4 py-4">سعر الوحدة</th>
              <th className="px-4 py-4">الإجمالي</th>
              <th className="px-4 py-4">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.productId}-${index}`} className="border-t border-white/5 bg-slate-950/35">
                <td className="px-4 py-4">
                  <select
                    className="glass-input"
                    value={item.productId}
                    onChange={(event) => {
                      const product = products.find((current) => current.id === event.target.value);
                      if (!product) return;
                      onUpdateItem(index, {
                        productId: product.id,
                        productName: product.name,
                        sku: product.sku,
                        quantity: item.quantity,
                        unitPrice: product.price,
                        stock: product.stock
                      });
                    }}
                  >
                    <option value="">اختر منتج</option>
                    {options}
                  </select>
                </td>
                <td className="px-4 py-4">
                  <input className="glass-input" type="number" min="1" step="1" value={item.quantity} onChange={(event) => onUpdateItem(index, { ...item, quantity: Number(event.target.value) })} />
                </td>
                <td className="px-4 py-4">
                  <input className="glass-input" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => onUpdateItem(index, { ...item, unitPrice: Number(event.target.value) })} />
                </td>
                <td className="px-4 py-4 text-cyan-200">{formatCurrency(item.quantity * item.unitPrice)}</td>
                <td className="px-4 py-4">
                  <button className="glass-button-danger px-3 py-2 text-sm" onClick={() => onRemoveItem(index)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="glass-button-secondary" onClick={onAddItem}>
        <Plus size={16} /> إضافة بند
      </button>
    </div>
  );
};