
import { createClient } from '@supabase/supabase-js';

// Tenta pegar de import.meta.env (Vite) ou process.env (Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : '');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Variáveis de ambiente do Supabase não encontradas. O sistema pode falhar até que sejam configuradas na Vercel.');
}

// Inicializa o cliente com as chaves reais
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
