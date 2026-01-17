
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    // Evita crash no build se as variáveis não estiverem carregadas ainda (ex: CI/CD sem env)
    if (process.env.NODE_ENV === 'production') {
        console.error('ERRO CRÍTICO: Variáveis do Supabase não encontradas.');
    }
    throw new Error('Supabase URL e Key são obrigatórios.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
