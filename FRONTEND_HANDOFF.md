# 🤝 Integração Frontend-Backend (Handoff)

> Este documento serve como ponte de comunicação oficial entre o time de Backend (IA/Dev) e o time de Frontend (IA/Dev). Todas as ações que o Frontend precisar tomar devido a alterações de API, banco ou regras de negócio devem ser registradas aqui em formato estrito de checklist.

## 🟢 Concluído: Anexos no Supabase Storage, Links Externos de Atividades e Auto-Expurgo (/api/turmas/eventos)

**Data/Contexto:** Endpoints da API REST para suporte a até 2 links externos em atividades (`links`), upload e download de múltiplos anexos físicos no Supabase Storage (`/api/turmas/eventos/:id/anexos`) com cota cumulativa de 5 MB, e rotina de auto-expurgo de 7 dias (`POST /api/admin/manutencao/expurgar-anexos`).

### 1. Endpoints Disponíveis:

1. **Listar e Criar Eventos com Links e Anexos:** `GET /api/turmas/eventos` e `POST /api/turmas/eventos`
   - O `EventDTO` agora retorna automaticamente os campos:
     - `links: EventLinkDTO[]`: Array de até 2 links externos (`{ titulo: string; url: string }`).
     - `anexos: EventAttachmentDTO[]`: Array de anexos físicos vinculados à atividade.
   - Cada item (`EventAttachmentDTO`) possui:
     - `id: string` (UUID)
     - `eventoId: string` (UUID)
     - `turmaId: string` (UUID)
     - `nomeArquivo: string`
     - `storagePath: string`
     - `tamanhoBytes: number`
     - `mimeType: string`
     - `createdAt: string` (ISO 8601 UTC)
   - Na criação (`POST`) e atualização (`PUT`), envie `links: [{ titulo: "...", url: "..." }]` (máx. 2).

2. **Consultar Evento Individual por ID:** `GET /api/turmas/eventos/:id`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Membro da mesma turma (`ALUNO`, `LIDER`) ou Administrador Geral (`ADMIN`).
   - Parâmetro `:id`: UUID válido da atividade/evento.
   - Retorno de Sucesso: `HTTP 200 OK` com `ApiResponse<EventDTO>`.
   - Erros da API:
     - `404 NOT_FOUND` com `code: "NOT_FOUND"`: Evento não encontrado.
     - `403 FORBIDDEN` com `code: "FORBIDDEN"`: Usuário não pertence à turma do evento.

3. **Upload de Anexo Físico:** `POST /api/turmas/eventos/:id/anexos`
   - Content-Type: `multipart/form-data`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Apenas `LIDER` da turma ou Administrador Geral (`ADMIN`).
   - Parâmetro `:id`: UUID da atividade/evento.
   - Body: Form-data com o arquivo no campo `file` (ou `anexo`).
   - Validações:
     - MIME Types permitidos: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`.
     - Tamanho máximo por arquivo: 5 MB (`5.242.880 bytes`).
     - Cota cumulativa por atividade: A soma dos bytes de todos os anexos já existentes + novo arquivo não pode exceder 5 MB. Caso ultrapasse, retorna `400 BAD_REQUEST` com `code: "ATTACHMENT_LIMIT_EXCEEDED"`.
   - Retorno de Sucesso: `HTTP 201 CREATED`
     ```typescript
     {
       success: true,
       data: EventAttachmentDTO
     }
     ```

3. **Excluir Anexo Individual:** `DELETE /api/turmas/eventos/:id/anexos/:anexoId`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Apenas `LIDER` da turma ou Administrador Geral (`ADMIN`).
   - Parâmetros: `:id` (UUID do evento) e `:anexoId` (UUID do anexo).
   - Retorno de Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: {
         message: "Anexo excluído com sucesso."
       }
     }
     ```

4. **Obter URL Segura para Download / Visualização:** `GET /api/turmas/eventos/:id/anexos/:anexoId/download`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Qualquer membro matriculado na turma (`ALUNO`, `LIDER`) ou Administrador Geral (`ADMIN`).
   - Retorno de Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: {
         downloadUrl: string // URL assinada temporária (validade de 1 hora)
       }
     }
     ```

5. **Manutenção - Auto-Expurgo de Anexos Expirados:** `POST /api/admin/manutencao/expurgar-anexos`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Restrito a Administrador Geral (`ADMIN`).
   - Retorno de Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: {
         message: string,
         expurgatedCount: number
       }
     }
     ```

---

### Ações Exigidas para o Frontend:

- [x] **Adoção dos Contratos e Schemas (@shared):**
  - [x] Importar `EventLinkDTO`, `EventAttachmentDTO`, `EventDTO` de `@shared/types`:
    ```typescript
    import { EventDTO, EventLinkDTO, EventAttachmentDTO } from '@shared/types';
    ```
  - [x] Importar `eventLinkSchema`, `attachmentParamSchema` de `@shared/schemas/eventSchema`:
    ```typescript
    import { eventLinkSchema, attachmentParamSchema } from '@shared/schemas/eventSchema';
    ```

- [x] **Integração no Formulário de Eventos / Atividades (`EventForm.tsx`):**
  - [x] Adicionar suporte a inclusão/remoção dinâmica de até 2 links externos com campos de título e URL.
  - [x] Substituir o upload legado ou integrar o novo fluxo de anexos físicos via multipart (`POST /api/turmas/eventos/:id/anexos`).
  - [x] Exibir barra ou indicador visual de cota de armazenamento consumida pelo evento (ex: "X MB de 5 MB utilizados").
  - [x] Tratar erro `ATTACHMENT_LIMIT_EXCEEDED` alertando o usuário de forma amigável quando a cota cumulativa for atingida.

