import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { bootstrapCurrentUserProfile, getProfileByUserId } from '../services/profileService';
import type { ReactNode } from 'react';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserProfile['role'] | null;
  shopId: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      setError(null);
      return;
    }

    try {
      const result = await getProfileByUserId(userId);
      console.log('loadProfile result:', result);
      if (result && result.error) {
        setError(result.error);
        setProfile(null);
        return;
      }
      if (!result.profile) {
        const bootstrap = await bootstrapCurrentUserProfile();
        if (bootstrap.error) {
          setError(bootstrap.error);
          setProfile(null);
          return;
        }

        const refreshed = await getProfileByUserId(userId);
        if (refreshed.error || !refreshed.profile) {
          setError(refreshed.error || 'تعذر إعداد ملف المستخدم.');
          setProfile(null);
          return;
        }

        setError(null);
        setProfile(refreshed.profile);
        return;
      }
      setError(null);
      setProfile(result?.profile ?? null);
    } catch (e: any) {
      console.error('loadProfile failed:', e);
      setError('تعذر تحميل ملف المستخدم.');
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      await loadProfile(data.session?.user?.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      await loadProfile(nextSession?.user?.id);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) return { error: 'تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.' };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setError(null);
  };

  const refreshProfile = async () => {
    await loadProfile(user?.id);
  };

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user,
    profile,
    role: profile?.role ?? null,
    shopId: profile?.shop_id ?? null,
    loading,
    error,
    signIn,
    signOut,
    refreshProfile
  }), [session, user, profile, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider');
  return context;
};