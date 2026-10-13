-- =============================================================================
-- Migration: Políticas de Row Level Security (RLS) para avisos_gerais
--
-- Regras de Negócio:
-- 1. Leitura (SELECT): Qualquer usuário autenticado (authenticated) pode ler
--    os avisos gerais da instituição/plataforma.
-- 2. Mutações (INSERT, UPDATE, DELETE): Restritas estritamente a usuários
--    autenticados com role = 'ADMIN' na tabela public.usuarios.
-- =============================================================================

-- 1. Garante que RLS esteja habilitado na tabela
ALTER TABLE public.avisos_gerais ENABLE ROW LEVEL SECURITY;

-- 2. Política de Leitura (SELECT)
-- Qualquer usuário autenticado pode visualizar avisos gerais
CREATE POLICY "avisos_gerais_select_authenticated"
ON public.avisos_gerais
FOR SELECT
TO authenticated
USING (true);

-- 3. Política de Inserção (INSERT)
-- Apenas usuários autenticados com role = 'ADMIN' podem criar novos avisos
CREATE POLICY "avisos_gerais_insert_admin"
ON public.avisos_gerais
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.usuarios u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'ADMIN'
    )
);

-- 4. Política de Atualização (UPDATE)
-- Apenas usuários autenticados com role = 'ADMIN' podem editar avisos existentes
CREATE POLICY "avisos_gerais_update_admin"
ON public.avisos_gerais
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.usuarios u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'ADMIN'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.usuarios u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'ADMIN'
    )
);

-- 5. Política de Exclusão (DELETE)
-- Apenas usuários autenticados com role = 'ADMIN' podem remover avisos
CREATE POLICY "avisos_gerais_delete_admin"
ON public.avisos_gerais
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.usuarios u
        WHERE u.id = (SELECT auth.uid())
          AND u.role = 'ADMIN'
    )
);
