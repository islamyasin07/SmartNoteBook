import { useEffect, useState } from 'react';
import { PAYMENT_METHODS, PaymentMethod } from '../../types';
import { FormField } from '../ui/FormField';
import type { FormEvent } from 'react';

export const PaymentForm = ({
  initialAmount = '',
  loading,
  onSubmit,
  onCancel
}: {
  initialAmount?: string;
  loading?: boolean;
  onSubmit: (data: { amount: number; date: string; method: PaymentMethod; note: string }) => Promise<void> | void;
  onCancel: () => void;
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');

  useEffect(() => {
    setAmount(initialAmount);
  }, [initialAmount]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({ amount: Number(amount), date, method, note });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        <FormField label="المبلغ *">
          <input className="glass-input" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        </FormField>
        <FormField label="التاريخ *">
          <input className="glass-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </FormField>
        <FormField label="طريقة الدفع *">
          <select className="glass-input" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
            {PAYMENT_METHODS.map((paymentMethod) => <option key={paymentMethod} value={paymentMethod}>{paymentMethod}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="ملاحظات">
        <textarea className="glass-input min-h-24" value={note} onChange={(event) => setNote(event.target.value)} />
      </FormField>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="glass-button-secondary" onClick={onCancel}>إلغاء</button>
        <button type="submit" disabled={loading} className="glass-button-primary disabled:opacity-60">{loading ? 'جاري الحفظ...' : 'حفظ الدفعة'}</button>
      </div>
    </form>
  );
};