- [x] **Visualização de Atividades e Ações de Anexos (`EventList.tsx`, `EventDetailsModal`):**
  - [x] Renderizar links externos com botão/ícone para abrir em nova aba (`target="_blank" rel="noopener noreferrer"`).
  - [x] Listar anexos com nome do arquivo, tamanho formatado (KB/MB) e botões de ação:
    - [x] Ação de download/visualização: Consumir `GET /api/turmas/eventos/:id/anexos/:anexoId/download` e abrir o `downloadUrl`.
    - [x] Ação de exclusão (visível apenas para Líder e Admin): Consumir `DELETE /api/turmas/eventos/:id/anexos/:anexoId` com modal customizado de confirmação.

---

## 🟢 Concluído: Gestão e Exclusão de Turmas Ativas no Admin (/api/admin/turmas) e Modo God


**Data/Contexto:** Endpoints da API REST para listagem paginada e exclusão de turmas ativas pelo Administrador Geral (`/api/admin/turmas`), além de suporte a inspeção de membros via `turmaId` na listagem de membros (`/api/turmas/membros`) para o Modo God.

### 1. Endpoints Disponíveis:

1. **Listar Turmas Ativas:** `GET /api/admin/turmas`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Restrito a Administradores Gerais (`ADMIN`).
   - Query Params:
     - `page`: número inteiro `>= 1` (default: `1`).
     - `limit`: número inteiro entre `1` e `50` (default: `5`).
   - Retorno de Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: ActiveClassDTO[], // Array de turmas ativas ordenadas por dataCriacao DESC
       meta: {
         pagination: {
           page: number,
           limit: number,
           total: number,
           totalPages: number
         }
       }
     }
     ```
   - Cada item (`ActiveClassDTO`) possui:
     - `id: string` (UUID)
     - `nomeOficial: string`
     - `codigoConvite: string`
     - `ano: "1º" | "2º" | "3º"`
     - `curso: string`
     - `turno: "Manhã" | "Tarde" | "Noite" | "Integral"`
     - `localSala: string | null`
     - `dataCriacao: string` (ISO 8601 UTC)
     - `activeMembers: number` (contagem de membros matriculados na sala)
     - *(Campos de conveniência/compatibilidade: `name?: string; shift?: TurnoTurma; createdAt?: string;`)*

2. **Detalhes da Turma Ativa:** `GET /api/admin/turmas/:id`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Restrito a Administradores Gerais (`ADMIN`).
   - Parâmetro `:id`: UUID válido da turma.
   - Retorno de Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: ActiveClassDTO
     }
     ```
   - Erros da API:
     - `404 NOT_FOUND` com `code: "CLASS_NOT_FOUND"`: Turma não encontrada.

3. **Excluir/Destruir Turma Ativa:** `DELETE /api/admin/turmas/:id`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Restrito a Administradores Gerais (`ADMIN`).
   - Parâmetro `:id`: UUID válido da turma.
   - Comportamento no Banco: Aciona a procedure `excluir_turma` com a trigger `handle_turma_delete` disparando `BEFORE DELETE`. Todos os membros matriculados na sala são desvinculados (`turma_id = NULL`, `data_entrada_turma = NULL`) e membros com papel `LIDER` são automaticamente rebaixados para `ALUNO` (preservando `ADMIN`).
   - Retorno de Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: {
         message: "Turma destruída com sucesso."
       }
     }
     ```
   - Erros da API:
     - `404 NOT_FOUND` com `code: "CLASS_NOT_FOUND"`: Turma inexistente.
     - `403 FORBIDDEN` com `code: "AUTH_FORBIDDEN"`: Usuário não é administrador geral.

4. **Modo God na Listagem de Membros:** `GET /api/turmas/membros?turmaId=<uuid>&page=<n>`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Para alunos e líderes, a listagem continua retornando os membros de sua própria turma vinculada. Para Administradores Gerais (`ADMIN`), a rota agora aceita o parâmetro opcional `turmaId` na query string, permitindo inspecionar qualquer turma sem precisar estar matriculado nela.
   - Retorno de Sucesso: `HTTP 200 OK` com `{ success: true, data: ClassMemberDTO[], meta: { pagination } }`.

---

### Ações Exigidas para o Frontend:

- [x] **Adoção dos Contratos e Schemas (@shared):**
  - [x] Importar `ActiveClassDTO`, `ApiResponse` de `@shared/types`:
    ```typescript
    import { ApiResponse, ActiveClassDTO } from '@shared/types';
    ```
  - [x] Importar `adminActiveClassesPaginationQuerySchema`, `classIdParamSchema` de `@shared/schemas/classSchema`:
    ```typescript
    import { adminActiveClassesPaginationQuerySchema, classIdParamSchema } from '@shared/schemas/classSchema';
    ```

- [x] **Integração do Hook `useActiveClasses.ts` (`frontend/src/features/system-admin/hooks/useActiveClasses.ts`):**
  - [x] Substituir o mock em memória por chamadas reais via TanStack Query:
    - [x] `useActiveClasses(page: number)`: Consumir `GET /api/admin/turmas?page=${page}&limit=5` retornando as turmas ativas e metadados de paginação.
    - [x] `useDeleteClass()`: Consumir `DELETE /api/admin/turmas/${id}`. Ao obter sucesso, invalidar as queries `['admin-active-classes']` para re-renderizar a listagem e disparar feedback amigável ao usuário.

- [x] **Conexão da Tela de Turmas Ativas (`ActiveClassesPage.tsx`):**
  - [x] Conectar a tabela/grid de turmas ativas ao hook `useActiveClasses`, exibindo nome oficial, código de convite, contagem de membros ativos (`activeMembers`), ano, curso, turno e sala.
  - [x] Integrar modal customizado de confirmação de exclusão (evitando `window.confirm` conforme `GEMINI.md`) com acionamento de `useDeleteClass()`.
  - [x] Incluir paginação padronizada em 5 itens por página utilizando os metadados de `meta.pagination`.

- [x] **Navegação e Modo God na Gestão da Turma:**
  - [x] Na ação de visualizar detalhes da turma a partir de `ActiveClassesPage.tsx`, navegar para a tela do painel da turma (`/app/painel-turma?turmaId=<id>`).
  - [x] Na tela do painel da turma (`ClassAdminPage.tsx` e seus blocos), ler `turmaId`, exibir banner de inspeção para Admin com retorno a `/app/admin-turmas` e passar `turmaId` para `useClassMembers`, `useClassEvents`, `useUsefulLinks` e `InviteSection`.

---

## 🟢 Concluído: Meta de Contribuição e Financiamento Coletivo (/api/financiamento)

**Data/Contexto:** Endpoints da API REST para transparência e gestão da meta global de contribuição/arrecadação mensal da plataforma (`/api/financiamento`).

### 1. Endpoints Disponíveis:
1. **Consultar Arrecadação Global:** `GET /api/financiamento`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Liberado para qualquer usuário autenticado (`ALUNO`, `LIDER`, `ADMIN`).
   - Retorno de Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: {
         metaArrecadadaMes: number, // Valor em reais (ex: 250.00)
         updatedAt: string | null   // ISO 8601 UTC da última alteração
       }
     }
     ```

