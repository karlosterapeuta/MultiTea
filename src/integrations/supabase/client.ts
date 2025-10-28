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
  
  // Criando um cliente mock para evitar quebras
  supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null })
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
  } catch (e) {
    console.error('Erro ao inicializar o cliente Supabase:', e);
    // Fallback para evitar quebras
    supabase = {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null })
      }
    };
  }
}

export { supabase };