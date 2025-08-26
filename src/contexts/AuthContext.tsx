import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true); // فقط للتحقق من الجلسة

  const user = session?.user ?? null;

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("خطأ أثناء جلب البروفايل:", error);
        return null;
      }
      return data;
    } catch (err) {
      console.error("خطأ غير متوقع أثناء جلب البروفايل:", err);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);

      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).then(setProfile);
      }
      setLoading(false); // خلص التحقق من الجلسة
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, sessionState) => {
        setSession(sessionState);
        if (sessionState?.user) {
          fetchProfile(sessionState.user.id).then(setProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const value = { session, user, profile, loading, signOut };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth لازم تستخدمها جوه AuthProvider');
  }
  return context;
};
