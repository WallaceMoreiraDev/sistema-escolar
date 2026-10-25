# 🔧 Diretrizes de Negócio e Domínio (Backend)

> **AVISO:** Este arquivo contém as regras de negócio Específicas ("Leis Locais") para as funcionalidades do Backend do Prumo. Ele atua como complemento ao `GEMINI.md` da raiz do projeto, que dita as leis de arquitetura globais.

---

## 1. Diretrizes da Rota de Eventos (Calendário e Dashboard)
- **Limite de Busca (Scalability Constraint):** O limite matemático máximo de busca exigido na validação do Zod entre `start_date` e `end_date` deve ser cravado em **45 dias**.
- **Payload Integral:** O backend deve retornar OBRIGATORIAMENTE a descrição completa do evento nos endpoints de listagem, independentemente do local que os chamou. A lógica de truncagem visual ou resumo de texto é responsabilidade exclusiva do Frontend.

---

## 2. Diretrizes do Mural Geral de Avisos (`avisos_gerais`)
- **Controle de Acesso (RBAC):** Mutações (criação via `POST /api/avisos`, edição via `PUT /api/avisos/:id` e exclusão via `DELETE /api/avisos/:id`) são de acesso restrito e exclusivo para usuários com perfil `role = 'ADMIN'`. A leitura (`GET /api/avisos` e `GET /api/avisos/:id`) é liberada para qualquer usuário autenticado.
- **Paginação no Banco (Scalability Constraint):** A listagem de avisos gerais é fixada em **5 avisos por página**, paginada no banco via `.range()` no Supabase com contagem exata (`count: 'exact'`) e ordenada por `data_postagem DESC`.
- **Contratos e DTO:** O backend deve expor estritamente os campos em `camelCase` (`titulo`, `mensagem`, `remetente`, `badgeDestaque`, `dataPostagem`) através do `NoticeDTO`, isolando as entidades cruas do banco.

---

## 3. Diretrizes do Fluxo de Turmas - Etapa 1: Solicitação pelo Aluno (`pedidos_turma`)
- **Regra de Unicidade e Anti-Spam (409):** O aluno só pode ter no máximo **1 solicitação pendente** por vez. Tentativas duplicadas disparam `HTTP 409 CONFLICT` com código tipado `CLASS_REQUEST_DUPLICATE`.
- **Prevenção de Vínculo Duplo (400):** Alunos que já possuem turma vinculada (`turma_id IS NOT NULL`) não podem enviar solicitações de criação de turma, disparando `HTTP 400 BAD_REQUEST` com código tipado `ALREADY_IN_CLASS`.
- **Cancelamento Autônomo:** O aluno pode cancelar sua solicitação enquanto ela estiver com status `pendente` (`DELETE /api/turmas/pedidos/meu`). Caso não exista solicitação ativa, a rota dispara `HTTP 404 NOT_FOUND`.
- **Contratos e DTO:** A solicitação é representada pelo `ClassRequestDTO` com campos em `camelCase` (`id`, `usuarioId`, `ano`, `turno`, `curso`, `localSala`, `justificativa`, `status`, `createdAt`).

---

## 4. Diretrizes do Fluxo de Turmas - Etapa 2: Moderação e Aprovação pelo Administrador Geral (`/api/admin/pedidos-turma`)
- **Controle de Acesso Estrito (RBAC):** Todas as rotas de moderação (`/api/admin/pedidos-turma/*`) são de uso exclusivo do Administrador Geral. Protegidas com `authMiddleware` e `requireRole(['ADMIN'])`, retornando `HTTP 403 AUTH_FORBIDDEN` para qualquer outro perfil.
- **Listagem e Paginação FIFO:** `GET /api/admin/pedidos-turma` lista solicitações em aberto (`status = 'pendente'`) em ordem cronológica de chegada (`created_at ASC` / FIFO), acompanhadas dos dados do solicitante (`solicitante: { id, nome, email }`) via join com a tabela `usuarios`. A listagem é paginada no banco com limite cravado de **5 itens por página** (`count: 'exact'`).
- **Geração de Código de Convite:** O backend gera automaticamente um código único de 6 caracteres alfanuméricos em caixa alta (alfabeto legível sem ambiguidade: `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`), validando unicidade contra a coluna `turmas.codigo_convite`. Caso o administrador informe um código manual via payload, este é validado e aplicado se não houver colisão (disparando `HTTP 409 INVITE_CODE_ALREADY_EXISTS` em caso de duplicidade).
- **Nome Oficial Padrão:** Se o administrador não fornecer `nomeOficial` na aprovação, o backend compõe automaticamente o padrão: `"${ano} ${curso} - ${turno}"` (ex: `"3º Desenvolvimento de Sistemas - Manhã"`).
- **Transação ACID via Stored Procedure:** A aprovação (`POST /api/admin/pedidos-turma/:id/aprovar`) invoca a procedure `aprovar_pedido_turma` no Postgres, que cria a nova turma, promove o aluno a `role = 'LIDER'`, vincula o `turma_id` e remove o pedido de forma totalmente atômica.
- **Rejeição de Pedido:** `DELETE /api/admin/pedidos-turma/:id` remove o registro da solicitação da tabela `pedidos_turma`, liberando o perfil do aluno para novas tentativas.

