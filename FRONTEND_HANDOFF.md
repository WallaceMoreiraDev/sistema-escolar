# 🤝 Integração Frontend-Backend (Handoff)

> Este documento serve como ponte de comunicação oficial entre o time de Backend (IA/Dev) e o time de Frontend (IA/Dev). Todas as ações que o Frontend precisar tomar devido a alterações de API, banco ou regras de negócio devem ser registradas aqui.

---

## 🟢 Status Atual: Refatoração Zod & Estruturação Auth
**Data/Contexto:** Criação da pasta `shared` e estruturação da regra de negócio do Auth Guards.

### Ações Exigidas para o Frontend:

1. **Supabase Client no Frontend:**
   - **Instalar Dependência:** Rodar `npm install @supabase/supabase-js` na pasta `/frontend`.
   - O Frontend é o responsável exclusivo por chamar o `signInWithOAuth` do Google e capturar a Sessão (JWT) do Supabase.

2. **Guardião de Rotas (Regras de Negócio):**
   - Conforme regra imposta, o usuário não pode acessar NENHUMA tela da plataforma (`/app/*`) se:
     a) Não estiver logado via Supabase.
     b) Estiver logado, mas NÃO tiver um `nome` válido na nossa base.
   - **Fluxo de Redirects a ser implementado:**
     - Criar um `AuthProvider.tsx` para prover a sessão do Supabase.
     - Envolver as rotas `/app` com um `ProtectedRoute`.
     - Fazer um _fetch_ em `GET /api/me` (rota Node já criada) passando o token Bearer.
       - *Contrato da Resposta (`GET /api/me` e `PUT /api/me/profile`):*
         `{ success: true, data: { id, nome, email, role, turma: { id, nome_oficial } | null } }`
     - Se falhar/não tiver sessão -> `/login`.
     - Se o nome retornado pela API corresponder à primeira parte do email (o fallback gerado pela Trigger do DB) -> `/onboarding`.

3. **Nova Rota de Onboarding Zod (Concluído):**
   - O schema `onboardingSchema.ts` foi criado na pasta `@shared/schemas/`.
   - O frontend deverá importar este mesmo schema (`import { onboardingSchema } from '@shared/schemas/onboardingSchema'`) no `react-hook-form` da tela `OnboardingPage.tsx` para validar o nome no client-side.
   - O formulário, ao submeter, deve chamar a rota `PUT /api/me/profile` enviando o JSON `{ "nome": "..." }`.
