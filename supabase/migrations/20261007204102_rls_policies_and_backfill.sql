-- =============================================================================
-- Migration: RLS (versionado), policies mínimas de auth/onboarding e backfill
--
-- Contexto: o RLS foi habilitado manualmente pelo Dashboard após a migration
-- inicial, sem nenhuma policy, o que bloqueia toda leitura/escrita via JWT.
-- Esta migration versiona o RLS e cria somente as policies necessárias para
-- GET /me e PATCH de onboarding. As demais tabelas permanecem com deny-by-default
-- até que suas respectivas features criem as policies.
-- =============================================================================

-- 1. RLS EM TODAS AS TABELAS (idempotente; versiona o que foi feito no painel)
ALTER TABLE public.usuarios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_turma       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links_uteis         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avisos_gerais       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracao_global ENABLE ROW LEVEL SECURITY;

-- 2. POLICIES: usuarios
-- O usuário lê apenas o próprio perfil.
CREATE POLICY "usuarios_select_proprio_perfil"
ON public.usuarios
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

-- O usuário atualiza apenas o próprio perfil (onboarding).
CREATE POLICY "usuarios_update_proprio_perfil"
ON public.usuarios
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- 3. PROTEÇÃO CONTRA ESCALONAMENTO DE PRIVILÉGIO (CRÍTICO)
-- A policy de UPDATE acima filtra LINHAS, não COLUNAS. Como a anon key é pública,
-- sem esta restrição qualquer usuário poderia executar um UPDATE direto via
-- PostgREST alterando o próprio `role` para 'ADMIN' ou o próprio `turma_id`.
-- Restringimos o UPDATE de `authenticated` exclusivamente à coluna `nome`.
REVOKE UPDATE ON public.usuarios FROM anon, authenticated;
GRANT UPDATE (nome) ON public.usuarios TO authenticated;

-- 4. POLICIES: turmas
-- Membro lê apenas a turma à qual está vinculado (necessário ao join do /me).
-- A subquery em `usuarios` é resolvida pela policy de SELECT acima
-- (sem recursão, pois a policy de usuarios não referencia turmas).
CREATE POLICY "turmas_select_membro"
ON public.turmas
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT u.turma_id
        FROM public.usuarios u
        WHERE u.id = (SELECT auth.uid())
    )
);

-- 5. BACKFILL: usuários já existentes em auth.users sem perfil em public.usuarios
-- (contas criadas antes da trigger on_auth_user_created). Idempotente: re-execuções
-- e conflitos (id/email únicos) são ignorados.
INSERT INTO public.usuarios (id, nome, email, role)
SELECT
    au.id,
    COALESCE(
        NULLIF(au.raw_user_meta_data->>'full_name', ''),
        NULLIF(au.raw_user_meta_data->>'name', ''),
        split_part(au.email, '@', 1)
    ),
    au.email,
    'ALUNO'
FROM auth.users au
WHERE au.email IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.usuarios u WHERE u.id = au.id)
ON CONFLICT DO NOTHING;