2. **Atualizar Arrecadação Mensal:** `PUT /api/financiamento`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Acesso restrito exclusivo para Administrador Geral (`ADMIN`). Usuários sem perfil ADMIN recebem `403 AUTH_FORBIDDEN`.
   - Body (`UpdateFundingPayload`):
     ```json
     {
       "metaArrecadadaMes": 350.50
     }
     ```
   - Retorno de Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: {
         metaArrecadadaMes: number,
         updatedAt: string | null
       }
     }
     ```
   - Erros da API:
     - `400 BAD_REQUEST` com `code: "VALIDATION_ERROR"`: Se o valor for negativo (`< 0`) ou ultrapassar o teto permitido (`100000`).
     - `403 FORBIDDEN` com `code: "AUTH_FORBIDDEN"`: Usuário não possui perfil `ADMIN`.

---

### Ações Exigidas para o Frontend:

- [x] **Adoção dos Contratos e Schemas (@shared):**
  - [x] Importar `FundingDTO`, `UpdateFundingPayload` e `ApiResponse` de `@shared/types`:
    ```typescript
    import { ApiResponse, FundingDTO, UpdateFundingPayload } from '@shared/types';
    ```
  - [x] Importar `updateFundingSchema`, `UpdateFundingInput` de `@shared/schemas/fundingSchema`:
    ```typescript
    import { updateFundingSchema, type UpdateFundingInput } from '@shared/schemas/fundingSchema';
    ```

- [x] **Integração do Hook `useFunding.ts` (`frontend/src/features/system-admin/hooks/useFunding.ts`):**
  - [x] Substituir o mock em memória por chamadas reais via TanStack Query:
    - [x] `useFunding()`: Consumir `GET /api/financiamento` retornando `FundingDTO` (ou `data.data.metaArrecadadaMes`).
    - [x] `useUpdateFunding()`: Consumir `PUT /api/financiamento` enviando `{ metaArrecadadaMes: amount }`.
    - [x] Após sucesso da mutação, invalidar a query `['funding']` para sincronizar instantaneamente todos os componentes inscritos.

- [x] **Atualização dos Componentes de Visualização:**
  - [x] **`CrowdfundingBanner.tsx` (`frontend/src/features/dashboard/components/CrowdfundingBanner.tsx`):**
    - [x] Consumir o valor reativo retornado por `useFunding()`.
    - [x] Garantir formatação monetária correta e exibição da barra de progresso em relação à meta de R$ 50,00.
  - [x] **`FundingSection.tsx` (`frontend/src/features/system-admin/components/FundingSection.tsx`):**
    - [x] Conectar formulário ao `useUpdateFunding()` enviando o número informado no input.
    - [x] Exibir toast/feedback amigável com a resposta do backend e tratar eventuais erros da API.

---

## 🟢 Concluído: Links Úteis da Turma e Desvinculação Voluntária (Sair da Turma)

**Data/Contexto:** Endpoints da API REST para gerenciamento de links úteis da sala (`/api/turmas/links`) e desvinculação voluntária de membro autenticado (`POST /api/turmas/sair`).

### 1. Endpoints de Links Úteis Disponíveis:
1. **Listar Links Úteis:** `GET /api/turmas/links`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Query opcional (apenas Admin geral): `?turmaId=<uuid>`
   - Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: LinkDTO[] // Array de links ordenados por createdAt DESC
     }
     ```
   - Cada item (`LinkDTO`) possui:
     - `id: string` (UUID)
     - `turmaId: string` (UUID)
     - `titulo: string`
     - `urlLink: string`
     - `criadoPor: string | null` (UUID)
     - `createdAt: string` (ISO 8601 UTC)

2. **Criar Link Útil:** `POST /api/turmas/links`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Apenas `LIDER` ou `ADMIN` (alunos recebem `403 AUTH_FORBIDDEN`).
   - Body (`CreateLinkPayload`):
     ```json
     {
       "titulo": "Pasta do Drive da Sala",
       "urlLink": "https://drive.google.com/..."
     }
     ```
   - Sucesso: `HTTP 201 CREATED`
     ```typescript
     {
       success: true,
       data: LinkDTO
     }
     ```