---

## 5. Diretrizes do Fluxo de Turmas - Etapa 3: Entrada na Turma via Código de Convite (`POST /api/turmas/entrar`)
- **Controle de Acesso:** A rota é liberada para qualquer usuário autenticado (`authMiddleware`). Usuários sem turma podem se vincular informando um código de convite válido de 6 caracteres.
- **Validação de Input (Zod):** O payload exige `codigoConvite` no padrão exato de 6 caracteres alfanuméricos (`/^[A-Za-z0-9]{6}$/`), transformados e normalizados em caixa alta.
- **Transação ACID via Stored Procedure (`entrar_turma_por_codigo`):** O backend invoca a procedure PostgreSQL, que executa com `SECURITY DEFINER`: valida se a turma existe pelo código, trava a linha do usuário com `FOR UPDATE`, vincula `turma_id`, define `data_entrada_turma = NOW()` e limpa automaticamente eventuais pedidos pendentes em `pedidos_turma`.
- **Tratamento de Exceções e Respostas:**
  - Código inexistente/inválido: `HTTP 404 NOT_FOUND` com mensagem amigável ("Código de turma inválido ou inexistente.").
  - Usuário já vinculado a uma turma: `HTTP 400 ALREADY_IN_CLASS` com mensagem amigável ("Você já está vinculado a uma turma.").
  - Formato inválido: `HTTP 400 VALIDATION_ERROR` ("O código de convite deve possuir exatamente 6 caracteres.").
  - Sucesso: `HTTP 200 OK` com envelope `{ success: true, data: { turmaId: string, nomeOficial: string } }`.

---

## 6. Diretrizes do Fluxo de Turmas - Gestão de Membros: Fase 1 (Listagem de Colegas de Sala: `GET /api/turmas/membros`)
- **Regra de Acesso e Pertencimento:** O usuário autenticado deve obrigatoriamente pertencer a uma turma (`turma_id IS NOT NULL`). Caso não esteja vinculado a nenhuma sala, a requisição é rejeitada com `HTTP 400 BAD_REQUEST` ("Você não está vinculado a nenhuma turma.").
- **RLS e Defense in Depth:** A leitura no banco é protegida pela policy `usuarios_select_mesma_turma` e filtrada no repositório por `turma_id`, garantindo que alunos só visualizem colegas de sua própria sala.
- **Paginação e Ordenação no Banco:** Paginação fixada em **5 membros por página** com `.range(from, to)` e `{ count: 'exact' }`. Ordenação estrita no Postgres priorizando Líderes (`role DESC`) e desempatando em ordem alfabética (`nome ASC`).
- **Contratos e DTO:** Exposição dos dados através de `ClassMemberDTO` em `camelCase` (`id`, `nome`, `email`, `role`, `dataEntradaTurma`).

---

## 7. Diretrizes do Fluxo de Turmas - Gestão de Membros: Fase 2 (Moderação e Poderes do Líder)
- **Controle de Acesso em Camadas (Defense in Depth):**
  - Rotas de moderação sob `/api/turmas/membros`:
    - `PATCH /api/turmas/membros/:id/promover` (Promover a Líder)
    - `PATCH /api/turmas/membros/:id/rebaixar` (Rebaixar a Aluno)
    - `DELETE /api/turmas/membros/:id` (Expulsar Aluno da Turma)
  - **Middleware como Primeiro Guarda-Costas:** Protegidas por `authMiddleware` e `requireRole(['LIDER', 'ADMIN'])`. Alunos comuns são barrados com `HTTP 403 AUTH_FORBIDDEN`.
  - **Validação de Escopo e Transações no Banco:** Execução exclusiva via Postgres Stored Procedures (`promover_membro_lider`, `rebaixar_lider_membro`, `expulsar_membro_turma`), que garantem:
    - O moderador chamador deve ser Líder da MESMA turma do membro alvo (ou Admin geral). Caso tente moderar membro de outra turma, dispara `HTTP 403 AUTH_FORBIDDEN`.
