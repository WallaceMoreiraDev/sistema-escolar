-- =============================================================================
-- Migration: Hardening de Segurança, Concorrência, Integridade e Índices de Performance
--
-- Blocos Implementados:
-- 1. Trava Anti-Race Condition na Moderação de Liderança (rebaixar_lider_membro e expulsar_membro_turma).
-- 2. Blindagem e Resiliência dos Triggers de Auth (handle_new_user e handle_user_email_update).
-- 3. Proteção de Colunas em Eventos (CLS) e Imutabilidade de Anexos Físicos.
-- 4. Imutabilidade e Auditoria de Consentimento da LGPD via Trigger.
-- 5. Fila de Limpeza do Storage (storage_deletion_queue) e Auto-Expurgo Aprimorado.
-- 6. Índices de Alta Performance e Indexação de Chaves Estrangeiras para o Free Tier.
-- 7. Padronização das Policies de Avisos Gerais com public.is_admin().
-- =============================================================================

-- =============================================================================
-- BLOCO 1: TRAVA ANTI-RACE CONDITION NA MODERAÇÃO DE LIDERANÇA
-- =============================================================================

-- 1.1 Procedure: Rebaixar Líder a Aluno
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

    -- Trava a turma para serializar a contagem de lideranças e impedir race conditions
    PERFORM 1 FROM public.turmas WHERE id = v_alvo_turma_id FOR UPDATE;

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


-- 1.2 Procedure: Expulsar Membro da Turma
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

    -- Trava a turma para serializar a contagem de lideranças e impedir race conditions
    PERFORM 1 FROM public.turmas WHERE id = v_alvo_turma_id FOR UPDATE;

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


-- =============================================================================
-- BLOCO 2: BLINDAGEM E RESILIÊNCIA DOS TRIGGERS DE AUTH
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, role)
  VALUES (
    new.id,
    COALESCE(
      NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(new.raw_user_meta_data->>'name'), ''),
      NULLIF(split_part(new.email, '@', 1), ''),
      'Aluno'
    ),
    COALESCE(new.email, new.id::text || '@auth.local'),
    'ALUNO'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
  IF new.email IS DISTINCT FROM old.email THEN
    UPDATE public.usuarios SET email = new.email WHERE id = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- =============================================================================
-- BLOCO 3: PROTEÇÃO DE COLUNAS EM EVENTOS E IMUTABILIDADE DE ANEXOS
-- =============================================================================

-- 3.1 Imutabilidade de anexos físicos (anexos são criados ou deletados, nunca editados)
REVOKE UPDATE ON public.eventos_anexos FROM anon, authenticated;
DROP POLICY IF EXISTS "eventos_anexos_update_lider_ou_admin" ON public.eventos_anexos;

-- 3.2 Column-Level Security (CLS) em eventos: protege colunas de auditoria (id, turma_id, criado_por, created_at)
REVOKE UPDATE ON public.eventos FROM anon, authenticated;
GRANT UPDATE (materia, categoria, data_hora_limite, descricao, anexo_url, links) 
ON public.eventos TO authenticated;


-- =============================================================================
-- BLOCO 4: IMUTABILIDADE DO CONSENTIMENTO LGPD
-- =============================================================================

CREATE OR REPLACE FUNCTION public.trg_garantir_termos_lgpd_imutavel()
RETURNS TRIGGER AS $$
BEGIN
  -- Impede revogação para NULL ou alteração de timestamp pré-existente
  IF OLD.termos_aceitos_em IS NOT NULL AND NEW.termos_aceitos_em IS DISTINCT FROM OLD.termos_aceitos_em THEN
    RAISE EXCEPTION 'LGPD_TERMS_IMMUTABLE: O registro de consentimento dos termos não pode ser revogado ou modificado.'
      USING ERRCODE = '23514';
  END IF;

  -- Impede gravação de datas no futuro
  IF NEW.termos_aceitos_em IS NOT NULL AND NEW.termos_aceitos_em > NOW() THEN
    RAISE EXCEPTION 'LGPD_TERMS_FUTURE_DATE: O timestamp do consentimento não pode estar no futuro.'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS on_usuarios_termos_lgpd_protect ON public.usuarios;
CREATE TRIGGER on_usuarios_termos_lgpd_protect
  BEFORE UPDATE OF termos_aceitos_em ON public.usuarios
  FOR EACH ROW EXECUTE PROCEDURE public.trg_garantir_termos_lgpd_imutavel();


-- =============================================================================
-- BLOCO 5: FILA DE LIMPEZA DO STORAGE (ANTI-ARQUIVOS ÓRFÃOS)
-- =============================================================================

-- 5.1 Tabela de fila de caminhos de arquivos a serem deletados fisicamente do Storage
CREATE TABLE IF NOT EXISTS public.storage_deletion_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.storage_deletion_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "storage_deletion_queue_admin" ON public.storage_deletion_queue;
CREATE POLICY "storage_deletion_queue_admin"
ON public.storage_deletion_queue
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