3. **Excluir Link Útil:** `DELETE /api/turmas/links/:id`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Apenas `LIDER` da respectiva turma ou `ADMIN` (alunos recebem `403 AUTH_FORBIDDEN`).
   - Param: `:id` (UUID do link a ser excluído).
   - Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: {
         message: "Link útil excluído com sucesso."
       }
     }
     ```

### 2. Endpoint de Sair da Turma Disponível:
1. **Desvincular-se Voluntariamente da Turma:** `POST /api/turmas/sair`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Qualquer usuário autenticado pertencente a uma turma (`ALUNO`, `LIDER`, `ADMIN`).
   - Sem payload de entrada.
   - Sucesso: `HTTP 200 OK`
     ```typescript
     {
       success: true,
       data: {
         message: "Você saiu da turma com sucesso."
       }
     }
     ```
   - Tratamento de Erros da API:
     - `400 BAD_REQUEST` com `code: "LAST_LEADER_CANNOT_LEAVE"`: Regra Anti-Orfandade violada. O usuário é o único líder ativo e a turma possui outros alunos ("Você é o único líder da turma. Promova outro membro a líder antes de sair da turma.").
     - `400 BAD_REQUEST` com `code: "USER_ALREADY_WITHOUT_CLASS"`: Usuário não pertence a nenhuma turma.

---

### Ações Exigidas para o Frontend:

- [x] **Adoção dos Contratos e Schemas (@shared):**
  - [x] Importar `LinkDTO`, `CreateLinkPayload` e `ApiResponse` de `@shared/types`:
    ```typescript
    import { ApiResponse, LinkDTO, CreateLinkPayload } from '@shared/types';
    ```
  - [x] Importar `createLinkSchema`, `CreateLinkInput` de `@shared/schemas/linkSchema`:
    ```typescript
    import { createLinkSchema, type CreateLinkInput } from '@shared/schemas/linkSchema';
    ```

- [x] **Integração do Hook `useUsefulLinks.ts` (`frontend/src/features/class-admin/hooks/useUsefulLinks.ts`):**
  - [x] Substituir o array mockado `linksDB` por chamadas reais via TanStack Query:
    - [x] `useUsefulLinks()`: Consumir `GET /api/turmas/links` retornando `LinkDTO[]`.
    - [x] `useCreateLink()`: Consumir `POST /api/turmas/links` enviando `{ titulo, urlLink }`.
    - [x] `useDeleteLink()`: Consumir `DELETE /api/turmas/links/${id}`.
    - [x] Invalidar a query `['useful-links']` após criação e exclusão bem-sucedidas.

- [x] **Atualização dos Componentes de Visualização e Gestão:**
  - [x] **`UsefulLinksSection.tsx` (`frontend/src/features/class-admin/components/UsefulLinksSection.tsx`):**
    - [x] Atualizar o formulário do React Hook Form para utilizar `createLinkSchema` com os campos `titulo` e `urlLink`.
    - [x] Mapear a tabela para exibir `link.titulo` e `link.urlLink` (com link clicável `href={link.urlLink}`).
  - [x] **`ClassSidebar.tsx` (`frontend/src/features/calendar/components/ClassSidebar.tsx`):**
    - [x] Mapear `link.titulo` e `link.urlLink` no bloco de Links Rápidos.
    - [x] No bloco "Sair da Turma", conectar a função `handleLeaveClass` ao endpoint real `POST /api/turmas/sair` via mutation (`useMutation`).
    - [x] Tratar erro `400 LAST_LEADER_CANNOT_LEAVE` exibindo feedback visual integrado (banner) amigável para promover outro líder antes.
    - [x] No sucesso de `sair_da_turma`, invalidar a query `['me']` e redirecionar para `/app/dashboard`.
  - [x] **`FixedLinks.tsx` / `QuickAccess.tsx` (Dashboard):**
    - [x] Garantir consumo reativo dos links reais da turma com `link.titulo` e `link.urlLink`.

---

## 🟢 Concluído: Fase 1 do Calendário e Eventos da Turma (Exibição & Gestão de Eventos)

**Data/Contexto:** Endpoints da API REST para consulta por período, criação, edição e exclusão de eventos da turma (`/api/turmas/eventos`), além da inclusão dos dados cadastrais completos da turma (`ano`, `curso`, `turno`, `localSala`) no cabeçalho do perfil do usuário (`GET /api/me`).

### 1. Dados Reais da Turma no Cabeçalho (Auth / Sessão):
O objeto `turma` retornado em `GET /api/me` e `PUT /api/me/profile` (`TurmaSummaryDTO`) foi expandido e agora inclui:
- `id`: string (UUID da turma)
- `nomeOficial`: string (ex: "3º TDS Manhã")
- `codigoConvite`: string | null (código de 6 caracteres)
- `ano`: "1º" | "2º" | "3º" | null
- `curso`: string | null (ex: "Desenvolvimento de Sistemas")
- `turno`: "Manhã" | "Tarde" | "Noite" | "Integral" | null
- `localSala`: string | null (ex: "Laboratório 3")

### 2. Endpoints de Eventos Disponíveis:
1. **Listar Eventos da Turma:** `GET /api/turmas/eventos?startDate=${start}&endDate=${end}`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Query Params:
     - `startDate`: string (data inicial ISO 8601).
     - `endDate`: string (data final ISO 8601).
     - `turmaId`: string opcional (apenas para Admin Geral consultar turma específica).
   - **Regra de Validação:** Intervalo entre `startDate` e `endDate` não pode exceder **45 dias**.
   - Ordenação: Cronológica ascendente por `dataHoraLimite ASC`.
   - Sucesso: `HTTP 200 OK` -> `{ success: true, data: EventDTO[] }`
   - O campo `descricao` é retornado na íntegra sem truncamento no backend.

2. **Criar Evento de Turma:** `POST /api/turmas/eventos`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Permissão: Apenas `LIDER` da respectiva turma ou `ADMIN` geral.
   - Body:
     ```typescript
     {
       materia: string; // min 2, max 100 caracteres
       categoria: "Prova" | "Trabalho" | "Tarefa" | "Aviso";
       dataHoraLimite: string; // ISO 8601 UTC
       descricao?: string | null; // max 1000 caracteres
       anexoUrl?: string | null; // URL válida, max 500 caracteres
     }
     ```
   - Sucesso: `HTTP 201 Created` -> `{ success: true, data: EventDTO }`

3. **Atualizar Evento:** `PUT /api/turmas/eventos/:id`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Param: `:id` (UUID do evento).
   - Permissão: Apenas `LIDER` da respectiva turma ou `ADMIN` geral.
   - Body: campos parciais de `createEventSchema`.
   - Sucesso: `HTTP 200 OK` -> `{ success: true, data: EventDTO }`

4. **Excluir Evento:** `DELETE /api/turmas/eventos/:id`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Param: `:id` (UUID do evento).
   - Permissão: Apenas `LIDER` da respectiva turma ou `ADMIN` geral.
   - Sucesso: `HTTP 200 OK` -> `{ success: true, data: { message: "Evento removido com sucesso." } }`

### Códigos de Erro da API:
- `400 BAD_REQUEST` (`VALIDATION_ERROR`): Falha no schema Zod (ex: intervalo superior a 45 dias, categoria inválida, data mal formatada).
- `400 BAD_REQUEST` (`USER_WITHOUT_CLASS`): Usuário autenticado não está enturmado.
- `400 BAD_REQUEST` (`TURMA_REQUIRED`): Administrador não informou `turmaId` e não possui turma vinculada.
- `401 UNAUTHORIZED` (`AUTH_UNAUTHORIZED`): Token ausente ou inválido.
- `403 FORBIDDEN` (`AUTH_FORBIDDEN`): Acesso restrito a Líderes/Admin, ou tentativa de gerenciar eventos de outra turma.
- `404 NOT_FOUND` (`NOT_FOUND`): Evento não encontrado.

### Ações Exigidas para o Frontend:

- [x] **Integração dos Dados da Turma no Cabeçalho:**
  - [x] Consumir `user?.turma` expandido (`ano`, `curso`, `turno`, `localSala`) para exibir o resumo completo da sala no cabeçalho das páginas e no painel da turma.

- [x] **Adoção dos Novos Schemas e Tipos (@shared):**
  - [x] Importar `EventDTO`, `CreateEventPayload`, `UpdateEventPayload` de `@shared/types`.
  - [x] Importar `createEventSchema`, `updateEventSchema`, `listEventsQuerySchema` de `@shared/schemas/eventSchema`.

- [x] **Integração das Chamadas de API no Hook de Eventos:**
  - [x] Conectar `useClassEvents.ts` à rota `GET /api/turmas/eventos?startDate=${start}&endDate=${end}` via TanStack Query.
  - [x] Conectar as mutações de criação (`POST`), edição (`PUT /:id`) e exclusão (`DELETE /:id`).
  - [x] Invalidar a query `['class-events']` após o sucesso de qualquer mutação.

- [x] **Atualização do Modal de Eventos (`EventForm.tsx`):**
  - [x] Atualizar formulário para mapear os campos canônicos (`materia`, `categoria`, `dataHoraLimite`, `descricao`, `anexoUrl`).
  - [x] Remover campos/mocks obsoletos (`subject`, `dueDate`, etc.).

---


## 🟢 Concluído: Fase 2 da Gestão de Membros da Turma (Moderação & Poderes do Líder)
**Data/Contexto:** Endpoints da API REST para permitir que Líderes de Turma (e Administradores Gerais) gerenciem o quadro de alunos e liderança de sua sala, promovendo alunos a líder, rebaixando líderes para aluno e desvinculando/expulsando membros.

### Endpoints Disponíveis:
1. **Promover a Líder:** `PATCH /api/turmas/membros/:id/promover`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Param: `:id` (UUID do membro alvo).
   - Sucesso: `HTTP 200 OK` -> `{ success: true, data: { message: "Membro promovido a líder com sucesso." } }`
2. **Rebaixar para Aluno:** `PATCH /api/turmas/membros/:id/rebaixar`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Param: `:id` (UUID do líder alvo).
   - Sucesso: `HTTP 200 OK` -> `{ success: true, data: { message: "Líder rebaixado para aluno com sucesso." } }`
3. **Expulsar da Turma:** `DELETE /api/turmas/membros/:id`
   - Header: `Authorization: Bearer <session.access_token>`.
   - Param: `:id` (UUID do membro alvo).
   - Sucesso: `HTTP 200 OK` -> `{ success: true, data: { message: "Aluno removido da turma com sucesso." } }`

### Códigos de Erro da API:
- `403 FORBIDDEN` (`AUTH_FORBIDDEN`): Usuário autenticado não é Líder da turma nem Administrador Geral, ou está tentando moderar membro de outra turma.
- `409 CONFLICT` (`LAST_LEADER_CONFLICT`): Regra Anti-Orfandade violada. Tentativa de rebaixar ou expulsar o único líder restante da turma ("A turma não pode ficar sem nenhum líder. Promova outro membro antes.").
- `400 BAD_REQUEST` (`CANNOT_MODIFY_SELF`): Tentativa de rebaixar ou expulsar a si mesmo ("Você não pode realizar esta ação consigo mesmo pelo painel de moderação.").
- `400 BAD_REQUEST` (`VALIDATION_ERROR`): O `:id` informado não é um UUID válido.
- `404 NOT_FOUND` (`NOT_FOUND`): Membro não encontrado ou não pertence a esta turma.

### Ações Exigidas para o Frontend:

- [x] **Adoção dos Schemas e Tipos (@shared):**
  - [x] Utilizar o schema de validação `classMemberIdParamSchema` de `@shared/schemas/classSchema` se necessário para validar IDs antes do disparo.
  - [x] Consumir envelope padronizado `ApiResponse<{ message: string }>` de `@shared/types`.

- [x] **Atualização dos Mutations em `useClassMembers.ts`:**
  - [x] Atualizar ou implementar mutation de promoção (`usePromoteMember` ou similar) apontando para `PATCH /api/turmas/membros/${memberId}/promover`.
  - [x] Atualizar ou implementar mutation de rebaixamento (`useDemoteMember` ou similar) apontando para `PATCH /api/turmas/membros/${memberId}/rebaixar`.
  - [x] Atualizar ou implementar mutation de expulsão (`useExpelMember` ou similar) apontando para `DELETE /api/turmas/membros/${memberId}`.
  - [x] Após o sucesso de qualquer uma das mutações:
    - [x] Invalidar a query dos membros da turma (`queryClient.invalidateQueries({ queryKey: ['class-members'] })`).
    - [x] Exibir toast/feedback amigável de sucesso com a mensagem retornada pelo backend (`data.message`).

- [x] **Integração no Componente `MemberManagementSection.tsx`:**
  - [x] **Botão "Promover a Líder":**
    - Exibir apenas para membros com `role === 'ALUNO'` quando o usuário logado for `LIDER` ou `ADMIN`.
    - Disparar a mutação correspondente com modal/confirmação amigável estilizado com Tailwind/shadcn.
  - [x] **Botão "Rebaixar para Aluno":**
    - Exibir apenas para líderes (`role === 'LIDER'`), exceto para a linha do próprio usuário logado (`member.id === currentUser.id`).
    - Ao confirmar no modal, acionar a mutação de rebaixamento.
    - Se a API retornar `409 LAST_LEADER_CONFLICT`, capturar no `onError` e exibir toast explicativo: *"A turma não pode ficar sem nenhum líder. Promova outro membro antes."*
  - [x] **Botão "Remover da Turma" / "Expulsar":**
    - Desabilitar ou ocultar para a linha do próprio usuário logado (`member.id === currentUser.id`).
    - Ao confirmar no modal de remoção, acionar a mutação de expulsão.
    - Se a API retornar `409 LAST_LEADER_CONFLICT`, capturar no `onError` e exibir toast explicativo de proteção do último líder.
  - [x] **Garantia de Regra Visual (GEMINI.md):**
    - Nunca usar `window.confirm` ou `window.alert` nativos; usar os diálogos padronizados já existentes no componente com ícones Lucide React (sem emojis).

---

## 🟢 Concluído: Fase 1 da Gestão de Membros da Turma (Listagem de Colegas de Sala)

**Data/Contexto:** Endpoint `GET /api/turmas/membros` permitindo que alunos e líderes de uma turma listem os colegas de sala com paginação e ordenação direta no banco (Líderes primeiro, depois ordem alfabética).

### Ações Exigidas para o Frontend:

- [x] **Adoção dos Contratos e Schemas (@shared):**
  - [x] Importar `ClassMemberDTO` e `ApiResponse` de `@shared/types`:
    ```typescript
    import { ApiResponse, ClassMemberDTO } from '@shared/types';
    ```
  - [x] Importar `classMembersPaginationQuerySchema` de `@shared/schemas/classSchema`:
    ```typescript
    import { classMembersPaginationQuerySchema } from '@shared/schemas/classSchema';
    ```

- [x] **Integração da Chamada de API (`GET /api/turmas/membros`):**
  - [x] **Requisição de Listagem Paginada:**
    - Header: `Authorization: Bearer <session.access_token>`.
    - Query param: `page` (número inteiro, padrão: 1).
    - Exemplo de URL: `/api/turmas/membros?page=1`
    - Retorno de Sucesso: `HTTP 200 OK` com envelope:
      ```typescript
      {
        success: true,
        data: ClassMemberDTO[], // Array com até 5 itens ordenados (Líderes primeiro, depois nome ASC)
        meta: {
          pagination: {
            page: number,
            limit: 5,
            total: number,
            totalPages: number
          }
        }
      }
      ```
    - Cada item em `data` possui os campos:
      - `id: string`
      - `nome: string`
      - `email: string`
      - `role: 'ALUNO' | 'LIDER' | 'ADMIN'`
      - `dataEntradaTurma: string | null` (ISO 8601 UTC)
    - Tratamento de Erros da API:
      - `400 BAD_REQUEST` com `code: "BAD_REQUEST"`: Usuário não pertence a nenhuma turma.

- [x] **Atualização do Hook e Componente de Membros (`MemberManagementSection.tsx`):**
  - [x] Atualizar o hook `useClassMembers(page: number)` para realizar requisição real via TanStack Query (`useQuery`) chamando `GET /api/turmas/membros?page=${page}` em vez do array mockado em memória.
  - [x] Substituir a paginação e ordenação feitas no client-side (`slice` e `sort`) pelo controle direto dos metadados recebidos do backend (`meta.pagination.totalPages`).
  - [x] Mapear os campos no render da tabela:
    - Nome: `member.nome`
    - Email: `member.email`
    - Cargo: `member.role === 'LIDER'` (exibir badge de Líder) ou `member.role === 'ALUNO'` (exibir badge de Aluno)
    - Data de Entrada: `member.dataEntradaTurma ? new Date(member.dataEntradaTurma).toLocaleDateString('pt-BR') : '-'`

---

## 🟢 Concluído: Etapa 3 do Fluxo de Turmas (Entrada via Código de Convite)
**Data/Contexto:** Endpoint `POST /api/turmas/entrar` permitindo que alunos autenticados sem turma ingressem em uma sala existente através de código de convite de 6 caracteres alfanuméricos.

### Ações Exigidas para o Frontend:

- [x] **Adoção dos Contratos e Schemas (@shared):**
  - [x] Importar `joinClassSchema` e tipo `JoinClassInput` de `@shared/schemas/classSchema`:
    ```typescript
    import { joinClassSchema, type JoinClassInput } from '@shared/schemas/classSchema';
    ```
  - [x] Importar `JoinClassPayload`, `JoinClassResponse`, `ApiResponse` de `@shared/types`:
    ```typescript
    import { ApiResponse, JoinClassPayload, JoinClassResponse } from '@shared/types';
    ```

- [x] **Integração da Chamada de API (`POST /api/turmas/entrar`):**
  - [x] **Requisição de Ingresso na Turma:**
    - Header: `Authorization: Bearer <session.access_token>`.
    - Body:
      ```typescript
      {
        codigoConvite: string // 6 caracteres alfanuméricos
      }
      ```
    - Retorno de Sucesso: `HTTP 200 OK` com envelope:
      ```typescript
      {
        success: true,
        data: {
          turmaId: string,
          nomeOficial: string
        }
      }
      ```
    - Tratamento de Erros da API:
      - `400 BAD_REQUEST` com `code: "ALREADY_IN_CLASS"`: O usuário já está vinculado a uma turma.
      - `404 NOT_FOUND` com `code: "NOT_FOUND"`: Código de turma inválido ou inexistente.
      - `400 BAD_REQUEST` com `code: "VALIDATION_ERROR"`: Formato incorreto (diferente de 6 caracteres alfanuméricos).

- [x] **Integração no Componente `JoinClassModal.tsx`:**
  - [x] Conectar formulário ao mutation do TanStack Query (`useMutation`) chamando `POST /api/turmas/entrar`.
  - [x] Após sucesso:
    - Fechar o modal `JoinClassModal`.
    - Exibir feedback de boas-vindas com o nome da turma (`data.nomeOficial`).
    - Invalidar a query `['me']` (e `['my-pending-class-request']`) para atualização reativa instantânea da Dashboard do aluno.

---

## 🟢 Concluído: Exposição do Código de Convite da Turma no Perfil (`GET /api/me`)
**Data/Contexto:** O endpoint `GET /api/me` agora expõe a propriedade `codigoConvite` no objeto `turma` do usuário autenticado (`user.turma.codigoConvite`), permitindo que o painel de liderança e gestão da turma exiba o código de convite real em vez de um mock.

### Ações Exigidas para o Frontend:

- [x] **Adoção do Tipo Atualizado (@shared/types):**
  - [x] A interface `TurmaSummaryDTO` (em `UserProfileDTO`) agora inclui `codigoConvite?: string | null`.

- [x] **Atualização do Componente `InviteSection.tsx` (`frontend/src/features/class-admin/components/InviteSection.tsx`):**
  - [x] Obter os dados do usuário autenticado através do hook de autenticação/perfil (`useAuth` ou similar).
  - [x] Substituir o valor estático `const inviteCode = "X8K9J4";` por `const inviteCode = user?.turma?.codigoConvite || "------";`.
  - [x] Validar que o botão de cópia copia o código dinâmico da turma.

---

## 🟢 Concluído: Etapa 2 do Fluxo de Turmas (Moderação pelo Administrador Geral)
**Data/Contexto:** Endpoints da API REST para gerenciamento da fila de moderação de solicitações de turmas pelo Administrador Geral (`/api/admin/pedidos-turma`).

### Ações Exigidas para o Frontend:

- [x] **Adoção dos Contratos e Schemas (@shared):**
  - [x] Importar `AdminClassRequestDTO`, `ApproveClassRequestPayload`, `ApproveClassRequestResponse`, `ApiResponse` de `@shared/types`:
    ```typescript
    import {
      ApiResponse,
      AdminClassRequestDTO,
      ApproveClassRequestPayload,
      ApproveClassRequestResponse,
    } from '@shared/types';
    ```
  - [x] Importar schemas Zod de moderação de `@shared/schemas/classSchema`:
    ```typescript
    import {
      approveClassRequestSchema,
      type ApproveClassRequestInput,
    } from '@shared/schemas/classSchema';
    ```

- [x] **Integração das Chamadas de API (`/api/admin/pedidos-turma`):**
  - *Atenção:* Todas as rotas administrativas requerem usuário com `role = 'ADMIN'` e header `Authorization: Bearer <session.access_token>`. Se um usuário não-admin chamar estas rotas, o backend responderá com `HTTP 403 AUTH_FORBIDDEN`.
  - [x] **Listagem de Pedidos Pendentes (`GET /api/admin/pedidos-turma?page=1`):**
    - Query param: `page` (default: 1).
    - Retorno de sucesso: status 200 com envelope:
      ```typescript
      {
        success: true,
        data: AdminClassRequestDTO[],
        meta: {
          pagination: {
            page: number,
            limit: 5,
            total: number,
            totalPages: number
          }
        }
      }
      ```
    - Cada item traz `solicitante: { id: string, nome: string, email: string }`, além de `ano`, `turno`, `curso`, `localSala`, `justificativa`, `status` e `createdAt`.
    - Ordenação em FIFO (`created_at ASC`), priorizando os pedidos solicitados há mais tempo.
    - Conectar ao componente de listagem `PendingRequestsSection.tsx` com paginação de 5 itens por página.
  - [x] **Aprovação de Turma (`POST /api/admin/pedidos-turma/:id/aprovar`):**
    - Payload (opcional, pode ser `{}`):
      ```typescript
      {
        nomeOficial?: string;  // Opcional. Se omitido, o backend compõe "${ano} ${curso} - ${turno}"
        codigoConvite?: string; // Opcional (6 caracteres alfanuméricos). Se omitido, o backend gera automaticamente um código único legível
      }
      ```
    - Retorno de sucesso: status 200 com envelope:
      ```typescript
      {
        success: true,
        data: {
          turmaId: string,
          nomeOficial: string,
          codigoConvite: string
        }
      }
      ```
    - Tratamento de Erros da API:
      - `404 NOT_FOUND`: Pedido não encontrado ou já processado.
      - `409 CONFLICT` com `code: "INVITE_CODE_ALREADY_EXISTS"`: O código manual informado já está em uso por outra turma.
    - Pós-sucesso: Fechar modal `PendingRequestModal`, exibir feedback com o código de convite gerado e invalidar a query de pedidos pendentes (`['admin-pending-class-requests']`).
  - [x] **Rejeição de Pedido (`DELETE /api/admin/pedidos-turma/:id`):**
    - Retorno de sucesso: status 200 com envelope `{ success: true, data: { message: "Solicitação de turma rejeitada com sucesso." } }`.
    - Pós-sucesso: Fechar modal e invalidar a query de pedidos pendentes (`['admin-pending-class-requests']`).

---

## 🟢 Concluído: Etapa 1 do Fluxo de Turmas (Solicitação pelo Aluno)
**Data/Contexto:** Criação da API REST para envio e consulta de solicitações de turma (`pedidos_turma`), incluindo suporte ao cancelamento e controle de unicidade anti-spam.

### Ações Exigidas para o Frontend:

- [x] **Adoção dos Contratos e Schemas (@shared):**
  - [x] Importar `createClassRequestSchema` e tipo `CreateClassRequestInput` de `@shared/schemas/classSchema`:
    ```typescript
    import { createClassRequestSchema, type CreateClassRequestInput } from '@shared/schemas/classSchema';
    ```
  - [x] Importar `ClassRequestDTO`, `AnoTurma`, `TurnoTurma` e `ApiResponse` de `@shared/types`:
    ```typescript
    import { ApiResponse, ClassRequestDTO, AnoTurma, TurnoTurma } from '@shared/types';
    ```

- [x] **Integração das Chamadas de API (`/api/turmas/pedidos`):**
  - [x] **Enviar Solicitação de Turma (`POST /api/turmas/pedidos`):**
    - Header: `Authorization: Bearer <session.access_token>`.
    - Payload esperado:
      ```typescript
      {
        ano: '1º' | '2º' | '3º',
        turno: 'Manhã' | 'Tarde' | 'Noite' | 'Integral',
        curso: string,
        localSala?: string | null,
        justificativa?: string | null
      }
      ```
    - Retorno de Sucesso: status 201 com envelope `{ success: true, data: ClassRequestDTO }`.
    - Tratamento de Erros da API:
      - `400 BAD_REQUEST` com `code: "ALREADY_IN_CLASS"`: O usuário já está vinculado a uma turma.
      - `409 CONFLICT` com `code: "CLASS_REQUEST_DUPLICATE"`: O usuário já possui uma solicitação pendente em andamento.
    - Após sucesso: fechar o modal `CreateClassModal` e invalidar a query de pedido pendente (`['my-pending-class-request']`).
  - [x] **Consultar Solicitação Pendente do Aluno (`GET /api/turmas/pedidos/meu`):**
    - Header: `Authorization: Bearer <session.access_token>`.
    - Retorno:
      - Se houver pedido pendente: status 200 `{ success: true, data: ClassRequestDTO }`.
      - Se não houver pedido ativo: status 200 `{ success: true, data: null }`.
    - Utilizar para exibir banner/aviso no Dashboard informando que o pedido da turma está em análise pela moderação.
  - [x] **Cancelar Solicitação Pendente (`DELETE /api/turmas/pedidos/meu`):**
    - Header: `Authorization: Bearer <session.access_token>`.
    - Retorno: status 200 `{ success: true, data: { message: "Solicitação de turma cancelada com sucesso." } }`.
    - Permite ao aluno desistir de uma solicitação incorreta para criar uma nova.
    - Após sucesso: invalidar a query `['my-pending-class-request']`.

- [x] **Ajuste do Modal `CreateClassModal.tsx`:**
  - [x] Integrar formulário com `react-hook-form` e `zodResolver(createClassRequestSchema)`.
  - [x] As opções do select de `ano` devem enviar `'1º'`, `'2º'`, `'3º'`.
  - [x] As opções do select de `turno` devem incluir `'Manhã'`, `'Tarde'`, `'Noite'`, `'Integral'`.

---

## 🟢 Concluído: CRUD Completo do Mural Geral de Avisos (`/api/avisos`)
**Data/Contexto:** Implementação das rotas REST no Node.js/Hono para o Mural Geral de Avisos (`avisos_gerais`), com paginação de 5 itens no banco, validações Zod e restrições por role (ADMIN).

### Ações Exigidas para o Frontend:

- [x] **Integração da API de Avisos (`frontend/src/features/mural/api/noticeApi.ts` ou hooks):**
  - [x] Criar/atualizar as chamadas de API apontando para `http://localhost:3000/api/avisos` com o header `Authorization: Bearer <session.access_token>`.
  - [x] **Tipagens e Contratos Oficiais:**
    - Importar `NoticeDTO`, `AvisoRemetente`, `AvisoBadge`, `ApiResponse` de `@shared/types`.
    - Importar schemas Zod de `@shared/schemas/noticeSchema`.

