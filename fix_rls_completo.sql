-- ============================================
-- SCRIPT COMPLETO DE CORREÇÃO RLS
-- Execute este script no Supabase SQL Editor
-- ============================================

-- 1. REMOVER TODAS AS POLÍTICAS ANTIGAS (LIMPEZA)
DROP POLICY IF EXISTS "Public Read Global Settings" ON public.global_settings;
DROP POLICY IF EXISTS "Public Read Hero Slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Public Read Home Content" ON public.home_content;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Public Read Variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public Read Reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Public Read Offers" ON public.home_offers;
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;

-- 2. GARANTIR QUE RLS ESTÁ HABILITADO
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS DE LEITURA PÚBLICA (PARA O SITE FUNCIONAR)
CREATE POLICY "Public Read Global Settings" 
ON public.global_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Public Read Hero Slides" 
ON public.hero_slides 
FOR SELECT 
USING (true);

CREATE POLICY "Public Read Home Content" 
ON public.home_content 
FOR SELECT 
USING (true);

CREATE POLICY "Public Read Products" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Public Read Variants" 
ON public.product_variants 
FOR SELECT 
USING (true);

CREATE POLICY "Public Read Reviews" 
ON public.product_reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Public Read Offers" 
ON public.home_offers 
FOR SELECT 
USING (true);

CREATE POLICY "Public Read Orders" 
ON public.orders 
FOR SELECT 
USING (true);

-- 4. POLÍTICAS DE CRIAÇÃO PÚBLICA (PARA VENDAS E REVIEWS)
CREATE POLICY "Public Create Orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public Create Reviews" 
ON public.product_reviews 
FOR INSERT 
WITH CHECK (true);

-- 5. POLÍTICAS DE ADMINISTRAÇÃO (PARA O PAINEL ADMIN)
CREATE POLICY "Admin Full Access Global Settings" 
ON public.global_settings 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Full Access Hero Slides" 
ON public.hero_slides 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Full Access Home Content" 
ON public.home_content 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Full Access Products" 
ON public.products 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Full Access Variants" 
ON public.product_variants 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Full Access Offers" 
ON public.home_offers 
FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Full Access Orders" 
ON public.orders 
FOR ALL 
USING (auth.role() = 'authenticated');

-- 6. INSERIR DADOS PADRÃO (SE NÃO EXISTIREM)
INSERT INTO public.global_settings (key, value)
VALUES 
    ('top_bar_text', 'FRETE GRÁTIS PARA TODO MANAUS ACIMA DE R$ 150,00'),
    ('top_bar_active', 'true')
ON CONFLICT (key) DO UPDATE 
SET value = EXCLUDED.value;

-- 7. VERIFICAÇÃO FINAL
SELECT 'RLS configurado com sucesso!' AS status;
