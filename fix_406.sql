-- ==============================================================================
-- CORREÇÃO DO ERRO 406 (DADOS FALTANTES)
-- ==============================================================================

-- 1. Garantir que a tabela existe e tem RLS
CREATE TABLE IF NOT EXISTS public.global_settings (
    key text PRIMARY KEY,
    value text
);
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- 2. Recriar (ou garantir) as permissões de leitura
DROP POLICY IF EXISTS "Public Read Global Settings" ON public.global_settings;
CREATE POLICY "Public Read Global Settings" ON public.global_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin Full Access Global Settings" ON public.global_settings;
CREATE POLICY "Admin Full Access Global Settings" ON public.global_settings FOR ALL USING (auth.role() = 'authenticated');

-- 3. INSERIR DADOS PADRÃO (AQUI ESTÁ A SOLUÇÃO DO 406)
-- Se não tiver dados, o comando .single() do site retorna erro 406.
-- Vamos criar as linhas, se elas já existirem, não faz nada.

INSERT INTO public.global_settings (key, value)
VALUES 
    ('top_bar_text', 'FRETE GRÁTIS PARA TODO O BRASIL NAS COMPRAS ACIMA DE R$ 299'),
    ('top_bar_active', 'true')
ON CONFLICT (key) DO NOTHING;

-- Verificando se inseriu
SELECT * FROM public.global_settings;