GRANT ALL ON public.storage_deletion_queue TO service_role;
GRANT SELECT, DELETE ON public.storage_deletion_queue TO authenticated;

-- 5.2 Trigger para alimentar a fila automaticamente antes de qualquer DELETE de anexo
CREATE OR REPLACE FUNCTION public.enqueue_deleted_attachment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.storage_deletion_queue (storage_path)
  VALUES (OLD.storage_path);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_enqueue_deleted_attachment ON public.eventos_anexos;
CREATE TRIGGER trg_enqueue_deleted_attachment
  BEFORE DELETE ON public.eventos_anexos
  FOR EACH ROW EXECUTE PROCEDURE public.enqueue_deleted_attachment();

-- 5.3 Atualização da RPC de auto-expurgo para drenar tanto arquivos expirados quanto órfãos acumulados
CREATE OR REPLACE FUNCTION public.expurgar_anexos_antigos_eventos()
RETURNS TABLE (
    storage_path TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Validação de segurança: apenas ADMIN geral ou service_role podem executar o expurgo
    IF NOT public.is_admin() AND COALESCE(auth.role(), '') <> 'service_role' THEN
        RAISE EXCEPTION 'FORBIDDEN: Apenas administradores gerais ou serviços de manutenção podem executar o expurgo de anexos.'
            USING ERRCODE = '42501';
    END IF;

    -- 1. Exclui os anexos físicos cujas atividades expiraram há mais de 7 dias
    -- O trigger trg_enqueue_deleted_attachment enfileirará automaticamente os storage_path na fila
    DELETE FROM public.eventos_anexos ea
    WHERE ea.evento_id IN (
        SELECT e.id FROM public.eventos e
        WHERE e.data_hora_limite < (NOW() - INTERVAL '7 days')
    );

    -- 2. Drena e retorna todos os storage_path acumulados na fila de deleção (sem duplicatas)
    RETURN QUERY
    WITH drenados AS (
        DELETE FROM public.storage_deletion_queue
        RETURNING storage_deletion_queue.storage_path
    )
    SELECT DISTINCT d.storage_path FROM drenados d;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.expurgar_anexos_antigos_eventos() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.expurgar_anexos_antigos_eventos() TO authenticated, service_role;


-- =============================================================================
-- BLOCO 6: ÍNDICES DE ALTA PERFORMANCE
-- =============================================================================

-- Feed institucional (Mural Geral)
CREATE INDEX IF NOT EXISTS idx_avisos_gerais_data_postagem 
ON public.avisos_gerais (data_postagem DESC);

-- Fila FIFO de moderação de solicitações de turmas
CREATE INDEX IF NOT EXISTS idx_pedidos_turma_status_created_at 
ON public.pedidos_turma (status, created_at ASC);

-- Busca temporal de eventos para expurgo global
CREATE INDEX IF NOT EXISTS idx_eventos_data_hora_limite 
ON public.eventos (data_hora_limite);

-- Busca case-insensitive ultra-rápida de código de convite
CREATE UNIQUE INDEX IF NOT EXISTS idx_turmas_codigo_convite_upper 
ON public.turmas (UPPER(codigo_convite));

-- Foreign keys indexadas para exclusões de usuários eficientes sem table locks
CREATE INDEX IF NOT EXISTS idx_eventos_criado_por 
ON public.eventos (criado_por) 
WHERE criado_por IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_links_uteis_criado_por 
ON public.links_uteis (criado_por) 
WHERE criado_por IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_eventos_anexos_criado_por 
ON public.eventos_anexos (criado_por) 
WHERE criado_por IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_turma_usuario_id 
ON public.pedidos_turma (usuario_id);

-- Otimização de listagem e ordenação de membros da turma
CREATE INDEX IF NOT EXISTS idx_usuarios_turma_role_nome 
ON public.usuarios (turma_id, role DESC, nome ASC) 
WHERE turma_id IS NOT NULL;


-- =============================================================================
-- BLOCO 7: PADRONIZAÇÃO DAS POLICIES DE AVISOS GERAIS
-- =============================================================================

DROP POLICY IF EXISTS "avisos_gerais_insert_admin" ON public.avisos_gerais;
CREATE POLICY "avisos_gerais_insert_admin"
ON public.avisos_gerais FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "avisos_gerais_update_admin" ON public.avisos_gerais;
CREATE POLICY "avisos_gerais_update_admin"
ON public.avisos_gerais FOR UPDATE TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "avisos_gerais_delete_admin" ON public.avisos_gerais;
CREATE POLICY "avisos_gerais_delete_admin"
ON public.avisos_gerais FOR DELETE TO authenticated
USING (public.is_admin());
