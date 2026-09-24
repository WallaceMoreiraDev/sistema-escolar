# 📘 Manual de Padrões de Engenharia de Software e Diretrizes de Código

> **DOCUMENTO MANDATÓRIO:** Este manual define as regras absolutas de arquitetura, qualidade e segurança para o desenvolvimento do MVP da Plataforma Escolar (React + Node.js + Supabase). A prioridade máxima é a construção de um sistema robusto, seguro, sem falhas silenciosas ou código espaguete. **O não cumprimento destas diretrizes resultará em código inaceitável e bloqueio em Code Review.**

---

## 1. Princípios Fundamentais (Core Principles)
1. **Falhe Rápido (Fail-Fast):** Erros devem estourar no momento da execução, seja na validação de payload ou na compilação. Falhas silenciosas são inaceitáveis.
2. **Única Fonte da Verdade (SSOT):** Evite duplicação de lógicas de negócio e tipos. Utilize contratos compartilhados entre Frontend e Backend.
3. **Legibilidade sobre Esperteza:** O código é lido muito mais vezes do que escrito. Prefira clareza, nomes descritivos e design simples em vez de otimizações prematuras ou tipagens complexas (type gymnastics).
4. **Tratamento de Datas e Horas (UTC Always):** Todas as datas DEVEM ser armazenadas e transitadas (API) em UTC (ISO 8601). A conversão para o fuso horário local do usuário (ex: `America/Sao_Paulo`) deve ocorrer EXCLUSIVAMENTE na camada de visualização (Frontend).
5. **Idempotência em Operações Críticas:** Mutação de dados (POST, PUT, DELETE) em processos sensíveis deve ser desenhada de forma idempotente, garantindo que retentativas de requisições não causem duplicidade de registros ou efeitos colaterais indesejados.

---

## 2. Arquitetura Geral e Integração (Node.js + Supabase)
* **Padrão Backend-for-Frontend (BFF):** O Frontend em React **NÃO DEVE** fazer requisições diretas de manipulação de dados para o Supabase. Toda a comunicação acontece EXCLUSIVAMENTE através da API Node.js.
* **Segurança de Acesso e RLS (Row Level Security) - CRÍTICO:**
  * O Frontend envia o JWT de sessão via cabeçalho HTTP `Authorization: Bearer <token>`.
  * O Node.js **DEVE** instanciar o cliente do Supabase *por requisição* e aplicar este token, garantindo que as regras de RLS do banco sejam aplicadas com o contexto do usuário autenticado.
  * O uso da `service_role_key` (Admin SDK) é **ESTRITAMENTE PROIBIDO** para requisições de clientes comuns, pois burla toda a segurança (RLS). A Admin Key só deve ser usada em *background jobs*, *webhooks* e *scripts de manutenção*, com clara documentação da justificativa.
* **Database Migrations & Transações:** 
  * Nenhuma alteração estrutural de banco de dados (tabelas, colunas, RLS, functions) deve ser feita via Supabase Dashboard. O uso exclusivo de **Supabase Migrations CLI** é obrigatório, garantindo o versionamento do schema.
  * Mutações que envolvem múltiplas tabelas devem ser feitas através de transações. Como o Supabase JS Client não suporta transações locais complexas nativamente, utilize **Postgres RPCs (Stored Procedures)** encapsulando a lógica transacional para garantir ACID.
* **Convenção de Nomenclatura do Banco:** Tabelas e colunas devem obrigatoriamente usar `snake_case`. O backend é responsável por mapear esses valores para `camelCase` (via DTOs) antes de enviá-los ao frontend.

---

## 3. Contratos de API, Tratamento de Erros e Observabilidade
* **Padronização de Respostas HTTP:** Todas as respostas da API devem seguir um envelope padronizado.
  * Sucesso: `{ "success": true, "data": { ... }, "meta": { "pagination": ... } }`
