-- =============================================================================
-- Migration: Stored Procedures para Moderação de Membros da Turma (Fase 2)
--
-- Procedures Criadas:
-- 1. public.promover_membro_lider(p_membro_id UUID)
-- 2. public.rebaixar_lider_membro(p_membro_id UUID)
-- 3. public.expulsar_membro_turma(p_membro_id UUID)
--
-- Regras de Segurança:
-- - Execução com SECURITY DEFINER e SET search_path = public.
-- - Apenas usuários autenticados possuem privilégios de execução.
-- - Validação de escopo: Apenas ADMIN ou LIDER da mesma turma podem moderar.
-- - Bloqueio de auto-ação (não é permitido rebaixar ou expulsar a si mesmo).
-- - Regra Anti-Orfandade: A turma não pode ficar com 0 líderes.
-- =============================================================================

-- 1. PROCEDURE: Promover Membro a Líder
CREATE OR REPLACE FUNCTION public.promover_membro_lider(
    p_membro_id UUID
) RETURNS VOID AS $$
DECLARE
    v_chamador_id UUID;
    v_chamador_role user_role;
    v_chamador_turma_id UUID;
    v_alvo_role user_role;
    v_alvo_turma_id UUID;
BEGIN
    v_chamador_id := auth.uid();
    IF v_chamador_id IS NULL THEN
        RAISE EXCEPTION 'AUTH_UNAUTHORIZED: Usuário não autenticado.' USING ERRCODE = '42501';
    END IF;

    -- Busca e trava os dados do membro alvo
    SELECT role, turma_id INTO v_alvo_role, v_alvo_turma_id
    FROM public.usuarios WHERE id = p_membro_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'USER_NOT_FOUND: Membro não encontrado.' USING ERRCODE = 'P0002';
    END IF;

    IF v_alvo_turma_id IS NULL THEN
        RAISE EXCEPTION 'USER_WITHOUT_CLASS: O membro não pertence a nenhuma turma.' USING ERRCODE = '22000';
    END IF;

    -- Validação de Autorização (ADMIN geral ou LIDER da mesma turma)
    IF NOT public.is_admin() THEN
        SELECT role, turma_id INTO v_chamador_role, v_chamador_turma_id
        FROM public.usuarios WHERE id = v_chamador_id;

        IF v_chamador_role <> 'LIDER' OR v_chamador_turma_id <> v_alvo_turma_id THEN
            RAISE EXCEPTION 'FORBIDDEN: Apenas líderes da turma ou administradores podem promover membros.' USING ERRCODE = '42501';
        END IF;
    END IF;

    IF v_alvo_role = 'LIDER' THEN
        RAISE EXCEPTION 'ALREADY_LEADER: O usuário já é um líder desta turma.' USING ERRCODE = '22000';
    END IF;

    IF v_alvo_role = 'ADMIN' THEN
        RAISE EXCEPTION 'CANNOT_ALTER_ADMIN: Administradores gerais não podem ser alterados para líder de turma.' USING ERRCODE = '22000';
    END IF;

    -- Efetua a promoção
    UPDATE public.usuarios SET role = 'LIDER' WHERE id = p_membro_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.promover_membro_lider(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.promover_membro_lider(UUID) TO authenticated;


-- 2. PROCEDURE: Rebaixar Líder a Aluno
CREATE OR REPLACE FUNCTION public.rebaixar_lider_membro(
    p_membro_id UUID
) RETURNS VOID AS $$
DECLARE
    v_chamador_id UUID;
    v_chamador_role user_role;
    v_chamador_turma_id UUID;
    v_alvo_role user_role;
    v_alvo_turma_id UUID;
    v_qtd_lideres INT;
BEGIN
    v_chamador_id := auth.uid();
    IF v_chamador_id IS NULL THEN
        RAISE EXCEPTION 'AUTH_UNAUTHORIZED: Usuário não autenticado.' USING ERRCODE = '42501';
    END IF;

    IF p_membro_id = v_chamador_id THEN
        RAISE EXCEPTION 'CANNOT_DEMOTE_SELF: Você não pode rebaixar a si mesmo pelo painel de moderação.' USING ERRCODE = '22000';
    END IF;

    -- Busca e trava os dados do membro alvo
    SELECT role, turma_id INTO v_alvo_role, v_alvo_turma_id
    FROM public.usuarios WHERE id = p_membro_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'USER_NOT_FOUND: Membro não encontrado.' USING ERRCODE = 'P0002';
    END IF;

    IF v_alvo_role <> 'LIDER' THEN
        RAISE EXCEPTION 'NOT_A_LEADER: O usuário não possui o cargo de líder.' USING ERRCODE = '22000';
    END IF;

    -- Validação de Autorização
    IF NOT public.is_admin() THEN
        SELECT role, turma_id INTO v_chamador_role, v_chamador_turma_id
        FROM public.usuarios WHERE id = v_chamador_id;

        IF v_chamador_role <> 'LIDER' OR v_chamador_turma_id <> v_alvo_turma_id THEN
            RAISE EXCEPTION 'FORBIDDEN: Apenas líderes da turma ou administradores podem rebaixar líderes.' USING ERRCODE = '42501';
        END IF;
    END IF;

    -- Regra Crítica Anti-Orfandade: Não permitir rebaixamento se for o único líder da turma
    SELECT COUNT(*) INTO v_qtd_lideres
    FROM public.usuarios
    WHERE turma_id = v_alvo_turma_id AND role = 'LIDER';

    IF v_qtd_lideres <= 1 THEN
        RAISE EXCEPTION 'LAST_LEADER_CANNOT_BE_DEMOTED: A turma precisa possuir pelo menos um líder ativo. Promova outro membro antes de rebaixar este líder.'
            USING ERRCODE = '23514'; -- check_violation
    END IF;

    -- Efetua o rebaixamento
    UPDATE public.usuarios SET role = 'ALUNO' WHERE id = p_membro_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.rebaixar_lider_membro(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rebaixar_lider_membro(UUID) TO authenticated;


-- 3. PROCEDURE: Expulsar Membro da Turma
CREATE OR REPLACE FUNCTION public.expulsar_membro_turma(
    p_membro_id UUID
) RETURNS VOID AS $$
DECLARE
    v_chamador_id UUID;
    v_chamador_role user_role;
    v_chamador_turma_id UUID;
    v_alvo_role user_role;
    v_alvo_turma_id UUID;
    v_qtd_lideres INT;
BEGIN
    v_chamador_id := auth.uid();
    IF v_chamador_id IS NULL THEN
        RAISE EXCEPTION 'AUTH_UNAUTHORIZED: Usuário não autenticado.' USING ERRCODE = '42501';
    END IF;

    IF p_membro_id = v_chamador_id THEN
        RAISE EXCEPTION 'CANNOT_EXPEL_SELF: Você não pode expulsar a si mesmo pelo painel de moderação.' USING ERRCODE = '22000';
    END IF;

    -- Busca e trava os dados do membro alvo
    SELECT role, turma_id INTO v_alvo_role, v_alvo_turma_id
    FROM public.usuarios WHERE id = p_membro_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'USER_NOT_FOUND: Membro não encontrado.' USING ERRCODE = 'P0002';
    END IF;

    IF v_alvo_turma_id IS NULL THEN
        RAISE EXCEPTION 'USER_ALREADY_WITHOUT_CLASS: O usuário já não pertence a nenhuma turma.' USING ERRCODE = '22000';
    END IF;

    -- Validação de Autorização
    IF NOT public.is_admin() THEN
        SELECT role, turma_id INTO v_chamador_role, v_chamador_turma_id
        FROM public.usuarios WHERE id = v_chamador_id;

        IF v_chamador_role <> 'LIDER' OR v_chamador_turma_id <> v_alvo_turma_id THEN
            RAISE EXCEPTION 'FORBIDDEN: Apenas líderes da turma ou administradores podem expulsar membros.' USING ERRCODE = '42501';
        END IF;
    END IF;

    IF v_alvo_role = 'ADMIN' AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'FORBIDDEN: Administradores gerais não podem ser expulsos de turmas por líderes.' USING ERRCODE = '42501';
    END IF;

    -- Regra Crítica Anti-Orfandade: Se o alvo for Líder, deve haver mais de 1 líder na turma
    IF v_alvo_role = 'LIDER' THEN
        SELECT COUNT(*) INTO v_qtd_lideres
        FROM public.usuarios
        WHERE turma_id = v_alvo_turma_id AND role = 'LIDER';

        IF v_qtd_lideres <= 1 THEN
            RAISE EXCEPTION 'LAST_LEADER_CANNOT_BE_EXPELLED: O último líder não pode ser expulso da turma. Promova outro membro a líder antes de desvinculá-lo.'
                USING ERRCODE = '23514';
        END IF;
    END IF;

    -- Efetua a desvinculação (reseta role para ALUNO se for líder, preservando ADMIN se for admin)
    UPDATE public.usuarios
    SET turma_id = NULL,
        data_entrada_turma = NULL,
        role = CASE WHEN role = 'ADMIN' THEN 'ADMIN'::user_role ELSE 'ALUNO'::user_role END
    WHERE id = p_membro_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.expulsar_membro_turma(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expulsar_membro_turma(UUID) TO authenticated;
