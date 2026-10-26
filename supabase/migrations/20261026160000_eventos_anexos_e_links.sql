-- =============================================================================
-- Migration: Links Externos, Tabela e Storage de Anexos com Auto-Expurgo de 7 Dias
--
-- Contexto e Regras de Negócio:
-- 1. public.eventos:
--    - Adiciona coluna links JSONB DEFAULT '[]'::jsonb NOT NULL.
--    - Constraint garantindo que jsonb_array_length(links) <= 2 (máx. 2 links por atividade).
--    - Constraint de chave composta UNIQUE (id, turma_id) para integridade relacional estrita.
-- 2. public.eventos_anexos:
--    - Tabela dedicada para múltiplos anexos físicos por atividade.
--    - Limite de 5 MB por arquivo (tamanho_bytes > 0 AND tamanho_bytes <= 5242880).
--    - Foreign key composta vinculando (evento_id, turma_id) a public.eventos com CASCADE.
--    - Índices por evento_id e turma_id.
--    - RLS: SELECT para membros da mesma turma ou ADMIN; INSERT/UPDATE/DELETE para líderes ou ADMIN.
-- 3. Bucket e Políticas no Supabase Storage (eventos-anexos):
--    - Bucket privado eventos-anexos com limite de 5 MB e tipos MIME permitidos (PDF, JPEG, PNG, WEBP).
--    - Políticas em storage.objects espelhando a segurança de turma (<turma_id>/<evento_id>/...).
-- 4. Stored Procedure public.expurgar_anexos_antigos_eventos():
--    - Executa exclusão atômica de anexos cujos eventos expiraram há mais de 7 dias.
--    - Retorna a lista dos storage_path excluídos para deleção física no bucket pelo backend.
-- =============================================================================

-- =============================================================================
-- PARTE 1: ALTERAÇÕES NA TABELA public.eventos
-- =============================================================================

-- 1. Adicionar coluna links (array JSONB padrão vazio)
ALTER TABLE public.eventos 
  ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb NOT NULL;

-- 2. Restrição: Máximo de 2 links por atividade/evento
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_eventos_links_max_length'
  ) THEN
    ALTER TABLE public.eventos 
      ADD CONSTRAINT check_eventos_links_max_length 
      CHECK (jsonb_typeof(links) = 'array' AND jsonb_array_length(links) <= 2);
  END IF;
END $$;

-- 3. Chave única composta (id, turma_id) para integridade referencial estrita de anexos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_eventos_id_turma_id'
  ) THEN
    ALTER TABLE public.eventos 
      ADD CONSTRAINT uq_eventos_id_turma_id UNIQUE (id, turma_id);
  END IF;
END $$;

-- =============================================================================
-- PARTE 2: CRIAÇÃO DA TABELA public.eventos_anexos
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.eventos_anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evento_id UUID NOT NULL,
    turma_id UUID NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    tamanho_bytes INTEGER NOT NULL CHECK (tamanho_bytes > 0 AND tamanho_bytes <= 5242880),
    mime_type VARCHAR(100) NOT NULL,
    criado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT fk_eventos_anexos_evento_turma 
      FOREIGN KEY (evento_id, turma_id) 
      REFERENCES public.eventos (id, turma_id) 
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_eventos_anexos_evento_id ON public.eventos_anexos (evento_id);
CREATE INDEX IF NOT EXISTS idx_eventos_anexos_turma_id ON public.eventos_anexos (turma_id);

-- =============================================================================
-- PARTE 3: POLÍTICAS DE ROW LEVEL SECURITY (RLS) EM public.eventos_anexos
-- =============================================================================

ALTER TABLE public.eventos_anexos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos_anexos TO authenticated;

DROP POLICY IF EXISTS "eventos_anexos_select_membro_ou_admin" ON public.eventos_anexos;
DROP POLICY IF EXISTS "eventos_anexos_insert_lider_ou_admin" ON public.eventos_anexos;
DROP POLICY IF EXISTS "eventos_anexos_update_lider_ou_admin" ON public.eventos_anexos;
DROP POLICY IF EXISTS "eventos_anexos_delete_lider_ou_admin" ON public.eventos_anexos;

-- SELECT: Alunos e líderes da mesma turma ou administradores gerais
CREATE POLICY "eventos_anexos_select_membro_ou_admin"
ON public.eventos_anexos
FOR SELECT
TO authenticated
USING (
    turma_id = public.get_my_turma_id()
    OR public.is_admin()
);

