import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

export const getProfileByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).maybeSingle<UserProfile>();
    if (error) {
      console.error('getProfileByUserId supabase error:', error);
      return { profile: null, error: `تعذر تحميل ملف المستخدم: ${error.message ?? 'خطأ غير معروف'}` };
    }
    return { profile: data, error: null };
  } catch (e: any) {
    console.error('getProfileByUserId unexpected error:', e);
    return { profile: null, error: 'تعذر تحميل ملف المستخدم: خطأ داخلي.' };
  }
};

export const bootstrapCurrentUserProfile = async () => {
  try {
    const { data, error } = await supabase.rpc('ensure_current_user_profile', {
      p_full_name: null,
      p_shop_name: 'Al-Masdar Security Systems',
      p_role: 'admin'
    });
    if (error) {
      console.error('bootstrapCurrentUserProfile supabase error:', error);
      return { profile: null, error: `تعذر إعداد ملف المستخدم: ${error.message ?? 'خطأ غير معروف'}` };
    }
    return { profile: data as UserProfile | null, error: null };
  } catch (e: any) {
    console.error('bootstrapCurrentUserProfile unexpected error:', e);
    return { profile: null, error: 'تعذر إعداد ملف المستخدم: خطأ داخلي.' };
  }
};

export const getShopById = async (shopId: string) => {
  const { data, error } = await supabase.from('shops').select('*').eq('id', shopId).maybeSingle();
  if (error) return { shop: null, error: 'تعذر تحميل بيانات المتجر.' };
  return { shop: data, error: null };
};