* **Exception Propagation e Códigos de Erro (CRÍTICO):** 
  * A API **NUNCA** deve retornar strings localizadas de erro para o Frontend (ex: "E-mail inválido").
  * O backend deve retornar **Códigos de Erro Tipados**, ex: `AUTH_INVALID_EMAIL` ou `NOT_FOUND`.
  * O React deve possuir um Dicionário (`errorMessages.ts`) que mapeia os códigos em mensagens amigáveis baseadas no locale.
* **Manejo de Erros no Express e Zod:**
  * Erros de Validação (Zod) devem detalhar o problema: `{ "success": false, "code": "VALIDATION_ERROR", "details": [{ "path": "email", "message": "Invalid format" }] }`.
  * Toda rota assíncrona deve utilizar `asyncHandler` ou `express-async-errors`.
  * Exceções da camada de Service devem ser lançadas com `throw new AppError("CODE", statusCode)`. Um **Middleware Global de Erros** centraliza a formatação para não expor stack traces em produção.
* **Observabilidade, Logs e Segurança:** 
  * O uso indiscriminado de `console.log` é desencorajado em produção. Utilize um *logger* estruturado (ex: Winston ou Pino).
  * Informações Sensíveis (PII, Senhas, Tokens) **JAMAIS** devem ser logadas.
  * Implemente Rate Limiting global e configurações de segurança HTTP (Helmet) na API Node.js para prevenir ataques de força bruta e injeções.

---

## 4. Padrões de Backend (Node.js)
* **Arquitetura em Camadas (Layered Architecture):** O fluxo da requisição deve ser rigoroso para evitar código espaguete:
  * **Routes:** Acoplam Middlewares aos Controllers. Sem regras de negócio.
  * **Controllers:** Orquestram Request/Response, invocam o Service.
  * **Services:** Concentram 100% da regra de negócio. São "puros" no contexto HTTP (não conhecem `req`/`res`).
  * **Repositories:** Única camada autorizada a acionar o banco (Supabase) via queries. Não contêm lógica de negócio.
* **DTOs e Boundary Mapping:** As entidades cruas do banco não devem ser expostas se possuírem dados sensíveis (senhas, meta-dados). O Controller deve aplicar Mapeamento via DTO (Data Transfer Object).
* **Validação Universal:** TODO payload, query e param de rota deve ser validado via middlewares estritos do **Zod** antes de tocar o Controller.
* **Variáveis de Ambiente:** O arquivo `.env` DEVE ser validado na inicialização da aplicação usando Zod (`env.ts`). O aplicativo deve crashear no *boot* caso falte uma variável obrigatória, evitando comportamentos imprevisíveis.

---

## 5. Padrões de Frontend (React)
* **Feature-Sliced Design:** Fuja da estrutura achatada (`/components`, `/hooks`). Domínios coesos ganham sua própria pasta em `/features` (ex: `/features/alunos/{components,api,hooks,types}`).
* **Princípio de Responsabilidade Única na UI (SRP):**
  * **Componentes Apresentacionais:** Apenas recebem props e geram a UI. Puros e testáveis.
  * **Componentes Containers (Smart):** Acionam estados, contextos e chamadas de API, passando os dados aos componentes de apresentação.
* **Gerenciamento de Estado e Data Fetching:**
  * É **OBRIGATÓRIO** o uso de **TanStack Query (React Query)** para requisições assíncronas.
  * O combo `useEffect` + `useState` para data-fetching manual é explicitamente proibido devido a race conditions e má gestão de cache.
* **Formulários e Segurança:** 
  * Uso exclusivo da combinação **React Hook Form** + **Zod** para formulários controlados/descontrolados com validação baseada em schema. 
  * Prevenção de XSS: NUNCA utilize `dangerouslySetInnerHTML` sem passar o conteúdo por uma biblioteca de sanitização rigorosa (ex: `DOMPurify`).
* **Estilização UI:** Utilizar **Tailwind CSS** com componentes da biblioteca **shadcn/ui**. A criação de arquivos de CSS manual (arquivos `.css` soltos) é proibida para manter a consistência visual.

---

