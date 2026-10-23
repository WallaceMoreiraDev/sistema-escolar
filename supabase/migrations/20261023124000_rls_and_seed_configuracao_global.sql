-- =============================================================================
-- Migration: RLS, Integridade e Seed Inicial de public.configuracao_global
--
-- Contexto e Regras de Negócio:
-- 1. Integridade e Auditoria:
--    - Garante NOT NULL e DEFAULT 0.00 na coluna meta_arrecadada_mes.
--    - Adiciona constraint check (meta_arrecadada_mes >= 0) para impedir valores negativos.
--    - Adiciona coluna de auditoria updated_at TIMESTAMPTZ DEFAULT NOW().
-- 2. Seed / Backfill Inicial:
--    - Insere o registro singleton obrigatório (id = 1) com meta inicial 0.00 (idempotente).
-- 3. Políticas de Row Level Security (RLS) e Privilégios:
--    - SELECT: Permitido a qualquer usuário autenticado (USING (true)), viabilizando
--      a exibição pública da meta/arrecadação no Dashboard de alunos e líderes.
--    - UPDATE: Permitido exclusivamente para Administradores Gerais (public.is_admin()).
--    - Sem concessão de INSERT/DELETE para authenticated (garantia de singleton id = 1).
-- =============================================================================

-- =============================================================================
-- PARTE A: AJUSTES DE INTEGRIDADE E AUDITORIA
-- =============================================================================

-- 1. Garantir NOT NULL e DEFAULT 0.00
ALTER TABLE public.configuracao_global 
  ALTER COLUMN meta_arrecadada_mes SET NOT NULL;

ALTER TABLE public.configuracao_global 
  ALTER COLUMN meta_arrecadada_mes SET DEFAULT 0.00;

-- 2. Adicionar restrição check para impedir valores negativos (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_meta_arrecadada_positiva'
  ) THEN
    ALTER TABLE public.configuracao_global 
      ADD CONSTRAINT check_meta_arrecadada_positiva CHECK (meta_arrecadada_mes >= 0);
  END IF;
END $$;

-- 3. Coluna de auditoria updated_at
ALTER TABLE public.configuracao_global 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================================================
-- PARTE B: SEED / BACKFILL INICIAL (IDEMPOTENTE)
-- =============================================================================

INSERT INTO public.configuracao_global (id, meta_arrecadada_mes, updated_at)
VALUES (1, 0.00, NOW())
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PARTE C: HABILITAÇÃO DE PERMISSÕES E POLÍTICAS DE RLS
-- =============================================================================

-- 1. Habilitação de RLS e concessão restrita de privilégios (apenas SELECT e UPDATE)
ALTER TABLE public.configuracao_global ENABLE ROW LEVEL SECURITY;

GRANT SELECT, UPDATE ON public.configuracao_global TO authenticated;

-- 2. Idempotência: Remoção prévia de policies existentes
DROP POLICY IF EXISTS "configuracao_global_select_authenticated" ON public.configuracao_global;
DROP POLICY IF EXISTS "configuracao_global_update_admin" ON public.configuracao_global;

-- 3. Leitura (SELECT): Todos os usuários autenticados podem visualizar a meta e arrecadação
CREATE POLICY "configuracao_global_select_authenticated"
ON public.configuracao_global
FOR SELECT
TO authenticated
USING (true);

-- 4. Atualização (UPDATE): Apenas Administrador Geral pode alterar o valor da meta arrecadada
CREATE POLICY "configuracao_global_update_admin"
ON public.configuracao_global
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
