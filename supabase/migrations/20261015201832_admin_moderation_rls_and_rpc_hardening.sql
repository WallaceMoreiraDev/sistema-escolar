-- =============================================================================
-- Migration: Função helper is_admin, RLS de leitura para Admin e Blindagem de RPC
--
-- Regras de Negócio (Etapa 2 - Fluxo de Turmas / Moderação pelo Admin):
-- 1. Helper is_admin(): Executa com SECURITY DEFINER e STABLE para consultar o
--    role do usuário em public.usuarios sem disparar recursão infinita no RLS.
-- 2. RLS SELECT em usuarios: Permite que ADMIN visualize todos os perfis (necessário
--    para listar o aluno solicitante da turma no painel de moderação).
-- 3. RLS SELECT em turmas: Permite que ADMIN visualize todas as turmas cadastradas.
-- 4. Blindagem de aprovar_pedido_turma: Valida se auth.uid() é ADMIN antes de
--    executar mutações, revoga EXECUTE de PUBLIC/anon e define search_path seguro.
-- =============================================================================

-- 1. FUNÇÃO HELPER: is_admin() (Anti-recursão de RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.usuarios 
    WHERE id = (SELECT auth.uid()) 
      AND role = 'ADMIN'
  );
$$;

-- Restringe execução de is_admin() a usuários autenticados
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2. POLÍTICA DE LEITURA (SELECT) EM usuarios PARA ADMIN
CREATE POLICY "usuarios_select_admin"
ON public.usuarios
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. POLÍTICA DE LEITURA (SELECT) EM turmas PARA ADMIN
CREATE POLICY "turmas_select_admin"
ON public.turmas
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 4. BLINDAGEM DA PROCEDURE aprovar_pedido_turma
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

    -- 4. Promove o usuário a LIDER e vincula-o à nova turma
    UPDATE public.usuarios 
    SET role = 'LIDER', 
        turma_id = v_turma_id,
        data_entrada_turma = NOW()
    WHERE id = v_usuario_id;

    -- 5. Exclui o pedido de turma da fila
    DELETE FROM public.pedidos_turma WHERE id = p_pedido_id;

    -- Retorna o ID da turma criada
    RETURN v_turma_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoga privilégios públicos e anônimos de execução na procedure
REVOKE EXECUTE ON FUNCTION public.aprovar_pedido_turma(UUID, VARCHAR, VARCHAR) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.aprovar_pedido_turma(UUID, VARCHAR, VARCHAR) TO authenticated;
