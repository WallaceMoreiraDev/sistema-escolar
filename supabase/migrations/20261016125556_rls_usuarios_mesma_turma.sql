-- =============================================================================
-- Migration: Helper get_my_turma_id e Policy RLS para Listagem de Membros da Turma
--
-- Regras de Negócio (Fase 1 - Gestão de Membros da Turma):
-- 1. Helper get_my_turma_id(): Executa com SECURITY DEFINER e STABLE para buscar
--    o turma_id do usuário autenticado sem disparar recursão infinita no RLS de usuarios.
-- 2. RLS SELECT em usuarios: Permite que alunos e líderes leiam os perfis dos colegas
--    que compartilham o mesmo turma_id (apenas se turma_id IS NOT NULL).
-- 3. Mantém intocadas as policies existentes de leitura do próprio perfil e de ADMIN.
-- =============================================================================

-- 1. FUNÇÃO HELPER: get_my_turma_id() (Anti-recursão de RLS)
CREATE OR REPLACE FUNCTION public.get_my_turma_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT turma_id 
  FROM public.usuarios 
  WHERE id = (SELECT auth.uid());
$$;

-- Restringe a execução apenas para usuários autenticados
REVOKE EXECUTE ON FUNCTION public.get_my_turma_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_turma_id() TO authenticated;

-- 2. POLÍTICA DE LEITURA (SELECT) EM usuarios PARA COLEGAS DA MESMA TURMA
CREATE POLICY "usuarios_select_mesma_turma"
ON public.usuarios
FOR SELECT
TO authenticated
USING (
    turma_id IS NOT NULL 
    AND turma_id = public.get_my_turma_id()
);
