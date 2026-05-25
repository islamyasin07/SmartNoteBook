import { PaymentMethod, Role, TransactionStatus } from '../types';

const currencyFormatter = new Intl.NumberFormat('ar-EG', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 2
});

const numberFormatter = new Intl.NumberFormat('ar-EG');

export const formatCurrency = (value: number | string | null | undefined) => currencyFormatter.format(Number(value ?? 0));
export const formatNumber = (value: number | string | null | undefined) => numberFormatter.format(Number(value ?? 0));

export const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(new Date(value));
};

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

export const roleLabel: Record<Role, string> = {
  admin: 'مدير',
  staff: 'موظف',
  viewer: 'مراقب'
};

export const statusLabel: Record<TransactionStatus, string> = {
  Paid: 'مدفوع',
  Partial: 'جزئي',
  Unpaid: 'غير مدفوع'
};

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  Cash: 'كاش',
  Bank: 'حوالة بنكية',
  'Jawwal Pay': 'جوال باي',
  Other: 'أخرى'
};

export const yesNo = (value: boolean) => (value ? 'نعم' : 'لا');