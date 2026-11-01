-- =============================================================================
-- Migration: Suporte a Imagem de Destaque e Links nos Avisos do Mural Geral
--
-- Contexto e Regras de Negócio:
-- 1. public.avisos_gerais:
--    - Adiciona coluna links JSONB DEFAULT '[]'::jsonb NOT NULL.
--    - Adiciona constraint garantindo que links seja array com no máximo 2 itens (limite de 2 links por comunicado).
--    - Adiciona colunas imagem_url e imagem_storage_path para suporte a banner/cartaz visual.
-- 2. Supabase Storage (mural-anexos):
--    - Cria/garante existência do bucket privado 'mural-anexos' (5 MB, formatos JPEG/PNG/WEBP).
--    - Políticas em storage.objects:
--      * SELECT: qualquer usuário autenticado pode visualizar as imagens de avisos do mural.
--      * INSERT, UPDATE, DELETE: restrito exclusivamente a administradores gerais (public.is_admin()).
-- =============================================================================

-- =============================================================================
-- PARTE 1: ALTERAÇÕES NA TABELA public.avisos_gerais
-- =============================================================================

-- 1. Coluna links (array JSONB padrão vazio)
ALTER TABLE public.avisos_gerais 
  ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb NOT NULL;

-- 2. Restrição de Cota de Links (máximo de 2 links)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_avisos_gerais_links_max_length'
  ) THEN
    ALTER TABLE public.avisos_gerais 
      ADD CONSTRAINT check_avisos_gerais_links_max_length 
      CHECK (jsonb_typeof(links) = 'array' AND jsonb_array_length(links) <= 2);
  END IF;
END $$;

-- 3. Colunas para Imagem de Destaque
ALTER TABLE public.avisos_gerais 
  ADD COLUMN IF NOT EXISTS imagem_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS imagem_storage_path TEXT NULL;

-- =============================================================================
-- PARTE 2: BUCKET NO SUPABASE STORAGE (mural-anexos)
-- =============================================================================

-- 1. Criação / Configuração do Bucket Privado
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'mural-anexos',
    'mural-anexos',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Políticas de Acesso em storage.objects

-- Leitura: Qualquer usuário autenticado pode visualizar as imagens dos avisos
DROP POLICY IF EXISTS "mural_anexos_storage_select" ON storage.objects;
CREATE POLICY "mural_anexos_storage_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'mural-anexos');

-- Inserção: Apenas Administrador Geral pode fazer upload de cartazes/imagens do mural
DROP POLICY IF EXISTS "mural_anexos_storage_insert" ON storage.objects;
CREATE POLICY "mural_anexos_storage_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'mural-anexos'
    AND public.is_admin()
);

-- Atualização: Apenas Administrador Geral pode atualizar imagens do mural
DROP POLICY IF EXISTS "mural_anexos_storage_update" ON storage.objects;
CREATE POLICY "mural_anexos_storage_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'mural-anexos' AND public.is_admin())
WITH CHECK (bucket_id = 'mural-anexos' AND public.is_admin());

-- Exclusão: Apenas Administrador Geral pode excluir imagens do mural
DROP POLICY IF EXISTS "mural_anexos_storage_delete" ON storage.objects;
CREATE POLICY "mural_anexos_storage_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'mural-anexos' AND public.is_admin());
