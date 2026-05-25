import { useEffect, useState } from 'react';
import { Customer } from '../../types';
import { FormField } from '../ui/FormField';
import type { FormEvent } from 'react';

export const CustomerForm = ({
  initial,
  loading,
  onSubmit,
  onCancel
}: {
  initial?: Partial<Customer> | null;
  loading?: boolean;
  onSubmit: (data: { name: string; phone: string; city: string; notes: string }) => Promise<void> | void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setName(initial?.name ?? '');
    setPhone(initial?.phone ?? '');
    setCity(initial?.city ?? '');
    setNotes(initial?.notes ?? '');
  }, [initial]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({ name, phone, city, notes });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="الاسم *">
          <input className="glass-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="اسم الزبون" required />
        </FormField>
        <FormField label="رقم الهاتف">
          <input className="glass-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="05xxxxxxxx" />
        </FormField>
      </div>
      <FormField label="المدينة">
        <input className="glass-input" value={city} onChange={(event) => setCity(event.target.value)} placeholder="المدينة" />
      </FormField>
      <FormField label="ملاحظات">
        <textarea className="glass-input min-h-28" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="ملاحظات إضافية" />
      </FormField>
      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" className="glass-button-secondary" onClick={onCancel}>
          إلغاء
        </button>
        <button type="submit" disabled={loading} className="glass-button-primary disabled:opacity-60">
          {loading ? 'جاري الحفظ...' : 'حفظ'}
        </button>
      </div>
    </form>
  );
};