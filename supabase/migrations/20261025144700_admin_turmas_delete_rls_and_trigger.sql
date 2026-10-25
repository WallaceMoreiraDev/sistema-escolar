-- =============================================================================
-- Migration: RLS de Exclusão, Trigger de Integridade Pré-Exclusão e RPC excluir_turma
--
-- Contexto e Regras de Negócio:
-- 1. Permissões e RLS de Exclusão em public.turmas:
--    - Concede permissão DELETE para authenticated.
--    - Cria policy turmas_delete_admin restrita a Administrador Geral (public.is_admin()).
-- 2. Trigger de Integridade Pré-Exclusão (handle_turma_delete):
--    - Dispara BEFORE DELETE em public.turmas.
--    - Desvincula todos os membros da turma (turma_id = NULL, data_entrada_turma = NULL).
--    - Rebaixa automaticamente membros com papel LIDER para ALUNO (preservando ADMIN).
--    - Previne líderes órfãos/fantasmas caso a turma seja excluída.
-- 3. Stored Procedure RPC: public.excluir_turma(p_turma_id UUID):
--    - Operação transacional atômica com validação de admin e exceções explícitas (42501, P0002).
-- 4. Índices de Otimização e Performance:
--    - idx_usuarios_turma_id: Índice parcial para aceleração de contagem/desvinculação de membros.
--    - idx_turmas_data_criacao: Índice para ordenação cronológica de turmas ativas.
-- =============================================================================

-- =============================================================================
-- PARTE A: PERMISSÕES E RLS DE EXCLUSÃO EM public.turmas
-- =============================================================================

-- Concede privilégio de DELETE na tabela turmas para authenticated
GRANT DELETE ON public.turmas TO authenticated;

-- Criação da policy de exclusão restrita a Administrador Geral (idempotente)
DROP POLICY IF EXISTS "turmas_delete_admin" ON public.turmas;
CREATE POLICY "turmas_delete_admin"
ON public.turmas
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =============================================================================
-- PARTE B: TRIGGER DE INTEGRIDADE PRÉ-EXCLUSÃO (handle_turma_delete)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_turma_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Reseta papel de LIDER para ALUNO e limpa turma_id e data de entrada
  UPDATE public.usuarios
  SET role = CASE WHEN role = 'ADMIN' THEN 'ADMIN'::user_role ELSE 'ALUNO'::user_role END,
      data_entrada_turma = NULL,
      turma_id = NULL
  WHERE turma_id = OLD.id;
  RETURN OLD;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_turma_deleted ON public.turmas;
CREATE TRIGGER on_turma_deleted
  BEFORE DELETE ON public.turmas
  FOR EACH ROW EXECUTE PROCEDURE public.handle_turma_delete();

-- =============================================================================
-- PARTE C: STORED PROCEDURE RPC: public.excluir_turma(p_turma_id UUID)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.excluir_turma(p_turma_id UUID)
RETURNS VOID AS
$$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Apenas administradores gerais podem excluir turmas.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.turmas WHERE id = p_turma_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CLASS_NOT_FOUND: Turma não encontrada.' USING ERRCODE = 'P0002';
  END IF;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.excluir_turma(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.excluir_turma(UUID) TO authenticated;

-- =============================================================================
-- PARTE D: ÍNDICES DE OTIMIZAÇÃO E PERFORMANCE
-- =============================================================================

-- Índice parcial para contagem, agrupamento e desvinculação de membros por turma
CREATE INDEX IF NOT EXISTS idx_usuarios_turma_id 
ON public.usuarios (turma_id) 
WHERE turma_id IS NOT NULL;

-- Índice para ordenação das turmas ativas pela data de criação
CREATE INDEX IF NOT EXISTS idx_turmas_data_criacao 
ON public.turmas (data_criacao DESC);
