import { Payment, SaleDraftItem, TransactionStatus } from '../types';

export const toNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const calculateLineTotal = (quantity: number, unitPrice: number) => Number((quantity * unitPrice).toFixed(2));

export const calculateStatus = (subtotal: number, paidTotal: number): TransactionStatus => {
  if (paidTotal <= 0) return 'Unpaid';
  if (paidTotal >= subtotal) return 'Paid';
  return 'Partial';
};

export const calculateTransactionTotals = (items: SaleDraftItem[], paidAmount: number) => {
  const subtotal = Number(items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0).toFixed(2));
  const paidTotal = Number(Math.max(paidAmount, 0).toFixed(2));
  const remaining = Number(Math.max(subtotal - paidTotal, 0).toFixed(2));
  const status = calculateStatus(subtotal, paidTotal);

  return { subtotal, paidTotal, remaining, status };
};

export const sumPayments = (payments: Payment[]) => Number(payments.reduce((sum, payment) => sum + toNumber(payment.amount), 0).toFixed(2));