- [x] **Substituir Mock pelo Backend Real em `useNotices.ts`:**
  - [x] **Listagem Paginada (`GET /api/avisos?page=1`):** 5 itens por página ordenados por `dataPostagem DESC`.
  - [x] **Busca de Aviso por ID (`GET /api/avisos/:id`).**
  - [x] **Criação de Aviso (`POST /api/avisos`):** Apenas ADMIN.
  - [x] **Edição de Aviso (`PUT /api/avisos/:id`):** Apenas ADMIN.
  - [x] **Exclusão de Aviso (`DELETE /api/avisos/:id`):** Apenas ADMIN.

---

## 📦 Histórico: Auth & Contratos SSOT de Usuário

- [x] **Supabase Client no Frontend:**
  - [x] **Instalar Dependência:** Rodar `npm install @supabase/supabase-js` na pasta `/frontend`.
  - [x] Implementar a chamada `signInWithOAuth` do Google e capturar a Sessão (JWT) do Supabase.

- [x] **Adoção dos Contratos Compartilhados de Usuário (@shared/types):**
  - [x] Importar `UserProfileDTO` e `ApiResponse` de `@shared/types`.
  - [x] Substituir a interface manual `UserSessionData` por `UserProfileDTO`.
  - [x] Ajustar a leitura do objeto de turma para `user.turma.nomeOficial`.

- [x] **Guardião de Rotas & Onboarding (Desacoplado de Strings):**
  - [x] Criar `AuthProvider.tsx` para prover a sessão do Supabase.
  - [x] Envolver rotas `/app` com `ProtectedRoute`.
  - [x] Executar _fetch_ em `GET /api/me` com header `Authorization: Bearer <token>`.
  - [x] Redirecionamento baseado na flag `user.onboardingConcluido`.
