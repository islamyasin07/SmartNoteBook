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
  const productNames = products.map((p) => <option key={p.id} value={p.name} />);

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
                  <input
                    list={`products-list-${index}`}
                    className="glass-input"
                    value={item.productName}
                    onChange={(event) => {
                      const value = event.target.value;
                      const found = products.find((p) => p.id === value || p.name === value || `${p.name} - ${p.stock} متوفر` === value);
                      if (found) {
                        onUpdateItem(index, {
                          productId: found.id,
                          productName: found.name,
                          sku: found.sku,
                          quantity: item.quantity,
                          unitPrice: found.price,
                          stock: found.stock
                        });
                      } else {
                        onUpdateItem(index, { ...item, productId: '', productName: value });
                      }
                    }}
                  />
                  <datalist id={`products-list-${index}`}>
                    {productNames}
                  </datalist>
                </td>
                <td className="px-4 py-4">
                  <input className="glass-input" type="number" min="1" step="1" value={item.quantity} onChange={(event) => onUpdateItem(index, { ...item, quantity: Number(event.target.value) })} />
                </td>
                <td className="px-4 py-4">
                  <input className="glass-input" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => onUpdateItem(index, { ...item, unitPrice: Number(event.target.value) })} />
                </td>
                <td className="px-4 py-4 text-cyan-200">{formatCurrency(item.quantity * item.unitPrice)}</td>
                <td className="px-4 py-4">
                  <button type="button" className="glass-button-danger px-3 py-2 text-sm" onClick={() => onRemoveItem(index)}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="glass-button-secondary" onClick={onAddItem}>
        <Plus size={16} /> إضافة بند
      </button>
    </div>
  );
};