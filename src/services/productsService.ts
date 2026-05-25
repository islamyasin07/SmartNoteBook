import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const getProducts = async (shopId: string) => {
  const { data, error } = await supabase.from('products').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }).returns<Product[]>();
  if (error) return { products: [] as Product[], error: 'تعذر تحميل البضائع.' };
  return { products: data ?? [], error: null };
};

export const createProduct = async (input: {
  shopId: string;
  userId: string;
  name: string;
  category?: string;
  sku?: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  notes?: string;
}) => {
  const { data, error } = await supabase.from('products').insert({
    shop_id: input.shopId,
    name: input.name,
    category: input.category || null,
    sku: input.sku || null,
    price: input.price,
    stock: input.stock,
    low_stock_threshold: input.low_stock_threshold,
    notes: input.notes || null,
    created_by: input.userId,
    updated_at: new Date().toISOString()
  }).select('*').single<Product>();

  if (error) return { product: null, error: 'تعذر إضافة المنتج.' };
  return { product: data, error: null };
};

export const updateProduct = async (id: string, input: Partial<Omit<Product, 'id' | 'shop_id' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase.from('products').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select('*').single<Product>();
  if (error) return { product: null, error: 'تعذر تحديث المنتج.' };
  return { product: data, error: null };
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from('products').delete().eq('id', id);
  return { error: error ? 'تعذر حذف المنتج.' : null };
};
