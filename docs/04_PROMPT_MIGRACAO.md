# 🤖 Prompt de Migração e Adaptação do Projeto

> **Objetivo:** Utilize este prompt ao levar o código para um novo computador ou ambiente onde algumas bibliotecas (como LangGraph ou drivers específicos do Databricks) possam não estar disponíveis ou precisem de versões alternativas.

---

## 📝 O PROMPT

**Copie e cole o texto abaixo para a IA assistente no novo ambiente:**

"Olá! Estou migrando um projeto corporativo do **Santander AI** para este novo ambiente. O projeto é composto por um frontend **Angular 17+** e um backend **FastAPI (Python)** que utiliza orquestração de múltiplos agentes.

**Preciso que você me ajude com as seguintes adaptações, caso necessário:**

1. **Dependências de IA:** Se a biblioteca `langgraph` ou `langchain` não puder ser instalada nesta máquina, proponha uma refatoração do motor de agentes no diretório `backend/app/graph/` para utilizar uma lógica de orquestração síncrona simples (Sequential Chain) mantendo a mesma interface de saída SSE.
2. **Conexão com Dados:** Se o driver `databricks-sql-connector` falhar, ajude-me a criar um mock robusto no `backend/utils/db_connector.py` que simule retornos de tabelas SQL baseados nos JSONs de exemplo que estão na pasta `backend/data/mocks` (se existirem).
3. **Frontend:** Verifique se as versões do Node e Angular CLI são compatíveis com o projeto. Se houver erro de versão de bibliotecas como `rxjs` ou `angular-markdown`, ajude-me a fazer o downgrade ou upgrade seguro dos arquivos `package.json` sem quebrar o design system customizado em SCSS.
4. **Ports e Configs:** Ajuste as URLs de API nos arquivos `src/app/core/agent.service.ts` e `dashboard.service.ts` para refletir o novo IP/Porta deste computador.

**Contexto Técnico:** 
O projeto preza pelo visual premium oficial do Santander. Não mude cores ou layouts. O foco é garantir que o 'Pipeline' de agentes e o 'Histórico' continuem funcionando mesmo com adaptações de infraestrutura."

---

## 🛠️ Dicas Adicionais de Portabilidade

- **Ambiente Virtual:** Sempre crie um `venv` no backend para evitar conflitos:
  ```bash
  python -m venv venv
  source venv/bin/activate  # ou venv\Scripts\activate no Windows
  pip install -r requirements.txt
  ```
- **Node Modules:** Se encontrar erros de cache no frontend, limpe tudo antes de reinstalar:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- **Variáveis de Ambiente:** Verifique se o arquivo `.env` no backend foi copiado, especialmente as chaves de API da OpenAI/Azure.
