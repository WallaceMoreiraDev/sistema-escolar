-- =============================================================================
-- Migration: Adiciona created_at, enum 'Integral' e Políticas de RLS em pedidos_turma
--
-- Regras de Negócio (Etapa 1 - Fluxo de Turmas):
-- 1. Enum turno_type: Adiciona 'Integral' para compatibilidade total com a ETEC/Frontend.
-- 2. Coluna created_at: Ordenação cronológica (FIFO) para a moderação da fila de pedidos.
-- 3. RLS SELECT: Aluno visualiza apenas suas próprias solicitações; ADMIN visualiza todas.
-- 4. RLS INSERT: Aluno só cria em seu nome (auth.uid), com status 'pendente' e se não tiver turma.
-- 5. RLS DELETE: Aluno só cancela seu pedido se estiver 'pendente'; ADMIN pode excluir qualquer pedido.
-- 6. RLS UPDATE: Revogado para authenticated (pedidos de turma não são editáveis; se errar, cancela e recria).
-- =============================================================================

-- 1. Suporte a turno Integral
ALTER TYPE turno_type ADD VALUE IF NOT EXISTS 'Integral';

-- 2. Adição da coluna created_at para ordenação cronológica
ALTER TABLE public.pedidos_turma 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 3. Assegura RLS habilitado na tabela
ALTER TABLE public.pedidos_turma ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE RLS:

-- SELECT: Aluno lê seus próprios pedidos; ADMIN lê todos os pedidos
CREATE POLICY "pedidos_turma_select"
ON public.pedidos_turma
FOR SELECT
TO authenticated
USING (
    usuario_id = (SELECT auth.uid())
    OR EXISTS (
        SELECT 1
        FROM public.usuarios u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'ADMIN'
    )
);

-- INSERT: Aluno só cria em seu próprio nome, com status pendente e se não tiver turma
CREATE POLICY "pedidos_turma_insert"
ON public.pedidos_turma
FOR INSERT
TO authenticated
WITH CHECK (
    usuario_id = (SELECT auth.uid())
    AND status = 'pendente'
    AND EXISTS (
        SELECT 1
        FROM public.usuarios u
        WHERE u.id = (SELECT auth.uid())
          AND u.turma_id IS NULL
    )
);

-- DELETE: Aluno cancela apenas seu pedido pendente; ADMIN pode excluir qualquer pedido
CREATE POLICY "pedidos_turma_delete"
ON public.pedidos_turma
FOR DELETE
TO authenticated
USING (
    (usuario_id = (SELECT auth.uid()) AND status = 'pendente')
    OR EXISTS (
        SELECT 1
        FROM public.usuarios u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'ADMIN'
    )
);

-- 5. Revoga permissão de UPDATE em pedidos_turma para anon e authenticated
REVOKE UPDATE ON public.pedidos_turma FROM anon, authenticated;