-- INSERT: Líderes da turma correspondente ou administradores gerais
CREATE POLICY "eventos_anexos_insert_lider_ou_admin"
ON public.eventos_anexos
FOR INSERT
TO authenticated
WITH CHECK (
    criado_por = (SELECT auth.uid())
    AND (
        (turma_id = public.get_my_turma_id() AND public.is_lider())
        OR public.is_admin()
    )
);

-- UPDATE: Líderes da mesma turma ou administradores gerais
CREATE POLICY "eventos_anexos_update_lider_ou_admin"
ON public.eventos_anexos
FOR UPDATE
TO authenticated
USING (
    (turma_id = public.get_my_turma_id() AND public.is_lider())
    OR public.is_admin()
)
WITH CHECK (
    (turma_id = public.get_my_turma_id() AND public.is_lider())
    OR public.is_admin()
);

-- DELETE: Líderes da mesma turma ou administradores gerais
CREATE POLICY "eventos_anexos_delete_lider_ou_admin"
ON public.eventos_anexos
FOR DELETE
TO authenticated
USING (
    (turma_id = public.get_my_turma_id() AND public.is_lider())
    OR public.is_admin()
);

-- =============================================================================
-- PARTE 4: CONFIGURAÇÃO DO BUCKET NO SUPABASE STORAGE (eventos-anexos)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'eventos-anexos',
    'eventos-anexos',
    false,
    5242880,
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas em storage.objects para o bucket eventos-anexos
DROP POLICY IF EXISTS "eventos_anexos_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "eventos_anexos_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "eventos_anexos_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "eventos_anexos_storage_delete" ON storage.objects;

-- SELECT no Storage: Membros da mesma turma (<turma_id>/...) ou Admin Geral
CREATE POLICY "eventos_anexos_storage_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'eventos-anexos'
    AND (
        split_part(name, '/', 1) = public.get_my_turma_id()::text
        OR public.is_admin()
    )
);

-- INSERT no Storage: Líderes da respectiva turma ou Admin Geral
CREATE POLICY "eventos_anexos_storage_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'eventos-anexos'
    AND (
        (
            split_part(name, '/', 1) = public.get_my_turma_id()::text
            AND public.is_lider()
        )
        OR public.is_admin()
    )
);

-- UPDATE no Storage: Líderes da respectiva turma ou Admin Geral
CREATE POLICY "eventos_anexos_storage_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'eventos-anexos'
    AND (
        (
            split_part(name, '/', 1) = public.get_my_turma_id()::text
            AND public.is_lider()
        )
        OR public.is_admin()
    )
)
WITH CHECK (
    bucket_id = 'eventos-anexos'
    AND (
        (
            split_part(name, '/', 1) = public.get_my_turma_id()::text
            AND public.is_lider()
        )
        OR public.is_admin()
    )
);

-- DELETE no Storage: Líderes da respectiva turma ou Admin Geral
CREATE POLICY "eventos_anexos_storage_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'eventos-anexos'
    AND (
        (
            split_part(name, '/', 1) = public.get_my_turma_id()::text
            AND public.is_lider()
        )
        OR public.is_admin()
    )
);

-- =============================================================================
-- PARTE 5: STORED PROCEDURE DE AUTO-EXPURGO (public.expurgar_anexos_antigos_eventos)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.expurgar_anexos_antigos_eventos()
RETURNS TABLE (
    storage_path TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validação de segurança: apenas ADMIN geral ou service_role podem executar o expurgo
    IF NOT public.is_admin() AND COALESCE(auth.role(), '') <> 'service_role' THEN
        RAISE EXCEPTION 'FORBIDDEN: Apenas administradores gerais ou serviços de manutenção podem executar o expurgo de anexos.'
            USING ERRCODE = '42501';
    END IF;

    RETURN QUERY
    WITH anexos_expirados AS (
        SELECT ea.id, ea.storage_path
        FROM public.eventos_anexos ea
        JOIN public.eventos e ON e.id = ea.evento_id
        WHERE e.data_hora_limite < (NOW() - INTERVAL '7 days')
        FOR UPDATE OF ea
    ),
    deletados AS (
        DELETE FROM public.eventos_anexos ea
        USING anexos_expirados ae
        WHERE ea.id = ae.id
        RETURNING ea.storage_path
    )
    SELECT d.storage_path FROM deletados d;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.expurgar_anexos_antigos_eventos() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expurgar_anexos_antigos_eventos() TO authenticated, service_role;
