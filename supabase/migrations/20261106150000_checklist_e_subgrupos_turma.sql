-- =============================================================================
-- Migration: Checklist de Tarefas Concluídas e Suporte a Subgrupos de Turma (A/B)
--
-- Contexto e Regras de Negócio:
-- 1. Tabela usuario_tarefas_concluidas:
--    - Permite que cada aluno marque individualmente suas tarefas como concluídas.
--    - RLS estrito: Aluno só pode ler, marcar e desmarcar tarefas em seu próprio nome.
--    - Chave primária composta (user_id, evento_id) com exclusão em cascata.
-- 2. Coluna subgrupo_turma em public.usuarios:
--    - Identifica a divisão do aluno na turma ('GERAL', 'TURMA_A', 'TURMA_B').
--    - Padrão 'GERAL' com constraint check.
--    - Concessão de UPDATE (subgrupo_turma) para authenticated (Column-Level Security).
-- 3. Coluna grupo_destinatario em public.eventos:
--    - Identifica a quem o evento/tarefa se destina ('TODOS', 'TURMA_A', 'TURMA_B').
--    - Padrão 'TODOS' com constraint check.
--    - Índice composto (turma_id, grupo_destinatario) para filtros de calendário.
--    - Concessão de UPDATE (grupo_destinatario) para authenticated (Column-Level Security).
-- =============================================================================

-- =============================================================================
-- PARTE A: TABELA DE CHECKLIST PESSOAL (usuario_tarefas_concluidas)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.usuario_tarefas_concluidas (
    user_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
    concluido_em TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, evento_id)
);

-- Índices de performance para contagens e consultas por aluno ou por evento
CREATE INDEX IF NOT EXISTS idx_usuario_tarefas_concluidas_user 
ON public.usuario_tarefas_concluidas (user_id);

CREATE INDEX IF NOT EXISTS idx_usuario_tarefas_concluidas_evento 
ON public.usuario_tarefas_concluidas (evento_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.usuario_tarefas_concluidas ENABLE ROW LEVEL SECURITY;

-- Idempotência: Remover policies existentes caso tenham sido criadas
DROP POLICY IF EXISTS "usuario_tarefas_concluidas_select_proprio" ON public.usuario_tarefas_concluidas;
DROP POLICY IF EXISTS "usuario_tarefas_concluidas_insert_proprio" ON public.usuario_tarefas_concluidas;
DROP POLICY IF EXISTS "usuario_tarefas_concluidas_delete_proprio" ON public.usuario_tarefas_concluidas;

-- Leitura: Aluno só visualiza suas próprias tarefas concluídas
CREATE POLICY "usuario_tarefas_concluidas_select_proprio"
ON public.usuario_tarefas_concluidas
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Inserção: Aluno só pode marcar conclusão para si mesmo
CREATE POLICY "usuario_tarefas_concluidas_insert_proprio"
ON public.usuario_tarefas_concluidas
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Exclusão: Aluno só pode desmarcar conclusão de si mesmo
CREATE POLICY "usuario_tarefas_concluidas_delete_proprio"
ON public.usuario_tarefas_concluidas
FOR DELETE
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Permissões na tabela
REVOKE ALL ON public.usuario_tarefas_concluidas FROM anon;
GRANT SELECT, INSERT, DELETE ON public.usuario_tarefas_concluidas TO authenticated;


-- =============================================================================
-- PARTE B: COLUNA DE DIVISÃO NO PERFIL DO USUÁRIO (subgrupo_turma)
-- =============================================================================

ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS subgrupo_turma VARCHAR(20) NOT NULL DEFAULT 'GERAL';

ALTER TABLE public.usuarios 
DROP CONSTRAINT IF EXISTS chk_usuarios_subgrupo_turma;

ALTER TABLE public.usuarios 
ADD CONSTRAINT chk_usuarios_subgrupo_turma 
CHECK (subgrupo_turma IN ('GERAL', 'TURMA_A', 'TURMA_B'));

-- Concessão em Column-Level Security (CLS) para permitir atualização do subgrupo pelo usuário autenticado
GRANT UPDATE (subgrupo_turma) ON public.usuarios TO authenticated;


-- =============================================================================
-- PARTE C: COLUNA DE DESTINATÁRIO NO CADASTRO DE EVENTOS (grupo_destinatario)
-- =============================================================================

ALTER TABLE public.eventos 
ADD COLUMN IF NOT EXISTS grupo_destinatario VARCHAR(20) NOT NULL DEFAULT 'TODOS';

ALTER TABLE public.eventos 
DROP CONSTRAINT IF EXISTS chk_eventos_grupo_destinatario;

ALTER TABLE public.eventos 
ADD CONSTRAINT chk_eventos_grupo_destinatario 
CHECK (grupo_destinatario IN ('TODOS', 'TURMA_A', 'TURMA_B'));

CREATE INDEX IF NOT EXISTS idx_eventos_turma_grupo_destinatario 
ON public.eventos (turma_id, grupo_destinatario);

-- Concessão em Column-Level Security (CLS) para permitir que líderes/admins atualizem o destinatário do evento
GRANT UPDATE (grupo_destinatario) ON public.eventos TO authenticated;
