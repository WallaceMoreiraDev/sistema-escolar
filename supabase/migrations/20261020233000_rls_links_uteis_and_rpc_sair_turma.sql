-- =============================================================================
-- Migration: RLS e Índices de links_uteis e RPC sair_da_turma
--
-- Contexto e Regras de Negócio:
-- 1. Tabela links_uteis:
--    - Define DEFAULT auth.uid() na coluna criado_por (integridade e auditoria).
--    - Concede permissões SELECT, INSERT, DELETE para authenticated.
--    - Cria índice B-Tree composto (turma_id, created_at DESC) para acelerar listagens.
--    - Políticas RLS:
--      * SELECT: Membros da turma (via get_my_turma_id()) ou ADMIN geral.
--      * INSERT: Apenas LIDER da turma ou ADMIN geral, com criado_por = auth.uid().
--      * DELETE: Apenas LIDER da turma ou ADMIN geral.
-- 2. Stored Procedure sair_da_turma():
--    - Desvinculação voluntária e atômica do usuário autenticado.
--    - Trava anti-orfandade: se for LIDER (ou ADMIN vinculado à turma) e houver
--      outros membros na turma (total_membros > 1), impede a saída caso seja
--      o único líder ativo (qtd_lideres <= 1).
--    - Reseta turma_id = NULL, data_entrada_turma = NULL e rebaixa role de LIDER
--      para ALUNO (preservando ADMIN).
-- =============================================================================

-- =============================================================================
-- PARTE A: AJUSTES, ÍNDICES E POLÍTICAS EM public.links_uteis
-- =============================================================================

-- 1. Integridade de autoria (default para auth.uid())
ALTER TABLE public.links_uteis 
  ALTER COLUMN criado_por SET DEFAULT auth.uid();

-- 2. Índice composto de performance para listagem de links da turma
CREATE INDEX IF NOT EXISTS idx_links_uteis_turma_created_at 
ON public.links_uteis (turma_id, created_at DESC);

-- 3. Habilitação de RLS e concessão de privilégios estritos
ALTER TABLE public.links_uteis ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, DELETE ON public.links_uteis TO authenticated;

-- 4. Idempotência: Remoção de policies pré-existentes
DROP POLICY IF EXISTS "links_uteis_select_membro_ou_admin" ON public.links_uteis;
DROP POLICY IF EXISTS "links_uteis_insert_lider_ou_admin" ON public.links_uteis;
DROP POLICY IF EXISTS "links_uteis_delete_lider_ou_admin" ON public.links_uteis;

-- SELECT (Leitura): Alunos/Líderes da respectiva turma ou Administrador Geral
CREATE POLICY "links_uteis_select_membro_ou_admin"
ON public.links_uteis
FOR SELECT
TO authenticated
USING (
    turma_id = public.get_my_turma_id()
    OR public.is_admin()
);

-- INSERT (Criação): Líder da respectiva turma ou Administrador Geral, garantindo autoria
CREATE POLICY "links_uteis_insert_lider_ou_admin"
ON public.links_uteis
FOR INSERT
TO authenticated
WITH CHECK (
    criado_por = (SELECT auth.uid())
    AND (
        (turma_id = public.get_my_turma_id() AND public.is_lider())
        OR public.is_admin()
    )
);

-- DELETE (Exclusão): Líder da respectiva turma ou Administrador Geral
CREATE POLICY "links_uteis_delete_lider_ou_admin"
ON public.links_uteis
FOR DELETE
TO authenticated
USING (
    (turma_id = public.get_my_turma_id() AND public.is_lider())
    OR public.is_admin()
);


-- =============================================================================
-- PARTE B: STORED PROCEDURE (RPC) public.sair_da_turma()
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

    -- Trava a turma para garantir consistência e evitar race conditions na contagem de lideranças
    PERFORM 1 FROM public.turmas WHERE id = v_turma_id FOR UPDATE;

    -- 3. Regra Crítica Anti-Orfandade
    -- Se o usuário for LIDER ou ADMIN vinculado à turma
    IF v_usuario_role IN ('LIDER', 'ADMIN') THEN
        -- Conta quantos membros totais a turma possui
        SELECT COUNT(*) INTO v_total_membros
        FROM public.usuarios
        WHERE turma_id = v_turma_id;

        -- Se houver outros membros além dele na turma
        IF v_total_membros > 1 THEN
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

    -- 4. Efetua a desvinculação (reseta turma_id e data_entrada_turma, rebaixando LIDER para ALUNO e preservando ADMIN)
    UPDATE public.usuarios
    SET turma_id = NULL,
        data_entrada_turma = NULL,
        role = CASE WHEN role = 'ADMIN' THEN 'ADMIN'::user_role ELSE 'ALUNO'::user_role END
    WHERE id = v_usuario_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Restringe execução exclusivamente para usuários autenticados
REVOKE EXECUTE ON FUNCTION public.sair_da_turma() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.sair_da_turma() TO authenticated;
