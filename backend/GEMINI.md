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
