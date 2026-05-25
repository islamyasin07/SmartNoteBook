import { useEffect, useMemo, useState } from 'react';
import { Customer, Product, SaleDraftItem, PaymentMethod } from '../../types';
import { calculateTransactionTotals } from '../../lib/calculations';
import { formatCurrency } from '../../lib/formatters';
import { GlassCard } from '../ui/GlassCard';
import { FormField } from '../ui/FormField';
import { SaleItemsTable } from './SaleItemsTable';
import type { FormEvent } from 'react';

export const NewSaleForm = ({
  customers,
  products,
  loading,
  onSubmit,
  onQuickAddCustomer
}: {
  customers: Customer[];
  products: Product[];
  loading?: boolean;
  onSubmit: (payload: {
    customerId: string;
    date: string;
    note: string;
    items: SaleDraftItem[];
    paidAmount: number;
    paymentMethod: PaymentMethod;
    paymentNote: string;
  }) => Promise<void> | void;
  onQuickAddCustomer: () => void;
}) => {
  const [customerId, setCustomerId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [items, setItems] = useState<SaleDraftItem[]>([]);

  useEffect(() => {
    if (!items.length && products.length) {
      const firstProduct = products[0];
      setItems([
        {
          productId: firstProduct.id,
          productName: firstProduct.name,
          sku: firstProduct.sku,
          quantity: 1,
          unitPrice: firstProduct.price,
          stock: firstProduct.stock
        }
      ]);
    }
  }, [products, items.length]);

  const totals = useMemo(() => calculateTransactionTotals(items, Number(paidAmount)), [items, paidAmount]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      customerId,
      date,
      note,
      items,
      paidAmount: Number(paidAmount),
      paymentMethod,
      paymentNote
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <GlassCard className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="الزبون *">
              <select className="glass-input" value={customerId} onChange={(event) => setCustomerId(event.target.value)} required>
                <option value="">اختر زبونًا</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
              </select>
            </FormField>
            <FormField label="التاريخ *">
              <input className="glass-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </FormField>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="glass-button-secondary" onClick={onQuickAddCustomer}>إضافة زبون سريع</button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FormField label="الدفعة الأولية">
              <input className="glass-input" type="number" min="0" step="0.01" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} />
            </FormField>
            <FormField label="طريقة الدفع">
              <select className="glass-input" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                <option value="Cash">كاش</option>
                <option value="Bank">حوالة بنكية</option>
                <option value="Jawwal Pay">جوال باي</option>
                <option value="Other">أخرى</option>
              </select>
            </FormField>
          </div>
          <FormField label="ملاحظات الدفعة">
            <textarea className="glass-input min-h-24" value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} />
          </FormField>
          <FormField label="ملاحظات العملية">
            <textarea className="glass-input min-h-28" value={note} onChange={(event) => setNote(event.target.value)} />
          </FormField>
        </GlassCard>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <GlassCard className="p-4"><div className="text-xs text-slate-400">المجموع الفرعي</div><div className="mt-2 text-2xl font-bold text-white">{formatCurrency(totals.subtotal)}</div></GlassCard>
          <GlassCard className="p-4"><div className="text-xs text-slate-400">المدفوع</div><div className="mt-2 text-2xl font-bold text-emerald-200">{formatCurrency(totals.paidTotal)}</div></GlassCard>
          <GlassCard className="p-4"><div className="text-xs text-slate-400">المتبقي</div><div className="mt-2 text-2xl font-bold text-amber-200">{formatCurrency(totals.remaining)}</div></GlassCard>
          <GlassCard className="p-4"><div className="text-xs text-slate-400">الحالة</div><div className="mt-2 text-2xl font-bold text-cyan-200">{totals.status === 'Paid' ? 'مدفوع' : totals.status === 'Partial' ? 'جزئي' : 'غير مدفوع'}</div></GlassCard>
        </div>
      </div>

      <SaleItemsTable
        items={items}
        products={products}
        onAddItem={() => {
          const firstProduct = products[0];
          if (!firstProduct) return;
          setItems((current) => [...current, {
            productId: firstProduct.id,
            productName: firstProduct.name,
            sku: firstProduct.sku,
            quantity: 1,
            unitPrice: firstProduct.price,
            stock: firstProduct.stock
          }]);
        }}
        onRemoveItem={(index) => setItems((current) => current.filter((_, currentIndex) => currentIndex !== index))}
        onUpdateItem={(index, next) => setItems((current) => current.map((item, currentIndex) => (currentIndex === index ? next : item)))}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
        <div className="text-sm text-slate-400">سيتم حفظ البنود، الدفعة الأولية، وتحديث المخزون تلقائيًا.</div>
        <button type="submit" disabled={loading} className="glass-button-primary disabled:opacity-60">
          {loading ? 'جاري الحفظ...' : 'حفظ العملية'}
        </button>
      </div>
    </form>
  );
};