# 🤝 Integração Frontend-Backend (Handoff)

> Este documento serve como ponte de comunicação oficial entre o time de Backend (IA/Dev) e o time de Frontend (IA/Dev). Todas as ações que o Frontend precisar tomar devido a alterações de API, banco ou regras de negócio devem ser registradas aqui em formato estrito de checklist.

---

## 🟢 Status Atual: CRUD Completo do Mural Geral de Avisos (`/api/avisos`)
**Data/Contexto:** Implementação das rotas REST no Node.js/Hono para o Mural Geral de Avisos (`avisos_gerais`), com paginação de 5 itens no banco, validações Zod e restrições por role (ADMIN).

### Ações Exigidas para o Frontend:

- [x] **Integração da API de Avisos (`frontend/src/features/mural/api/noticeApi.ts` ou hooks):**
  - [x] Criar/atualizar as chamadas de API apontando para `http://localhost:3000/api/avisos` com o header `Authorization: Bearer <session.access_token>`.
  - [x] **Tipagens e Contratos Oficiais:**
    - Importar `NoticeDTO`, `AvisoRemetente`, `AvisoBadge`, `ApiResponse` de `@shared/types`:
      ```typescript
      import { ApiResponse, NoticeDTO, AvisoRemetente, AvisoBadge } from '@shared/types';
      ```
    - Importar schemas Zod de `@shared/schemas/noticeSchema`:
      ```typescript
      import {
        createNoticeSchema,
        updateNoticeSchema,
        type CreateNoticeInput,
        type UpdateNoticeInput
      } from '@shared/schemas/noticeSchema';
      ```

- [x] **Substituir Mock pelo Backend Real em `useNotices.ts`:**
  - [x] **Listagem Paginada (`GET /api/avisos?page=1`):**
    - Parâmetro query opcional: `page` (default 1).
    - O backend retorna 5 itens por página ordenados por `dataPostagem DESC`.
    - Envelope da resposta:
      ```typescript
      {
        success: true,
        data: NoticeDTO[],
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
    - Atualizar a paginação visual da tabela/cards no frontend (padronizada em 5 itens por página conforme GEMINI.md Seção 5).
  - [x] **Busca de Aviso por ID (`GET /api/avisos/:id`):**
    - Retorna `{ success: true, data: NoticeDTO }`.
    - Usar na abertura do modal de visualização (`NoticeModal.tsx`).
  - [x] **Criação de Aviso (`POST /api/avisos`):**
    - Apenas usuários com `role = 'ADMIN'`.
    - Payload enviado: `{ titulo: string, mensagem: string, remetente: AvisoRemetente, badgeDestaque: AvisoBadge }`.
    - Retorno: status 201 `{ success: true, data: NoticeDTO }`.
    - Invalidar queries `['notices']` no TanStack Query após mutação bem-sucedida.
  - [x] **Edição de Aviso (`PUT /api/avisos/:id`):**
    - Apenas usuários com `role = 'ADMIN'`.
    - Payload enviado: `{ titulo: string, mensagem: string, remetente: AvisoRemetente, badgeDestaque: AvisoBadge }`.
    - Retorno: status 200 `{ success: true, data: NoticeDTO }`.
    - Invalidar queries `['notices']` no TanStack Query após sucesso.
  - [x] **Exclusão de Aviso (`DELETE /api/avisos/:id`):**
    - Apenas usuários com `role = 'ADMIN'`.
    - Retorno: status 200 `{ success: true, data: { id: string } }`.
    - Invalidar queries `['notices']` no TanStack Query após sucesso.

- [x] **Ajuste dos Formulários e Modais de Aviso:**
  - [x] Em `NoticeFormModal.tsx`: migrar os nomes dos campos para português camelCase (`titulo`, `mensagem`, `remetente`, `badgeDestaque`) e usar o resolver `zodResolver(createNoticeSchema)`.
  - [x] Opções do select de `remetente`: `'Diretoria ETEC'`, `'Coordenação'`, `'Administração da Plataforma'`.
  - [x] Opções do select de `badgeDestaque`: `'Urgente'`, `'Informativo'`, `'Evento'`.

---

## 📦 Histórico: Auth & Contratos SSOT de Usuário

- [x] **Supabase Client no Frontend:**
  - [x] **Instalar Dependência:** Rodar `npm install @supabase/supabase-js` na pasta `/frontend`.
  - [x] Implementar a chamada `signInWithOAuth` do Google e capturar a Sessão (JWT) do Supabase.

- [x] **Adoção dos Contratos Compartilhados de Usuário (@shared/types):**
  - [x] Em `frontend/src/features/auth/api/authApi.ts`:
    - Importar `UserProfileDTO` e `ApiResponse` de `@shared/types`.
    - Substituir a interface manual `UserSessionData` por `UserProfileDTO`.
    - Ajustar a leitura do objeto de turma para `user.turma.nomeOficial`.

- [x] **Guardião de Rotas & Onboarding (Desacoplado de Strings):**
  - [x] Criar `AuthProvider.tsx` para prover a sessão do Supabase.
  - [x] Envolver rotas `/app` com `ProtectedRoute`.
  - [x] Executar _fetch_ em `GET /api/me` com header `Authorization: Bearer <token>`.
  - [x] Se não houver sessão ou `isError` -> Redirecionar para `/login`.
  - [x] Em `ProtectedRoute.tsx`:
    - Substituir a verificação de string (`user.nome === emailPrefix`) pela checagem da flag booleana `user.onboardingConcluido`.
    - Se `!user.onboardingConcluido && location.pathname !== '/onboarding'` -> Redirecionar para `/onboarding`.
    - Se `user.onboardingConcluido && location.pathname === '/onboarding'` -> Redirecionar para `/app/dashboard`.

- [x] **Fluxo da Tela de Onboarding:**
  - [x] Importar o schema (`import { onboardingSchema } from '@shared/schemas/onboardingSchema'`) no `react-hook-form` da tela `OnboardingPage.tsx`.
  - [x] O formulário deve enviar `PUT /api/me/profile` com `{ "nome": "..." }`.
  - [x] Após sucesso no `PUT /api/me/profile`, invalidar a query `['me']` no TanStack Query (`queryClient.invalidateQueries({ queryKey: ['me'] })`) para atualizar o estado do usuário com `onboardingConcluido: true` e navegar para `/app/dashboard`.
