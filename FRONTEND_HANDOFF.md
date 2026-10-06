# 🤝 Integração Frontend-Backend (Handoff)

> Este documento serve como ponte de comunicação oficial entre o time de Backend (IA/Dev) e o time de Frontend (IA/Dev). Todas as ações que o Frontend precisar tomar devido a alterações de API, banco ou regras de negócio devem ser registradas aqui.

---

## 🟢 Status Atual: Refatoração Zod & Estruturação Auth
**Data/Contexto:** Criação da pasta `shared` e estruturação da regra de negócio do Auth Guards.

### Ações Exigidas para o Frontend:

1. **Schemas Migrados:**
   - Os schemas Zod que existiam dentro do frontend (`noticeSchema`, `linkSchema`, `eventSchema`) foram migrados para a pasta raiz `shared/schemas/`.
   - O `tsconfig.app.json` e o `vite.config.ts` do frontend foram atualizados para reconhecer o path alias `@shared/*`. Se algum importe quebrar, revise para `import { ... } from '@shared/schemas/...';`.

2. **Supabase Client no Frontend:**
   - **Instalar Dependência:** Rodar `npm install @supabase/supabase-js` na pasta `/frontend`.
   - O Frontend é o responsável exclusivo por chamar o `signInWithOAuth` do Google e capturar a Sessão (JWT) do Supabase.

3. **Guardião de Rotas (Regras de Negócio):**
   - Conforme regra imposta, o usuário não pode acessar NENHUMA tela da plataforma (`/app/*`) se:
     a) Não estiver logado via Supabase.
     b) Estiver logado, mas NÃO tiver um `nome` válido na nossa base.
   - **Fluxo de Redirects a ser implementado:**
     - Criar um `AuthProvider.tsx` para prover a sessão do Supabase.
     - Envolver as rotas `/app` com um `ProtectedRoute`.
     - Fazer um _fetch_ em `GET /api/me` (rota Node a ser criada no backend em breve) para pegar o nome e a turma.
     - Se falhar/não tiver sessão -> `/login`.
     - Se o nome retornado pela API corresponder a um "placeholder" ou precisar ser editado (o backend retornará isso em breve) -> `/onboarding`.

4. **Nova Rota de Onboarding Zod (Em Breve):**
   - O backend irá criar um `onboardingSchema.ts` na pasta `shared/`. O frontend deverá importar este mesmo schema no `react-hook-form` da tela `OnboardingPage.tsx` para validar o limite máximo de 100 caracteres e apenas letras.
