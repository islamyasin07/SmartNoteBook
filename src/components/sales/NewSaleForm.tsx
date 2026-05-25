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
    customerName?: string;
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
  const [customerName, setCustomerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [items, setItems] = useState<SaleDraftItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

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
      return;
    }

    if (!items.length && !products.length) {
      setItems([
        {
          productId: '',
          productName: '',
          sku: '',
          quantity: 1,
          unitPrice: 0,
          stock: 0
        }
      ]);
    }
  }, [products, items.length]);

  const totals = useMemo(() => calculateTransactionTotals(items, Number(paidAmount)), [items, paidAmount]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const normalizedCustomerName = customerName.trim();
    const normalizedPaidAmount = Number(paidAmount);

    if (!customerId && !normalizedCustomerName) {
      setFormError('اختر زبون موجود أو اكتب اسم الزبون أولاً');
      return;
    }

    if (!date) {
      setFormError('التاريخ مطلوب');
      return;
    }

    if (!items.length) {
      setFormError('أضف بندًا واحدًا على الأقل');
      return;
    }

    for (const [index, item] of items.entries()) {
      if (!item.productId && !item.productName.trim()) {
        setFormError(`البند ${index + 1}: اكتب اسم المنتج أولاً`);
        return;
      }
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        setFormError(`البند ${index + 1}: الكمية يجب أن تكون أكبر من صفر`);
        return;
      }
      if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
        setFormError(`البند ${index + 1}: سعر الوحدة يجب أن يكون صفر أو أكثر`);
        return;
      }
    }

    if (!Number.isFinite(normalizedPaidAmount) || normalizedPaidAmount < 0) {
      setFormError('الدفعة الأولية يجب أن تكون صفر أو أكثر');
      return;
    }

    setFormError(null);
    await onSubmit({
      customerId,
      customerName: normalizedCustomerName || undefined,
      date,
      note,
      items,
      paidAmount: normalizedPaidAmount,
      paymentMethod,
      paymentNote
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {formError ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {formError}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <GlassCard className="p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="الزبون *">
              <input
                list="customers-list"
                className="glass-input"
                value={customerId ? customers.find(c => c.id === customerId)?.name ?? '' : customerName}
                onChange={(event) => {
                  const value = event.target.value;
                  // find by name
                  const found = customers.find((c) => c.name === value || c.phone === value);
                  if (found) {
                    setCustomerId(found.id);
                    setCustomerName(found.name);
                  } else {
                    setCustomerId('');
                    setCustomerName(value);
                  }
                }}
                placeholder="اكتب اسم الزبون أو اختر من القائمة"
              />
              <datalist id="customers-list">
                {customers.map((customer) => <option key={customer.id} value={customer.name} />)}
              </datalist>
              <input type="hidden" value={customerId} />
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
          if (!firstProduct) {
            setItems((current) => [...current, {
              productId: '',
              productName: '',
              sku: '',
              quantity: 1,
              unitPrice: 0,
              stock: 0
            }]);
            return;
          }
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