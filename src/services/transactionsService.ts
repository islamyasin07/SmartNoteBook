import { supabase } from '../lib/supabase';
import { calculateLineTotal, calculateStatus, sumPayments, toNumber } from '../lib/calculations';
import { Product, SaleDraftItem, Transaction, TransactionDetails, TransactionItem } from '../types';

const mergeTransactionDetails = (
  transactions: Transaction[],
  customers: Array<{ id: string; name: string; phone: string | null; city: string | null; notes: string | null; shop_id: string; created_by: string | null; created_at: string; updated_at: string }>,
  items: TransactionItem[],
  payments: Array<{ id: string; shop_id: string; transaction_id: string; date: string; amount: number; method: any; note: string | null; created_by: string | null; created_at: string }>
) => transactions.map((transaction) => ({
  ...transaction,
  customer: customers.find((customer) => customer.id === transaction.customer_id) ?? null,
  items: items.filter((item) => item.transaction_id === transaction.id),
  payments: payments.filter((payment) => payment.transaction_id === transaction.id)
}));

export const getTransactions = async (shopId: string) => {
  const [{ data: transactions, error: transactionError }, { data: customers, error: customerError }, { data: items, error: itemsError }, { data: payments, error: paymentsError }] = await Promise.all([
    supabase.from('transactions').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }),
    supabase.from('customers').select('*').eq('shop_id', shopId),
    supabase.from('transaction_items').select('*'),
    supabase.from('payments').select('*').eq('shop_id', shopId)
  ]);

  if (transactionError || customerError || itemsError || paymentsError) {
    return { transactions: [] as TransactionDetails[], error: 'تعذر تحميل السجل.' };
  }

  return {
    transactions: mergeTransactionDetails((transactions ?? []) as Transaction[], (customers ?? []) as any, (items ?? []) as TransactionItem[], (payments ?? []) as any),
    error: null
  };
};

export const getTransactionDetails = async (transactionId: string) => {
  const [{ data: transaction, error: transactionError }, { data: customer, error: customerError }, { data: items, error: itemsError }, { data: payments, error: paymentsError }] = await Promise.all([
    supabase.from('transactions').select('*').eq('id', transactionId).maybeSingle<Transaction>(),
    supabase.from('customers').select('*').eq('id', (await supabase.from('transactions').select('customer_id').eq('id', transactionId).maybeSingle()).data?.customer_id ?? '').maybeSingle(),
    supabase.from('transaction_items').select('*').eq('transaction_id', transactionId),
    supabase.from('payments').select('*').eq('transaction_id', transactionId).order('created_at', { ascending: true })
  ]);

  if (transactionError || customerError || itemsError || paymentsError || !transaction) {
    return { transaction: null as TransactionDetails | null, error: 'تعذر تحميل تفاصيل العملية.' };
  }

  return { transaction: { ...transaction, customer: customer ?? null, items: (items ?? []) as TransactionItem[], payments: (payments ?? []) as any } as TransactionDetails, error: null };
};

export const getTransactionsByCustomerId = async (shopId: string, customerId: string) => {
  const { transactions, error } = await getTransactions(shopId);
  if (error) return { transactions: [] as TransactionDetails[], error };
  return { transactions: transactions.filter((transaction) => transaction.customer_id === customerId), error: null };
};

