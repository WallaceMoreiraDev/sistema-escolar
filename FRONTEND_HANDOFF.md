# 🤝 Integração Frontend-Backend (Handoff)

> Este documento serve como ponte de comunicação oficial entre o time de Backend (IA/Dev) e o time de Frontend (IA/Dev). Todas as ações que o Frontend precisar tomar devido a alterações de API, banco ou regras de negócio devem ser registradas aqui em formato estrito de checklist.

---

## 🟢 Status Atual: Contratos Compartilhados SSOT & Flag Onboarding Concluído
**Data/Contexto:** Criação da pasta centralizada `@shared/types`, eliminação de tipagens manuais divergentes e suporte oficial à flag booleana `onboardingConcluido`.

### Ações Exigidas para o Frontend:

- [x] **Supabase Client no Frontend:**
  - [x] **Instalar Dependência:** Rodar `npm install @supabase/supabase-js` na pasta `/frontend`.
  - [x] Implementar a chamada `signInWithOAuth` do Google e capturar a Sessão (JWT) do Supabase.

- [x] **Adoção dos Contratos Compartilhados (@shared/types):**
  - [x] Em `frontend/src/features/auth/api/authApi.ts`:
    - Importar `UserProfileDTO` e `ApiResponse` diretamente de `@shared/types`:
      ```typescript
      import { ApiResponse, UserProfileDTO } from '@shared/types';
      ```
    - Substituir a interface manual `UserSessionData` por `UserProfileDTO`.
    - Ajustar a leitura do objeto de turma para `user.turma.nomeOficial` (padronizado em camelCase conforme GEMINI.md Seção 2).
  - [x] **Contrato Oficial da Resposta (`GET /api/me` e `PUT /api/me/profile`):**
    ```typescript
    {
      success: true,
      data: {
        id: string,
        nome: string,
        email: string,
        role: "ALUNO" | "LIDER" | "ADMIN",
        onboardingConcluido: boolean,
        turma: {
          id: string,
          nomeOficial: string
        } | null
      }
    }
    ```

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
