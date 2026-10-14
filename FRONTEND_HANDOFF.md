# 🤝 Integração Frontend-Backend (Handoff)

> Este documento serve como ponte de comunicação oficial entre o time de Backend (IA/Dev) e o time de Frontend (IA/Dev). Todas as ações que o Frontend precisar tomar devido a alterações de API, banco ou regras de negócio devem ser registradas aqui em formato estrito de checklist.

---

## 🟡 Pendentes: Etapa 1 do Fluxo de Turmas (Solicitação pelo Aluno)
**Data/Contexto:** Criação da API REST para envio e consulta de solicitações de turma (`pedidos_turma`), incluindo suporte ao cancelamento e controle de unicidade anti-spam.

### Ações Exigidas para o Frontend:

- [ ] **Adoção dos Contratos e Schemas (@shared):**
  - [ ] Importar `createClassRequestSchema` e tipo `CreateClassRequestInput` de `@shared/schemas/classSchema`:
    ```typescript
    import { createClassRequestSchema, type CreateClassRequestInput } from '@shared/schemas/classSchema';
    ```
  - [ ] Importar `ClassRequestDTO`, `AnoTurma`, `TurnoTurma` e `ApiResponse` de `@shared/types`:
    ```typescript
    import { ApiResponse, ClassRequestDTO, AnoTurma, TurnoTurma } from '@shared/types';
    ```

- [ ] **Integração das Chamadas de API (`/api/turmas/pedidos`):**
  - [ ] **Enviar Solicitação de Turma (`POST /api/turmas/pedidos`):**
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
  - [ ] **Consultar Solicitação Pendente do Aluno (`GET /api/turmas/pedidos/meu`):**
    - Header: `Authorization: Bearer <session.access_token>`.
    - Retorno:
      - Se houver pedido pendente: status 200 `{ success: true, data: ClassRequestDTO }`.
      - Se não houver pedido ativo: status 200 `{ success: true, data: null }`.
    - Utilizar para exibir banner/aviso no Dashboard informando que o pedido da turma está em análise pela moderação.
  - [ ] **Cancelar Solicitação Pendente (`DELETE /api/turmas/pedidos/meu`):**
    - Header: `Authorization: Bearer <session.access_token>`.
    - Retorno: status 200 `{ success: true, data: { message: "Solicitação de turma cancelada com sucesso." } }`.
    - Permite ao aluno desistir de uma solicitação incorreta para criar uma nova.
    - Após sucesso: invalidar a query `['my-pending-class-request']`.

- [ ] **Ajuste do Modal `CreateClassModal.tsx`:**
  - [ ] Integrar formulário com `react-hook-form` e `zodResolver(createClassRequestSchema)`.
  - [ ] As opções do select de `ano` devem enviar `'1º'`, `'2º'`, `'3º'`.
  - [ ] As opções do select de `turno` devem incluir `'Manhã'`, `'Tarde'`, `'Noite'`, `'Integral'`.

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
