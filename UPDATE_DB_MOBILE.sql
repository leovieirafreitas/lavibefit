-- Rode este comando no SQL Editor do Supabase para habilitar imagens mobile separadas
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;

-- Remover obrigatoriedade de título e subtítulo (já que agora são opcionais no design)
ALTER TABLE hero_slides ALTER COLUMN title DROP NOT NULL;
ALTER TABLE hero_slides ALTER COLUMN subtitle DROP NOT NULL;
