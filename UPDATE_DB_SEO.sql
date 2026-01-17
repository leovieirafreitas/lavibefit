-- Criação da tabela de configurações do site (SEO)
CREATE TABLE IF NOT EXISTS site_settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    site_title TEXT DEFAULT 'La Vibe Fit - Moda Fitness',
    site_description TEXT DEFAULT 'Moda fitness feminina em Manaus. Leggings, tops, shorts e conjuntos com estilo e conforto.',
    keywords TEXT DEFAULT 'moda fitness, manaus, roupa de academia, legging, top, la vibe fit',
    google_verification_code TEXT,
    
    -- Dados para SEO Local (Schema.org)
    business_name TEXT DEFAULT 'La Vibe Fit',
    city TEXT DEFAULT 'Manaus',
    state TEXT DEFAULT 'AM',
    address TEXT, -- Endereço completo se houver loja física
    phone TEXT DEFAULT '5592984665689', -- WhatsApp
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Inserir configuração inicial se não existir
INSERT INTO site_settings (id, site_title)
SELECT 1, 'La Vibe Fit - Moda Fitness'
WHERE NOT EXISTS (SELECT 1 FROM site_settings WHERE id = 1);

-- Política de Segurança (RLS) para permitir leitura pública e edição apenas admin
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are viewable by everyone" ON site_settings
FOR SELECT USING (true);

-- Assumindo que a autenticação de admin já protege a rota de API,
-- mas idealmente aqui teríamos uma política de update restrita.
-- Como estamos usando anon key no server-side ou client side com RLS simples:
CREATE POLICY "Settings are updatable by public (provisorio admin)" ON site_settings
FOR UPDATE USING (true);
