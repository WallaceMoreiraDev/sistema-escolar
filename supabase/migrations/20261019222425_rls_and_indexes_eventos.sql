-- =============================================================================
-- Migration: RLS, Helper is_lider, Integridade e Índices de public.eventos
--
-- Contexto e Regras de Negócio:
-- 1. Helper is_lider(): Executa com SECURITY DEFINER e STABLE para verificar se
--    o usuário autenticado possui role = 'LIDER' sem causar recursão de RLS.
-- 2. Integridade de Autoria: Define DEFAULT auth.uid() para a coluna criado_por
--    e valida na policy de inserção que criado_por corresponde a auth.uid().
-- 3. Políticas de Row Level Security (RLS) para authenticated:
--    - SELECT: Membros da mesma turma (via get_my_turma_id()) ou ADMIN geral.
--    - INSERT: Apenas LIDER da turma correspondente ou ADMIN geral.
--    - UPDATE: Apenas LIDER da turma correspondente ou ADMIN geral.
--    - DELETE: Apenas LIDER da turma correspondente ou ADMIN geral.
-- 4. Índice Composto de Performance:
--    - idx_eventos_turma_data_limite: Otimiza filtros por turma_id, range de
--      datas e ordenação cronológica ascendente para o módulo de Calendário.
-- =============================================================================

-- 1. FUNÇÃO HELPER: is_lider() (Anti-recursão de RLS)
CREATE OR REPLACE FUNCTION public.is_lider()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.usuarios 
    WHERE id = (SELECT auth.uid()) 
      AND role = 'LIDER'
  );
$$;

-- Restringe a execução do helper exclusivamente a usuários autenticados
REVOKE EXECUTE ON FUNCTION public.is_lider() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_lider() TO authenticated;

-- 2. INTEGRIDADE DE AUTORIA E ÍNDICE DE PERFORMANCE
ALTER TABLE public.eventos 
  ALTER COLUMN criado_por SET DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS idx_eventos_turma_data_limite 
ON public.eventos (turma_id, data_hora_limite ASC);

-- 3. HABILITAÇÃO E PERMISSÕES DE TABELA
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.eventos TO authenticated;

-- 4. POLÍTICAS DE ROW LEVEL SECURITY (RLS)

-- Remove policies existentes caso tenham sido criadas anteriormente (Idempotência)
DROP POLICY IF EXISTS "eventos_select_membro_ou_admin" ON public.eventos;
DROP POLICY IF EXISTS "eventos_insert_lider_ou_admin" ON public.eventos;
DROP POLICY IF EXISTS "eventos_update_lider_ou_admin" ON public.eventos;
DROP POLICY IF EXISTS "eventos_delete_lider_ou_admin" ON public.eventos;

-- SELECT (Leitura): Alunos/Líderes da respectiva turma ou Administrador Geral
CREATE POLICY "eventos_select_membro_ou_admin"
ON public.eventos
FOR SELECT
TO authenticated
USING (
    turma_id = public.get_my_turma_id()
    OR public.is_admin()
);

-- INSERT (Criação): Líder da respectiva turma ou Administrador Geral, garantindo autoria
CREATE POLICY "eventos_insert_lider_ou_admin"
ON public.eventos
FOR INSERT
TO authenticated
WITH CHECK (
    criado_por = (SELECT auth.uid())
    AND (
        (turma_id = public.get_my_turma_id() AND public.is_lider())
        OR public.is_admin()
    )
);

-- UPDATE (Edição): Líder da respectiva turma ou Administrador Geral
CREATE POLICY "eventos_update_lider_ou_admin"
ON public.eventos
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

-- DELETE (Exclusão): Líder da respectiva turma ou Administrador Geral
CREATE POLICY "eventos_delete_lider_ou_admin"
ON public.eventos
FOR DELETE
TO authenticated
USING (
    (turma_id = public.get_my_turma_id() AND public.is_lider())
    OR public.is_admin()
);
