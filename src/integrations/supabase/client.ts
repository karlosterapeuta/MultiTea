import { createClient } from '@supabase/supabase-js';

// Usando variáveis de ambiente para maior segurança
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase config:', { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY });

let supabase;

// Verificação de variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('As variáveis de ambiente do Supabase não estão configuradas corretamente');
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL);
  console.error('VITE_SUPABASE_ANON_KEY:', SUPABASE_PUBLISHABLE_KEY);
  
  // Criando um cliente mock completo para evitar quebras
  supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase não configurado' } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase não configurado' } }),
      signInWithOAuth: () => Promise.resolve({ data: { provider: null, url: null }, error: { message: 'Supabase não configurado' } })
    }
  };
} else {
  try {
    supabase = createClient(
      SUPABASE_URL, 
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      }
    );
    console.log('Cliente Supabase inicializado com sucesso');
  } catch (e) {
    console.error('Erro ao inicializar o cliente Supabase:', e);
    // Fallback para evitar quebras
    supabase = {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Erro na inicialização do Supabase' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Erro na inicialização do Supabase' } }),
        signInWithOAuth: () => Promise.resolve({ data: { provider: null, url: null }, error: { message: 'Erro na inicialização do Supabase' } })
      }
    };
  }
}

export { supabase };