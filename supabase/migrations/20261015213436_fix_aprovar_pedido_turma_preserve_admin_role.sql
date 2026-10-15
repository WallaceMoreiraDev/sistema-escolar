-- =============================================================================
-- Migration: Preserva o role ADMIN ao aprovar pedido de turma na RPC aprovar_pedido_turma
--
-- Problema: A versão anterior executava SET role = 'LIDER' incondicionalmente.
-- Caso o solicitante do pedido fosse um usuário com role = 'ADMIN' (ex: admin criando
-- turma de teste ou representante que já é admin), ele sofria rebaixamento (demotion)
-- perdendo o privilégio de Administrador Geral do sistema.
--
-- Solução: Preservar o cargo caso já seja ADMIN e promover para LIDER caso contrário:
-- SET role = CASE WHEN role = 'ADMIN' THEN 'ADMIN'::user_role ELSE 'LIDER'::user_role END
-- =============================================================================

CREATE OR REPLACE FUNCTION public.aprovar_pedido_turma(
    p_pedido_id UUID,
    p_nome_oficial VARCHAR(255),
    p_codigo_convite VARCHAR(6)
) RETURNS UUID AS $$
DECLARE
    v_turma_id UUID;
    v_usuario_id UUID;
    v_ano ano_type;
    v_curso VARCHAR;
    v_turno turno_type;
    v_local_sala VARCHAR;
    v_status pedido_status;
BEGIN
    -- 1. Barreira de Segurança Fail-Fast: Apenas ADMIN pode invocar esta procedure
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores podem aprovar pedidos de turma.'
            USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;

    -- 2. Busca e trava os dados do pedido para garantir concorrência
    SELECT usuario_id, ano, curso, turno, local_sala, status 
    INTO v_usuario_id, v_ano, v_curso, v_turno, v_local_sala, v_status
    FROM public.pedidos_turma 
    WHERE id = p_pedido_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido não encontrado.';
    END IF;

    IF v_status <> 'pendente' THEN
        RAISE EXCEPTION 'Apenas pedidos pendentes podem ser aprovados.';
    END IF;

    -- 3. Cria a nova Turma
    INSERT INTO public.turmas (nome_oficial, codigo_convite, ano, curso, turno, local_sala)
    VALUES (p_nome_oficial, p_codigo_convite, v_ano, v_curso, v_turno, v_local_sala)
    RETURNING id INTO v_turma_id;

    -- 4. Promove o usuário a LIDER preservando cargo caso o usuário já seja ADMIN
    UPDATE public.usuarios 
    SET role = CASE WHEN role = 'ADMIN' THEN 'ADMIN'::user_role ELSE 'LIDER'::user_role END, 
        turma_id = v_turma_id,
        data_entrada_turma = NOW()
    WHERE id = v_usuario_id;

    -- 5. Exclui o pedido de turma da fila
    DELETE FROM public.pedidos_turma WHERE id = p_pedido_id;

    -- Retorna o ID da turma criada
    RETURN v_turma_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Garante revogação de privilégios públicos e permissão para authenticated
REVOKE EXECUTE ON FUNCTION public.aprovar_pedido_turma(UUID, VARCHAR, VARCHAR) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aprovar_pedido_turma(UUID, VARCHAR, VARCHAR) TO authenticated;
