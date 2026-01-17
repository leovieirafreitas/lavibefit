-- CORREÇÃO DE LINKS QUEBRADOS NO SITE

-- Atualiza o link do Banner de Lançamentos (id 2) para apontar para a pagina certa (/lancamentos)
UPDATE public.home_content
SET link_url = '/lancamentos'
WHERE id = 2; -- Garante que so muda o banner Lançamentos

-- Opcional: Verifica se tem mais algum link errado de novidades
UPDATE public.home_content
SET link_url = '/lancamentos'
WHERE link_url = '/feminino/novidades';
