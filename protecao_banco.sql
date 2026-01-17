-- ==============================================================================
-- CORREÇÃO DE SEGURANÇA SUPABASE (LA VIBE FIT) - VERSÃO 2 (LIMPEZA)
-- Este script apaga regras antigas para evitar erros de duplicidade.
-- ==============================================================================

-- 1. HABILITAR RLS (Segurança)
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_offers ENABLE ROW LEVEL SECURITY;

-- 2. LIMPAR REGRAS ANTIGAS (Para não dar erro ao criar novas)
DROP POLICY IF EXISTS "Public Read Home Content" ON public.home_content;
DROP POLICY IF EXISTS "Public Read Hero Slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Public Read Global Settings" ON public.global_settings;
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "Public Read Variants" ON public.product_variants;
DROP POLICY IF EXISTS "Public Read Reviews" ON public.product_reviews;
DROP POLICY IF EXISTS "Public Read Offers" ON public.home_offers;
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Create Orders" ON public.orders;
DROP POLICY IF EXISTS "Public Create Reviews" ON public.product_reviews;

DROP POLICY IF EXISTS "Admin Full Access Home Content" ON public.home_content;
DROP POLICY IF EXISTS "Admin Full Access Hero Slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Admin Full Access Global Settings" ON public.global_settings;
DROP POLICY IF EXISTS "Admin Full Access Products" ON public.products;
DROP POLICY IF EXISTS "Admin Full Access Variants" ON public.product_variants;
DROP POLICY IF EXISTS "Admin Full Access Offers" ON public.home_offers;
DROP POLICY IF EXISTS "Admin Full Access Orders" ON public.orders;

-- 3. CRIAR NOVAS REGRAS (POLICIES)

-- LEITURA PÚBLICA (Essenciais para o site)
CREATE POLICY "Public Read Home Content" ON public.home_content FOR SELECT USING (true);
CREATE POLICY "Public Read Hero Slides" ON public.hero_slides FOR SELECT USING (true);
CREATE POLICY "Public Read Global Settings" ON public.global_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public Read Variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Public Read Reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Public Read Offers" ON public.home_offers FOR SELECT USING (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);

-- CRIAÇÃO PÚBLICA (Vendas e Reviews)
CREATE POLICY "Public Create Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Create Reviews" ON public.product_reviews FOR INSERT WITH CHECK (true);

-- ADMIN TOTAL (Você logado)
CREATE POLICY "Admin Full Access Home Content" ON public.home_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Hero Slides" ON public.hero_slides FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Global Settings" ON public.global_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Variants" ON public.product_variants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Offers" ON public.home_offers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