## 6. Qualidade de Código e Documentação
* **TypeScript Estrito ("No Any"):** A tipagem `any` é terminantemente proibida. Para payloads não confiáveis, use `unknown` em conjunto com Type Guards e asserções Zod.
* **Convenções de Nomenclatura:**
  * `PascalCase`: Componentes React, Interfaces, Classes e Enums.
  * `camelCase`: Variáveis, Funções, Métodos e Propriedades de Objeto.
  * `UPPER_SNAKE_CASE`: Constantes globais e Variáveis de Ambiente.
* **Documentação de Código:**
  * Toda função complexa, regra de negócio (Services) e utilitário genérico deve obrigatoriamente ser documentada via **JSDoc**.
  * Rotas da API Node.js devem ser formalmente documentadas (ex: Swagger/OpenAPI) garantindo previsibilidade para o Frontend.
* **Estratégia de Testes Automatizados:**
  * **Testes Unitários:** Mandatórios para Services (Node.js), Utilitários complexos e Reducers/Hooks de negócio.
  * **Testes de Integração:** Obrigatórios para rotas da API validando a integração entre Controller e Repository.
  * **Testes E2E:** Recomendados para fluxos críticos (ex: Autenticação, Pagamentos, Matrículas) utilizando Playwright ou Cypress.
* **Automação de Qualidade:** O projeto DEVE configurar **ESLint** e **Prettier**, aplicados obrigatoriamente através de **Husky** (Pre-commit hooks) e `lint-staged`.

---

## 7. Git Workflow e CI/CD
* **Proibição de Commits Diretos:** É estritamente proibido realizar *commits* ou *pushes* diretamente nas branches `master`, `main` ou `develop`. 
* **Trabalho por Branches:** Todo desenvolvimento se dá em branches no padrão `feature/nome`, `bugfix/nome`, `hotfix/nome` ou `chore/nome`.
* **Pull Requests e o Code Review Checklist (CRÍTICO):** Nenhuma PR pode ser "auto-aprovada". O revisor DEVE validar:
  * [ ] As regras de negócio estão no Service e isoladas do Controller?
  * [ ] Todos os inputs estão sendo validados por Zod?
  * [ ] As chamadas ao banco consideram o usuário autenticado (RLS respeitado)?
  * [ ] Novas rotas/funcionalidades possuem cobertura de testes?
  * [ ] Há código acoplado que deveria estar na pasta `features` correspondente?
  * [ ] As variáveis de ambiente necessárias foram adicionadas na validação de inicialização e no `.env.example`?
* **Pipeline de CI/CD:** O CI/CD atua como status check obrigatório na PR. Deve rodar `Type-check`, `Lint` e `Testes`. A PR só pode ser mesclada com CI verde.
* **Segurança Básica de Repositório:** 
  * Não comite segredos, senhas ou arquivos `.env`. Utilize o `.env.example`.
  * Nunca faça *force push* em branches compartilhadas remotamente.

---

## 8. Protocolo de Atuação da Inteligência Artificial (Trabalho Colaborativo)
* **Obediência Estrita a este Manual:** A IA deve sempre consultar e obedecer este documento (`GEMINI.md`) antes de realizar qualquer ação. Caso o usuário solicite algo que contradiga as regras estabelecidas aqui, a IA está terminantemente proibida de obedecer de imediato. Ao invés disso, deve apontar a contradição e pedir a confirmação explícita do usuário antes de prosseguir.
* **Alinhamento Prévio:** Qualquer alteração de arquitetura, inclusão de nova lib no `package.json`, ou modificações estruturais extensas requerem validação e aprovação do desenvolvedor parceiro (usuário).
* **Planejamento sobre Ação Pronta:** Antes de despejar grandes quantidades de código, planeje os passos a serem tomados e valide o entendimento lógico. O fluxo é: Compreensão -> Proposta -> Validação -> Execução.
* **Justificativas Técnicas:** Quando propor uma solução diferente da que foi pedida, a IA tem a obrigação de explicar a motivação e os potenciais ganhos e riscos para a base do código (trade-offs).
