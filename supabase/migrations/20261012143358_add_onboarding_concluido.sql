-- =============================================================================
-- Migration: Adiciona a flag onboarding_concluido e atualiza permissões de update
--
-- Motivação: Desacoplar o status de onboarding da comparação frágil de strings
-- no frontend (user.nome === emailPrefix), suportando logins sociais (Google)
-- e eliminando riscos de loops infinitos em nomes que coincidem com o prefixo.
-- =============================================================================

-- 1. Adiciona a coluna booleana explícita
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS onboarding_concluido BOOLEAN NOT NULL DEFAULT false;

-- 2. Atualiza a permissão de UPDATE para usuários autenticados
-- Permite que o onboarding atualize o nome E marque a flag como concluída,
-- mantendo colunas sensíveis (role, email, turma_id) estritamente protegidas.
GRANT UPDATE (nome, onboarding_concluido) ON public.usuarios TO authenticated;
