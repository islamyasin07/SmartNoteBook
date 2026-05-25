import { supabase } from '../lib/supabase';
import { Payment, PaymentMethod } from '../types';
import { recalculateTransaction } from './transactionsService';
import { toNumber } from '../lib/calculations';

export const getPaymentsByTransaction = async (transactionId: string) => {
  const { data, error } = await supabase.from('payments').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: true }).returns<Payment[]>();
  if (error) return { payments: [] as Payment[], error: 'تعذر تحميل الدفعات.' };
  return { payments: data ?? [], error: null };
};

export const addPayment = async (input: {
  shopId: string;
  transactionId: string;
  userId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  note?: string;
}) => {
  const { data: transaction } = await supabase.from('transactions').select('remaining').eq('id', input.transactionId).maybeSingle<{ remaining: number }>();
  const remaining = toNumber(transaction?.remaining);

  const { data, error } = await supabase.from('payments').insert({
    shop_id: input.shopId,
    transaction_id: input.transactionId,
    date: input.date,
    amount: input.amount,
    method: input.method,
    note: input.note || null,
    created_by: input.userId
  }).select('*').single<Payment>();

  if (error) return { payment: null as Payment | null, warning: null as string | null, error: 'تعذر إضافة الدفعة.' };

  const recalc = await recalculateTransaction(input.transactionId);
  if (recalc.error) return { payment: data, warning: null, error: recalc.error };

  const warning = input.amount > remaining ? 'تم تسجيل دفعة أكبر من المتبقي، وتم ضبط المتبقي إلى صفر.' : null;
  return { payment: data, warning, error: null };
};