- **Validação de Parâmetros (Zod):** O parâmetro `:id` é rigorosamente validado via `classMemberIdParamSchema` como formato UUID válido, rejeitando IDs maliciosos ou inválidos com `HTTP 400 VALIDATION_ERROR`.
- **Regras Críticas de Integridade & Tratamento de Erros:**
  - **Bloqueio de Auto-Ação (Self-Action Guard):** É expressamente proibido ao usuário rebaixar ou expulsar a si mesmo pelo painel de moderação. Dispara `HTTP 400 BAD_REQUEST` com código tipado `CANNOT_MODIFY_SELF` ("Você não pode realizar esta ação consigo mesmo pelo painel de moderação.").
  - **Regra Anti-Orfandade (Orphan Prevention):** A turma nunca pode ficar desprovida de liderança ativa. Ao tentar rebaixar ou expulsar o único líder restante da turma, a operação é rejeitada com `HTTP 409 CONFLICT` e código tipado `LAST_LEADER_CONFLICT` ("A turma não pode ficar sem nenhum líder. Promova outro membro antes.").
  - **Membro Inexistente ou Desvinculado:** Se o membro não for encontrado no banco ou não pertencer a nenhuma turma, dispara `HTTP 404 NOT_FOUND` ("Membro não encontrado ou não pertence a esta turma.").

---

## 8. Diretrizes do Fluxo de Turmas - Links Úteis e Desvinculação Voluntária
- **Links Úteis da Turma (`/api/turmas/links`):**
  - **Controle de Acesso em Camadas (Defense in Depth):**
    - `GET /api/turmas/links`: Leitura liberada para qualquer membro autenticado da respectiva turma ou Administrador Geral. Protegida por RLS (`links_uteis_select_membro_ou_admin`).
    - `POST /api/turmas/links` e `DELETE /api/turmas/links/:id`: Mutações de acesso restrito exclusivo para `LIDER` da turma ou `ADMIN` geral via `requireRole(['LIDER', 'ADMIN'])` e RLS (`links_uteis_insert_lider_ou_admin` e `links_uteis_delete_lider_ou_admin`).
  - **Performance e Ordenação:** A busca é acelerada pelo índice composto `idx_links_uteis_turma_created_at` (`turma_id, created_at DESC`), retornando os links ordenados do mais recente para o mais antigo.
  - **Validação Estrita (Zod):**
    - Payload de criação validado com `createLinkSchema` (`titulo`: min 2, max 100 caracteres; `urlLink`: URL válida, max 500 caracteres).
    - Parâmetro `:id` de exclusão validado como UUID estrito (`linkIdParamSchema`).
  - **Contratos e DTO:** Mapeamento obrigatório para `LinkDTO` em `camelCase` (`id`, `turmaId`, `titulo`, `urlLink`, `criadoPor`, `createdAt`).
- **Desvinculação Voluntária da Turma (`POST /api/turmas/sair`):**
  - **Permissão e Autonomia:** Qualquer usuário autenticado pertencente a uma turma (`ALUNO`, `LIDER`, `ADMIN`) pode solicitar sua própria saída voluntária.
  - **Transação ACID via Stored Procedure (`sair_da_turma`):**
    - A desvinculação ocorre com `SECURITY DEFINER` e trava `FOR UPDATE` para consistência e prevenção de race conditions.
    - **Regra Crítica Anti-Orfandade:** Se o usuário for o único líder restante na turma (`qtd_lideres <= 1`) e ainda houver outros alunos na sala (`total_membros > 1`), a operação é bloqueada com `HTTP 400 BAD_REQUEST` e código tipado `LAST_LEADER_CANNOT_LEAVE` ("Você é o único líder da turma. Promova outro membro a líder antes de sair da turma.").
    - Se o usuário não estiver em nenhuma turma, rejeita com `HTTP 400 BAD_REQUEST` e código tipado `USER_ALREADY_WITHOUT_CLASS`.
    - Ao sair, reseta `turma_id = NULL`, `data_entrada_turma = NULL` e rebaixa `LIDER` para `ALUNO` (preservando `ADMIN`).

