-- =============================================================================
-- Migration: Adiciona a coluna termos_aceitos_em para auditoria de LGPD
--
-- Contexto e Regras de Negócio:
-- 1. Conformidade LGPD:
--    - Armazena o timestamp exato em que o usuário aceitou os Termos de Uso e
--      a Política de Privacidade da plataforma Prumo.
-- 2. Segurança em Nível de Coluna (Column-Level Security):
--    - Concede permissão de UPDATE na coluna termos_aceitos_em para a role
--      authenticated, permitindo que a finalização do onboarding registre o
--      aceite legal sem expor colunas sensíveis (role, email, turma_id).
-- 3. Regularização Retroativa (Backfill):
--    - Usuários existentes que já concluíram o onboarding (onboarding_concluido = true)
--      recebem o timestamp atual caso termos_aceitos_em seja NULL.
-- =============================================================================

-- 1. Adicionar coluna auditável de consentimento LGPD
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS termos_aceitos_em TIMESTAMPTZ DEFAULT NULL;

-- 2. Conceder permissão de atualização para usuários autenticados (Column-Level Security)
GRANT UPDATE (termos_aceitos_em) ON public.usuarios TO authenticated;

-- 3. Regularização retroativa dos usuários com onboarding já concluído
UPDATE public.usuarios 
SET termos_aceitos_em = NOW() 
WHERE onboarding_concluido = true 
  AND termos_aceitos_em IS NULL;
