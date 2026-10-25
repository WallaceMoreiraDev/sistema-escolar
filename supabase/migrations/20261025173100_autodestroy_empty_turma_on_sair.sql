-- =============================================================================
-- Migration: Auto-Destruição de Turma Abandonada na RPC sair_da_turma
--
-- Contexto e Regras de Negócio:
-- 1. Diagnóstico:
--    - Anteriormente, quando o último ou único membro de uma turma (total_membros = 1)
--      saía da sala, ele era desvinculado, mas a turma permanecia registrada no banco
--      com 0 membros e 0 líderes (turma fantasma), mantendo seu código de convite ativo.
-- 2. Solução Implementada:
--    - Se existirem outros membros na turma (total_membros > 1):
--      * Valida regra anti-orfandade: se for LIDER ou ADMIN e for a única liderança
--        ativa (qtd_lideres <= 1), bloqueia a saída com erro 23514 (LAST_LEADER_CANNOT_LEAVE).
--      * Caso contrário, desvincula o membro normalmente.
--    - Se o usuário for o ÚNICO membro restante na sala (total_membros <= 1):
--      * Desvincula o usuário (turma_id = NULL, data_entrada_turma = NULL, role resetado
--        para ALUNO, preservando ADMIN).
--      * Auto-destrói a turma executando DELETE FROM public.turmas WHERE id = v_turma_id,
--        acionando a trigger de integridade e removendo eventos e links via CASCADE.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sair_da_turma()
RETURNS VOID AS $$
DECLARE
    v_usuario_id UUID;
    v_usuario_role user_role;
    v_turma_id UUID;
    v_total_membros INT;
    v_qtd_lideres INT;
BEGIN
    -- 1. Identificar o chamador autenticado
    v_usuario_id := auth.uid();
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'AUTH_UNAUTHORIZED: Usuário não autenticado.' USING ERRCODE = '42501';
    END IF;

    -- 2. Buscar e travar os dados do usuário chamador
    SELECT role, turma_id INTO v_usuario_role, v_turma_id
    FROM public.usuarios 
    WHERE id = v_usuario_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'USER_NOT_FOUND: Usuário não encontrado.' USING ERRCODE = 'P0002';
    END IF;

    IF v_turma_id IS NULL THEN
        RAISE EXCEPTION 'USER_ALREADY_WITHOUT_CLASS: Você já não pertence a nenhuma turma.' USING ERRCODE = '22000';
    END IF;

    -- Trava a turma para garantir consistência e evitar race conditions
    PERFORM 1 FROM public.turmas WHERE id = v_turma_id FOR UPDATE;

    -- 3. Contar quantos membros totais a turma possui
    SELECT COUNT(*) INTO v_total_membros
    FROM public.usuarios
    WHERE turma_id = v_turma_id;

    -- Cenário A: Existem outros membros na sala (v_total_membros > 1)
    -- Valida regra anti-orfandade para lideranças
    IF v_total_membros > 1 THEN
        IF v_usuario_role IN ('LIDER', 'ADMIN') THEN
            -- Conta quantas lideranças ativas (LIDER ou ADMIN) existem na turma
            SELECT COUNT(*) INTO v_qtd_lideres
            FROM public.usuarios
            WHERE turma_id = v_turma_id AND role IN ('LIDER', 'ADMIN');

            IF v_qtd_lideres <= 1 THEN
                RAISE EXCEPTION 'LAST_LEADER_CANNOT_LEAVE: Você é o único líder da turma. Promova outro membro a líder antes de sair da turma.'
                    USING ERRCODE = '23514';
            END IF;
        END IF;
    END IF;

    -- 4. Efetua a desvinculação do usuário (reseta turma_id e data_entrada_turma, rebaixando LIDER para ALUNO e preservando ADMIN)
    UPDATE public.usuarios
    SET turma_id = NULL,
        data_entrada_turma = NULL,
        role = CASE WHEN role = 'ADMIN' THEN 'ADMIN'::user_role ELSE 'ALUNO'::user_role END
    WHERE id = v_usuario_id;

    -- Cenário B: O usuário era o ÚNICO membro restante na sala (v_total_membros <= 1)
    -- Auto-destrói a turma abandonada para não deixar turmas fantasmas no sistema
    IF v_total_membros <= 1 THEN
        DELETE FROM public.turmas WHERE id = v_turma_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Restringe execução exclusivamente para usuários autenticados
REVOKE EXECUTE ON FUNCTION public.sair_da_turma() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sair_da_turma() TO authenticated;
