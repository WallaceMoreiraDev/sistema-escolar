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
