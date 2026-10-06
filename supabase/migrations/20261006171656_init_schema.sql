-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CUSTOM TYPES (ENUMS)
CREATE TYPE user_role AS ENUM ('ALUNO', 'LIDER', 'ADMIN');
CREATE TYPE turno_type AS ENUM ('Manhã', 'Tarde', 'Noite');
CREATE TYPE ano_type AS ENUM ('1º', '2º', '3º');
CREATE TYPE pedido_status AS ENUM ('pendente', 'aprovado', 'rejeitado');
CREATE TYPE evento_categoria AS ENUM ('Prova', 'Trabalho', 'Tarefa', 'Aviso');
CREATE TYPE aviso_remetente AS ENUM ('Diretoria ETEC', 'Coordenação', 'Administração da Plataforma');
CREATE TYPE aviso_badge AS ENUM ('Urgente', 'Informativo', 'Evento');

-- 3. TABLES

-- turmas
CREATE TABLE turmas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_oficial VARCHAR(255) NOT NULL,
    codigo_convite VARCHAR(6) NOT NULL UNIQUE,
    ano ano_type NOT NULL,
    curso VARCHAR(255) NOT NULL,
    turno turno_type NOT NULL,
    local_sala VARCHAR(255),
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role DEFAULT 'ALUNO',
    turma_id UUID REFERENCES turmas(id) ON DELETE SET NULL,
    data_entrada_turma TIMESTAMPTZ
);

-- pedidos_turma
CREATE TABLE pedidos_turma (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    ano ano_type NOT NULL,
    curso VARCHAR(255) NOT NULL,
    turno turno_type NOT NULL,
    local_sala VARCHAR(255),
    justificativa TEXT,
    status pedido_status DEFAULT 'pendente'
);
-- Anti-spam Index (Apenas 1 pedido pendente por usuário)
CREATE UNIQUE INDEX idx_unique_pedido_pendente 
ON pedidos_turma (usuario_id) 
WHERE status = 'pendente';

-- eventos
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    materia VARCHAR(255) NOT NULL,
    categoria evento_categoria NOT NULL,
    data_hora_limite TIMESTAMPTZ NOT NULL,
    descricao TEXT,
    anexo_url TEXT,
    criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- links_uteis
CREATE TABLE links_uteis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    url_link TEXT NOT NULL,
    criado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- avisos_gerais
CREATE TABLE avisos_gerais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    remetente aviso_remetente NOT NULL,
    badge_destaque aviso_badge NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    data_postagem TIMESTAMPTZ DEFAULT NOW()
);

-- configuracao_global
CREATE TABLE configuracao_global (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    meta_arrecadada_mes NUMERIC(10,2) DEFAULT 0.00
);

-- 4. TRIGGERS (Sincronização com Supabase Auth)

-- Trigger: Inserir usuário na tabela pública ao se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, nome, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'ALUNO' -- Cargo inicial padrão
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger: Atualizar e-mail na tabela pública se alterado no Auth
CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
  IF new.email <> old.email THEN
    UPDATE public.usuarios SET email = new.email WHERE id = new.id;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_email_update();


-- 5. RPC (Stored Procedure) para Aprovar Pedido de Turma
CREATE OR REPLACE FUNCTION aprovar_pedido_turma(
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
    -- 1. Busca os dados do pedido
    SELECT usuario_id, ano, curso, turno, local_sala, status 
    INTO v_usuario_id, v_ano, v_curso, v_turno, v_local_sala, v_status
    FROM pedidos_turma 
    WHERE id = p_pedido_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pedido não encontrado.';
    END IF;

    IF v_status <> 'pendente' THEN
        RAISE EXCEPTION 'Apenas pedidos pendentes podem ser aprovados.';
    END IF;

    -- 2. Cria a nova Turma
    INSERT INTO turmas (nome_oficial, codigo_convite, ano, curso, turno, local_sala)
    VALUES (p_nome_oficial, p_codigo_convite, v_ano, v_curso, v_turno, v_local_sala)
    RETURNING id INTO v_turma_id;

    -- 3. Atualiza o usuário para LIDER e vincula à turma
    UPDATE usuarios 
    SET role = 'LIDER', 
        turma_id = v_turma_id,
        data_entrada_turma = NOW()
    WHERE id = v_usuario_id;

    -- 4. Exclui o pedido
    DELETE FROM pedidos_turma WHERE id = p_pedido_id;

    -- Retorna o ID da nova turma
    RETURN v_turma_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
