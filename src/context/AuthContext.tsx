import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface Profile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  specialty: string | null;
  crp: string | null;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
}

interface AuthContextType {
  session: any | null;
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const ensureProfileExists = useCallback(async (currentUser: any) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .single();

      if ((error && status === 406) || (!data && !error)) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: currentUser.id });
        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (e) {
      console.error('Unexpected error ensuring profile exists:', e);
    }
  }, []);

  const fetchProfile = useCallback(async (currentUser: any) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, specialty, crp, phone, address, avatar_url')
        .eq('id', currentUser.id)
        .single();

      if (error && status === 406) {
        await ensureProfileExists(currentUser);
        const { data: created } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, specialty, crp, phone, address, avatar_url')
          .eq('id', currentUser.id)
          .single();
        if (created) {
          setProfile({
            id: created.id,
            firstName: created.first_name,
            lastName: created.last_name,
            specialty: created.specialty,
            crp: created.crp,
            phone: created.phone,
            address: created.address,
            avatarUrl: created.avatar_url,
          });
        } else {
          setProfile(null);
        }
        return;
      }

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } else if (data) {
        setProfile({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          specialty: data.specialty,
          crp: data.crp,
          phone: data.phone,
          address: data.address,
          avatarUrl: data.avatar_url,
        });
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    }
  }, [ensureProfileExists]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn('[Auth] Safety timeout reached. Forcing loading=false');
        setLoading(false);
      }
    }, 3000);

    const initializeAuth = async () => {
      if (!mounted) return;
      
      try {
        // Verificar sessão atual
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (currentSession && mounted) {
          setSession(currentSession);
          setUser(currentSession.user);
          await ensureProfileExists(currentSession.user);
          await fetchProfile(currentSession.user);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Configurar listener de mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', _event);
      
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await ensureProfileExists(currentUser);
        await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }
      
      // Redirecionar após mudança de estado de autenticação
      if (!session && window.location.pathname !== '/login') {
        navigate('/login');
      } else if (session && window.location.pathname === '/login') {
        navigate('/dashboard');
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, [fetchProfile, navigate]);

  const value = {
    session,
    user,
    profile,
    loading,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};