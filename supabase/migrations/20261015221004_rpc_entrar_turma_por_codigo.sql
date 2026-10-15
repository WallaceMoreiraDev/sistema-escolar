-- =============================================================================
-- Migration: Procedure transacional entrar_turma_por_codigo (Etapa 3 - Fluxo de Turmas)
--
-- Regras de Negócio:
-- 1. Aluno sem turma insere código de convite de 6 caracteres.
-- 2. Valida se o usuário está autenticado e se o código é válido.
-- 3. Verifica se a turma existe na tabela turmas.
-- 4. Valida se o aluno já possui sala (bloqueia se já tiver turma).
-- 5. Associa turma_id e data_entrada_turma = NOW() em public.usuarios com SECURITY DEFINER
--    (necessário pois a tabela usuarios tem permissões de UPDATE restritas para authenticated).
-- 6. Limpa eventuais solicitações antigas de criação de turma com status 'pendente' do aluno.
-- 7. Retorna JSONB com turma_id e nome_oficial da sala vinculada.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.entrar_turma_por_codigo(
    p_codigo_convite VARCHAR
) RETURNS JSONB AS $$
DECLARE
    v_usuario_id UUID;
    v_codigo_limpo VARCHAR(6);
    v_turma_id UUID;
    v_nome_oficial VARCHAR(255);
    v_turma_atual_id UUID;
BEGIN
    -- 1. Identifica o usuário autenticado da sessão JWT
    v_usuario_id := auth.uid();
    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'AUTH_UNAUTHORIZED: Usuário não autenticado.'
            USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;

    -- 2. Normaliza e valida o formato do código de convite (6 caracteres alfanuméricos)
    v_codigo_limpo := UPPER(TRIM(p_codigo_convite));
    IF v_codigo_limpo IS NULL OR LENGTH(v_codigo_limpo) <> 6 THEN
        RAISE EXCEPTION 'INVALID_CODE_FORMAT: O código de convite deve possuir exatamente 6 caracteres.'
            USING ERRCODE = '22000'; -- data_exception
    END IF;

    -- 3. Busca a turma pelo código de convite
    SELECT id, nome_oficial 
    INTO v_turma_id, v_nome_oficial
    FROM public.turmas
    WHERE UPPER(codigo_convite) = v_codigo_limpo;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'TURMA_NOT_FOUND: Código de convite inválido ou turma inexistente.'
            USING ERRCODE = 'P0002'; -- no_data_found
    END IF;

    -- 4. Verifica o perfil do aluno e trava a linha para concorrência
    SELECT turma_id 
    INTO v_turma_atual_id
    FROM public.usuarios
    WHERE id = v_usuario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'USER_NOT_FOUND: Perfil do usuário não encontrado na base.'
            USING ERRCODE = 'P0002';
    END IF;

    -- Bloqueia caso o aluno já possua turma
    IF v_turma_atual_id IS NOT NULL THEN
        IF v_turma_atual_id = v_turma_id THEN
            RAISE EXCEPTION 'ALREADY_IN_THIS_TURMA: Você já faz parte desta turma.'
                USING ERRCODE = '23505'; -- unique_violation
        ELSE
            RAISE EXCEPTION 'ALREADY_IN_ANOTHER_TURMA: Você já está vinculado a outra turma. Saia da turma atual antes de entrar em uma nova.'
                USING ERRCODE = '23505';
        END IF;
    END IF;

    -- 5. Vincula o aluno à turma
    UPDATE public.usuarios
    SET turma_id = v_turma_id,
        data_entrada_turma = NOW()
    WHERE id = v_usuario_id;

    -- 6. Limpa eventuais pedidos pendentes antigos do aluno na fila de moderação
    DELETE FROM public.pedidos_turma
    WHERE usuario_id = v_usuario_id 
      AND status = 'pendente';

    -- 7. Retorna os dados da turma para consumo do BFF / Frontend
    RETURN jsonb_build_object(
        'turma_id', v_turma_id,
        'nome_oficial', v_nome_oficial
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoga execução pública e anônima; concede apenas a usuários autenticados
REVOKE EXECUTE ON FUNCTION public.entrar_turma_por_codigo(VARCHAR) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.entrar_turma_por_codigo(VARCHAR) TO authenticated;
