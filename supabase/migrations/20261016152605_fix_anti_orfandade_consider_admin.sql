-- =============================================================================
-- Migration: Correção da Regra Anti-Orfandade em rebaixar_lider_membro e expulsar_membro_turma
--
-- Motivação:
-- Na contagem de lideranças ativas de uma turma para impedir que ela fique órfã,
-- a consulta anterior filtrava estritamente por role = 'LIDER'.
-- Quando um Administrador Geral (role = 'ADMIN') pertence à turma e atua como
-- sua autoridade, a contagem ignorava sua presença, bloqueando o rebaixamento ou
-- expulsão de líderes mesmo quando a turma permanecia amparada pelo Admin.
--
-- Correção:
-- Atualizar a contagem para considerar tanto líderes quanto administradores
-- vinculados àquela turma: WHERE turma_id = v_alvo_turma_id AND role IN ('LIDER', 'ADMIN').
-- Mantém intactas todas as demais proteções de autorização, bloqueio de auto-ação e privilégios.
-- =============================================================================

-- 1. PROCEDURE: Rebaixar Líder a Aluno (com regra anti-orfandade considerando ADMIN)
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

    -- Validação de Autorização (ADMIN geral ou LIDER da mesma turma)
    IF NOT public.is_admin() THEN
        SELECT role, turma_id INTO v_chamador_role, v_chamador_turma_id
        FROM public.usuarios WHERE id = v_chamador_id;

        IF v_chamador_role <> 'LIDER' OR v_chamador_turma_id <> v_alvo_turma_id THEN
            RAISE EXCEPTION 'FORBIDDEN: Apenas líderes da turma ou administradores podem rebaixar líderes.' USING ERRCODE = '42501';
        END IF;
    END IF;

    -- Regra Crítica Anti-Orfandade: Considera tanto LIDER quanto ADMIN vinculados à turma
    SELECT COUNT(*) INTO v_qtd_lideres
    FROM public.usuarios
    WHERE turma_id = v_alvo_turma_id AND role IN ('LIDER', 'ADMIN');

    IF v_qtd_lideres <= 1 THEN
        RAISE EXCEPTION 'LAST_LEADER_CANNOT_BE_DEMOTED: A turma precisa possuir pelo menos um líder ou administrador ativo. Promova outro membro antes de rebaixar este líder.'
            USING ERRCODE = '23514'; -- check_violation
    END IF;

    -- Efetua o rebaixamento
    UPDATE public.usuarios SET role = 'ALUNO' WHERE id = p_membro_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.rebaixar_lider_membro(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rebaixar_lider_membro(UUID) TO authenticated;


-- 2. PROCEDURE: Expulsar Membro da Turma (com regra anti-orfandade considerando ADMIN)
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

    -- Validação de Autorização (ADMIN geral ou LIDER da mesma turma)
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

    -- Regra Crítica Anti-Orfandade: Se o alvo for Líder, deve haver mais de 1 liderança (LIDER ou ADMIN) na turma
    IF v_alvo_role = 'LIDER' THEN
        SELECT COUNT(*) INTO v_qtd_lideres
        FROM public.usuarios
        WHERE turma_id = v_alvo_turma_id AND role IN ('LIDER', 'ADMIN');

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
