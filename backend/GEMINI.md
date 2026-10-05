# 🔧 Diretrizes de Negócio e Domínio (Backend)

> **AVISO:** Este arquivo contém as regras de negócio Específicas ("Leis Locais") para as funcionalidades do Backend do Prumo. Ele atua como complemento ao `GEMINI.md` da raiz do projeto, que dita as leis de arquitetura globais.

---

## 1. Diretrizes da Rota de Eventos (Calendário e Dashboard)
- **Limite de Busca (Scalability Constraint):** O limite matemático máximo de busca exigido na validação do Zod entre `start_date` e `end_date` deve ser cravado em **45 dias**.
- **Payload Integral:** O backend deve retornar OBRIGATORIAMENTE a descrição completa do evento nos endpoints de listagem, independentemente do local que os chamou. A lógica de truncagem visual ou resumo de texto é responsabilidade exclusiva do Frontend.

*(Adicione novas regras específicas de domínio aqui conforme o desenvolvimento de novas features)*
