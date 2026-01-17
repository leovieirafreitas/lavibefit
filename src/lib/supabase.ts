import { createClient } from '@supabase/supabase-js';

// Logging para debug (será removido em produção após correção)
if (typeof window === 'undefined') {
    console.log('[SERVER] Carregando variáveis Supabase...');
    console.log('[SERVER] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DEFINIDA' : 'UNDEFINED');
    console.log('[SERVER] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'UNDEFINED');
} else {
    console.log('[CLIENT] Carregando variáveis Supabase...');
    console.log('[CLIENT] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DEFINIDA' : 'UNDEFINED');
    console.log('[CLIENT] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'UNDEFINED');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    const errorMsg = `
    ❌ ERRO CRÍTICO: Variáveis do Supabase não encontradas!
    - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ OK' : '❌ UNDEFINED'}
    - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ OK' : '❌ UNDEFINED'}
    
    Verifique:
    1. As variáveis estão configuradas no painel do Render?
    2. O build foi feito após adicionar as variáveis?
    3. As variáveis começam com NEXT_PUBLIC_?
  `;

    console.error(errorMsg);
    throw new Error('Supabase URL e Key são obrigatórios.');
}

// Validar formato da URL
if (!supabaseUrl.startsWith('https://')) {
    throw new Error(`URL do Supabase inválida: ${supabaseUrl}`);
}

// Validar formato da Key (JWT)
if (!supabaseKey.startsWith('eyJ')) {
    throw new Error('ANON_KEY do Supabase inválida (deve ser um JWT)');
}

console.log('✅ Cliente Supabase inicializado com sucesso!');
export const supabase = createClient(supabaseUrl, supabaseKey);
