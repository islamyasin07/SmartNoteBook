import { supabase } from '../lib/supabase';
import { Customer, TransactionDetails } from '../types';
import { toNumber } from '../lib/calculations';

export const getCustomers = async (shopId: string) => {
  const [{ data: customers, error: customersError }, { data: transactions, error: transactionsError }] = await Promise.all([
    supabase.from('customers').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }),
    supabase.from('transactions').select('customer_id, subtotal, paid_total, remaining, date').eq('shop_id', shopId)
  ]);

  if (customersError || transactionsError) {
    return { customers: [] as Array<Customer & { totalPurchases: number; totalPaid: number; remaining: number; lastTransactionDate: string | null }>, error: 'تعذر تحميل الزبائن.' };
  }

  const summaryByCustomer = new Map<string, { totalPurchases: number; totalPaid: number; remaining: number; lastTransactionDate: string | null }>();

  (transactions ?? []).forEach((transaction) => {
    const current = summaryByCustomer.get(transaction.customer_id) ?? { totalPurchases: 0, totalPaid: 0, remaining: 0, lastTransactionDate: null };
    current.totalPurchases += toNumber(transaction.subtotal);
    current.totalPaid += toNumber(transaction.paid_total);
    current.remaining += toNumber(transaction.remaining);
    if (!current.lastTransactionDate || new Date(transaction.date) > new Date(current.lastTransactionDate)) {
      current.lastTransactionDate = transaction.date;
    }
    summaryByCustomer.set(transaction.customer_id, current);
  });

  return {
    customers: (customers ?? []).map((customer) => ({
      ...customer,
      totalPurchases: summaryByCustomer.get(customer.id)?.totalPurchases ?? 0,
      totalPaid: summaryByCustomer.get(customer.id)?.totalPaid ?? 0,
      remaining: summaryByCustomer.get(customer.id)?.remaining ?? 0,
      lastTransactionDate: summaryByCustomer.get(customer.id)?.lastTransactionDate ?? null
    })),
    error: null
  };
};

export const createCustomer = async (input: {
  shopId: string;
  userId?: string | null;
  name: string;
  phone?: string;
  city?: string;
  notes?: string;
}) => {
  const { data, error } = await supabase.from('customers').insert({
    shop_id: input.shopId,
    name: input.name,
    phone: input.phone || null,
    city: input.city || null,
    notes: input.notes || null,
    created_by: input.userId || null,
    updated_at: new Date().toISOString()
  }).select('*').single<Customer>();

  if (error) return { customer: null, error: 'تعذر إضافة الزبون.' };
  return { customer: data, error: null };
};

export const updateCustomer = async (id: string, data: { name: string; phone?: string; city?: string; notes?: string }) => {
  const { data: updated, error } = await supabase.from('customers').update({
    name: data.name,
    phone: data.phone || null,
    city: data.city || null,
    notes: data.notes || null,
    updated_at: new Date().toISOString()
  }).eq('id', id).select('*').single<Customer>();

  if (error) return { customer: null, error: 'تعذر تحديث الزبون.' };
  return { customer: updated, error: null };
};

export const deleteCustomer = async (id: string) => {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  return { error: error ? 'تعذر حذف الزبون.' : null };
};

export const getCustomerById = async (id: string) => {
  const { data, error } = await supabase.from('customers').select('*').eq('id', id).maybeSingle<Customer>();
  if (error) return { customer: null, error: 'تعذر تحميل بيانات الزبون.' };
  return { customer: data, error: null };
};