export const createTransaction = async (input: {
  shopId: string;
  userId?: string | null;
  customerId: string;
  date: string;
  note?: string;
  items: SaleDraftItem[];
  paidAmount: number;
  paymentMethod?: 'Cash' | 'Bank' | 'Jawwal Pay' | 'Other';
  paymentNote?: string;
  overrideStock?: boolean;
}) => {
  if (!input.items.length) {
    return { transaction: null as TransactionDetails | null, error: 'يجب إضافة منتج واحد على الأقل.' };
  }

  const productIds = input.items.map((item) => item.productId);
  const { data: products, error: productsError } = await supabase.from('products').select('*').in('id', productIds).eq('shop_id', input.shopId).returns<Product[]>();

  if (productsError || !products) {
    return { transaction: null as TransactionDetails | null, error: 'تعذر التحقق من المنتجات.' };
  }

  const productById = new Map(products.map((product) => [product.id, product]));

  for (const item of input.items) {
    if (item.quantity <= 0) {
      return { transaction: null as TransactionDetails | null, error: 'الكمية يجب أن تكون أكبر من صفر.' };
    }
    const product = productById.get(item.productId);
    if (!product) {
      return { transaction: null as TransactionDetails | null, error: 'أحد المنتجات غير موجود.' };
    }
    if (item.quantity > product.stock && !input.overrideStock) {
      return { transaction: null as TransactionDetails | null, error: `الكمية المطلوبة من ${product.name} أكبر من الكمية المتاحة.` };
    }
  }

  const normalizedItems = input.items.map((item) => ({
    ...item,
    lineTotal: calculateLineTotal(item.quantity, item.unitPrice)
  }));
  const subtotal = Number(normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const paidTotal = Number(Math.max(input.paidAmount, 0).toFixed(2));
  const remaining = Number(Math.max(subtotal - paidTotal, 0).toFixed(2));
  const status = calculateStatus(subtotal, paidTotal);

  const { data: transaction, error: transactionError } = await supabase.from('transactions').insert({
    shop_id: input.shopId,
    customer_id: input.customerId,
    date: input.date,
    subtotal,
    paid_total: paidTotal,
    remaining,
    status,
    note: input.note || null,
    created_by: input.userId || null,
    updated_at: new Date().toISOString()
  }).select('*').single<Transaction>();

  if (transactionError || !transaction) {
    return { transaction: null as TransactionDetails | null, error: 'تعذر حفظ العملية.' };
  }

  const { error: itemsError } = await supabase.from('transaction_items').insert(normalizedItems.map((item) => ({
    transaction_id: transaction.id,
    product_id: item.productId,
    product_name: item.productName,
    sku: item.sku,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: item.lineTotal
  })));

  if (itemsError) {
    return { transaction: null as TransactionDetails | null, error: 'تعذر حفظ بنود العملية.' };
  }

  for (const item of normalizedItems) {
    const product = productById.get(item.productId);
    if (!product) continue;
    const nextStock = product.stock - item.quantity;
    const { error: updateError } = await supabase.from('products').update({ stock: nextStock, updated_at: new Date().toISOString() }).eq('id', item.productId);
    if (updateError) {
      return { transaction: null as TransactionDetails | null, error: 'تعذر تحديث مخزون أحد المنتجات.' };
    }
  }

  if (paidTotal > 0) {
    const { error: paymentError } = await supabase.from('payments').insert({
      shop_id: input.shopId,
      transaction_id: transaction.id,
      date: input.date,
      amount: paidTotal,
      method: input.paymentMethod || 'Cash',
      note: input.paymentNote || null,
      created_by: input.userId || null
    });

    if (paymentError) {
      return { transaction: null as TransactionDetails | null, error: 'تعذر تسجيل الدفعة الأولية.' };
    }
  }

  const refreshed = await recalculateTransaction(transaction.id);
  if (refreshed.error) return refreshed;
  return { transaction: refreshed.transaction, error: null };
};

export const deleteTransaction = async (transactionId: string) => {
  const { data: items } = await supabase.from('transaction_items').select('*').eq('transaction_id', transactionId);
  for (const item of items ?? []) {
    if (!item.product_id) continue;
    const { data: product } = await supabase.from('products').select('*').eq('id', item.product_id).maybeSingle<Product>();
    if (!product) continue;
    await supabase.from('products').update({ stock: product.stock + item.quantity, updated_at: new Date().toISOString() }).eq('id', item.product_id);
  }

  const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
  return { error: error ? 'تعذر حذف العملية.' : null };
};

export const recalculateTransaction = async (transactionId: string) => {
  const [{ data: transaction, error: transactionError }, { data: items, error: itemsError }, { data: payments, error: paymentsError }] = await Promise.all([
    supabase.from('transactions').select('*').eq('id', transactionId).maybeSingle<Transaction>(),
    supabase.from('transaction_items').select('*').eq('transaction_id', transactionId),
    supabase.from('payments').select('*').eq('transaction_id', transactionId)
  ]);

  if (transactionError || itemsError || paymentsError || !transaction) {
    return { transaction: null as TransactionDetails | null, error: 'تعذر إعادة احتساب العملية.' };
  }

  const subtotal = Number((items ?? []).reduce((sum, item) => sum + toNumber(item.line_total), 0).toFixed(2));
  const paidTotal = Number(sumPayments((payments ?? []) as any).toFixed(2));
  const remaining = Number(Math.max(subtotal - paidTotal, 0).toFixed(2));
  const status = calculateStatus(subtotal, paidTotal);

  const { error: updateError } = await supabase.from('transactions').update({ subtotal, paid_total: paidTotal, remaining, status, updated_at: new Date().toISOString() }).eq('id', transactionId);
  if (updateError) return { transaction: null as TransactionDetails | null, error: 'تعذر تحديث القيم النهائية للعملية.' };

  return { transaction: { ...transaction, subtotal, paid_total: paidTotal, remaining, status, items: (items ?? []) as TransactionItem[], payments: (payments ?? []) as any } as TransactionDetails, error: null };
};
