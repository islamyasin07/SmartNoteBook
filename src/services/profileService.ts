import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export const getProfileByUserId = async (userId: string) => {
  const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle<UserProfile>();
  if (error) return { profile: null, error: 'تعذر تحميل ملف المستخدم.' };
  return { profile: data, error: null };
};

export const getShopById = async (shopId: string) => {
  const { data, error } = await supabase.from('shops').select('*').eq('id', shopId).maybeSingle();
  if (error) return { shop: null, error: 'تعذر تحميل بيانات المتجر.' };
  return { shop: data, error: null };
};