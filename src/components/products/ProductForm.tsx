import { useEffect, useState } from 'react';
import { Product, PRODUCT_CATEGORIES } from '../../types';
import { FormField } from '../ui/FormField';
import type { FormEvent } from 'react';

export const ProductForm = ({
  initial,
  loading,
  onSubmit,
  onCancel
}: {
  initial?: Partial<Product> | null;
  loading?: boolean;
  onSubmit: (data: { name: string; category: string; sku: string; price: number; stock: number; low_stock_threshold: number; notes: string }) => Promise<void> | void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Other');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setName(initial?.name ?? '');
    setCategory(initial?.category ?? 'Other');
    setSku(initial?.sku ?? '');
    setPrice(String(initial?.price ?? 0));
    setStock(String(initial?.stock ?? 0));
    setLowStockThreshold(String(initial?.low_stock_threshold ?? 5));
    setNotes(initial?.notes ?? '');
  }, [initial]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      name,
      category,
      sku,
      price: Number(price),
      stock: Number(stock),
      low_stock_threshold: Number(lowStockThreshold),
      notes
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="اسم المنتج *">
          <input className="glass-input" value={name} onChange={(event) => setName(event.target.value)} required />
        </FormField>
        <FormField label="الفئة">
          <select className="glass-input" value={category} onChange={(event) => setCategory(event.target.value)}>
            {PRODUCT_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <FormField label="SKU">
          <input className="glass-input" value={sku} onChange={(event) => setSku(event.target.value)} />
        </FormField>
        <FormField label="السعر *">
          <input className="glass-input" type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
        </FormField>
        <FormField label="الكمية *">
          <input className="glass-input" type="number" min="0" step="1" value={stock} onChange={(event) => setStock(event.target.value)} required />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="حد التنبيه">
          <input className="glass-input" type="number" min="0" step="1" value={lowStockThreshold} onChange={(event) => setLowStockThreshold(event.target.value)} />
        </FormField>
        <FormField label="ملاحظات">
          <textarea className="glass-input min-h-28" value={notes} onChange={(event) => setNotes(event.target.value)} />
        </FormField>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="glass-button-secondary" onClick={onCancel}>إلغاء</button>
        <button type="submit" disabled={loading} className="glass-button-primary disabled:opacity-60">{loading ? 'جاري الحفظ...' : 'حفظ'}</button>
      </div>
    </form>
  );
};