---

## 9. Diretrizes de Financiamento Coletivo e Meta Global (`/api/financiamento`)
- **Controle de Acesso em Camadas (Defense in Depth):**
  - `GET /api/financiamento`: Leitura pública para todos os usuários autenticados (`ALUNO`, `LIDER`, `ADMIN`), protegida por RLS (`configuracao_global_select_authenticated`). Permite a exibição da meta e arrecadação no Dashboard de alunos e líderes.
  - `PUT /api/financiamento`: Atualização de acesso estrito e exclusivo para Administradores Gerais (`ADMIN`), protegida por `requireRole(['ADMIN'])` e RLS (`configuracao_global_update_admin`). Alunos e líderes recebem `HTTP 403 AUTH_FORBIDDEN`.
- **Integridade e Modelo Singleton:**
  - A tabela `public.configuracao_global` possui um único registro persistente (`id = 1`). Mutações operam exclusivamente sobre este ID.
  - A coluna `meta_arrecadada_mes` possui restrição check (`meta_arrecadada_mes >= 0`), impedindo valores negativos no banco.
  - A coluna de auditoria `updated_at` é atualizada automaticamente a cada mutação (`NOW()`).
- **Validação de Input (Zod):**
  - Payload validado por `updateFundingSchema`:
    - `metaArrecadadaMes`: número obrigatório, não negativo (`min(0)`), com teto de segurança (`max(100000)`).
- **Contratos e DTO:** Exposição dos dados via `FundingDTO` em `camelCase` (`metaArrecadadaMes`, `updatedAt`).

---

## 10. Gestão e Exclusão de Turmas Ativas no Admin (`/api/admin/turmas`) e Modo God
- **Controle de Acesso em Camadas:**
  - Todas as rotas sob `/api/admin/turmas` são estritamente restritas a Administradores Gerais (`ADMIN`), protegidas por `authMiddleware`, `requireRole(['ADMIN'])` e políticas de RLS (`turmas_delete_admin` para exclusões).
- **Listagem e Consulta Cadastral de Turmas Ativas:**
  - `GET /api/admin/turmas`: Listagem paginada (padrão 5 itens/página, configurável até 50 via query `page` e `limit`), com ordenação cronológica decrescente (`data_criacao DESC`) acelerada pelo índice `idx_turmas_data_criacao`. Inclui a contagem de membros ativos matriculados (`usuarios(count)`) otimizada pelo índice parcial `idx_usuarios_turma_id`.
  - `GET /api/admin/turmas/:id`: Consulta os detalhes cadastrais e a contagem de membros de uma turma específica pelo UUID. Dispara `AppError('CLASS_NOT_FOUND', 404)` se inexistente.
- **Exclusão/Destruição de Turma Ativa (`DELETE /api/admin/turmas/:id`):**
  - Aciona a procedure RPC transacional PostgreSQL `public.excluir_turma(p_turma_id)`.
  - **Trigger de Integridade Pré-Exclusão (`handle_turma_delete`):** Dispara `BEFORE DELETE` na tabela `turmas`, desvinculando automaticamente todos os membros matriculados (`turma_id = NULL`, `data_entrada_turma = NULL`) e rebaixando membros com papel `LIDER` para `ALUNO` (preservando `ADMIN`), prevenindo orfandade ou inconsistência de líderes sem sala.
  - **Fail-Fast:** Se a turma não for encontrada, a procedure levanta exceção com código `P0002` / `CLASS_NOT_FOUND`, traduzida para `HTTP 404 NOT_FOUND` com código tipado `CLASS_NOT_FOUND`.
- **Modo God na Gestão de Membros (`GET /api/turmas/membros`):**
  - Administradores Gerais (`ADMIN`) podem inspecionar membros de qualquer turma informando o parâmetro opcional `turmaId` na query string (`/api/turmas/membros?turmaId=<UUID>`). Alunos e líderes continuam restritos à própria turma vinculada.
- **Contratos e DTOs Compartilhados:**
  - `ActiveClassDTO`: `id`, `nomeOficial`, `codigoConvite`, `ano`, `curso`, `turno`, `localSala`, `dataCriacao`, `activeMembers` (com aliases de conveniência `name`, `shift`, `createdAt`).

