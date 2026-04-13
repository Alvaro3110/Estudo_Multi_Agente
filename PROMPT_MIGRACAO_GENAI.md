# Prompt para Agentes IA (Claude Code / Cursor / Codeium)
# Objetivo: Migrar o Sistema Multi-Agente para a API nativa `mlflow.genai` do Databricks

## 🎯 MISSÃO
A missão atual deste projeto é **refatorar toda a gestão de prompts do sistema multi-agente** utilizando obrigatoriamente a biblioteca nativa **`mlflow.genai`** integrada ao Databricks Model Registry (Unity Catalog).

---

## 📋 CONTEXTO DO PROJETO E ARQUITETURA ATUAL
- **Projeto:** Santander Brasil - Plataforma de Analytics e Monitoramento Multi-Agente
- **Stack Tecnológico:**
  - **Frontend:** Angular 17+ (Cards Dinâmicos, Chats e Relatórios Estruturados Multimarcas)
  - **Backend:** Python FastAPI
  - **Orquestração de Agentes:** LangGraph + DSPy (Chain of Thought / Predict) + LLMs
  - **Data Layer:** Databricks SQL (Schema Caching, Thread Pooling)
- **Time de Agentes (6 Domínios Prontos):** 
  - `Financeiro`, `Vendas`, `Logística`, `Risk`, `Compliance`, `Regulatory`

**O que temos hoje:**
Nossos agentes geram relatórios aprofundados baseados num fluxo LangGraph. Atualmente, os Prompts/Skills dos agentes (`Você é um Analista de Risco...`) são definidos como textos Markdown e salvos através de um `PromptsManager` customizado que faz fallback para runs temporários, pois estávamos limitados na versão Community do Databricks sem o *Unity Catalog*.

---

## 🚀 OBJETIVO DE REFATORAÇÃO: NATIVO `mlflow.genai`

Agora que teremos o ambiente Databricks compatível, **exijo que a orquestração adote estritamente os padrões nativos e recomendados da Databricks para versionamento de GenAI**, abandonando scaffolds customizados e abraçando o `mlflow.genai`.

### Tarefas de Engenharia a serem desenvolvidas:

### 1. Setup do Workspace MLflow (`genai_setup.py`)
- O backend deve forçar o pointer `mlflow.set_registry_uri("databricks-uc")` no Unity Catalog.
- Escrever um script de inicialização ou _seed_ usando `mlflow.genai.register_prompt(name="catalog.schema.financial_agent", template=..., tags={...})`.
- Configurar versões de staging e produção (`production`, `testing`) iterando sobre os 6 agentes existentes.
- Os prompts devem contemplar as variáveis nativas de parsing de contexto no backend (ex: `{data_summary}`, `{period}`).

### 2. Integração no LangGraph (`app/graph/agents/base_agent.py` e Filhos)
- O orquestrador / nós do LangGraph que acionam a inteligência artificial agora precisam injetar a skill em tempo de execução consultando a Databricks:
  - Deverão aplicar: `prompt_obj = mlflow.genai.load_prompt("prompts:/catalog.schema.financial_agent@production")`
  - Instanciar dinamicamente: `prompt_str = prompt_obj.format(data_summary=...)`
- Todos os tracking e loggings do MLflow, incluindo `mlflow.log_param`, `mlflow.log_metric("quality_score")`, etc, devem suportar esse payload nativo em conjunto com o `@mlflow.trace`.

### 3. Adaptação dos Testes e FastAPI (`app/api/routes/prompts.py`)
- Nossas rotas REST existentes que visualizam no Frontend o histórico dos prompts e promovem versões (`/api/prompts/agents/{name}/promote`) deverão ser roteadas puramente pelos hooks do client `mlflow.tracking.MlflowClient()`.
- Validar se a API reflete as versões recuperadas pelo Modelo de Registro do Unity Catalog em vez de payloads mockados ou do experimento base.

---

## 🛠 REGRAS E BOAS PRÁTICAS

1. **Evite Workarounds:** Se a API de `register_prompt` apontar algum detalhe de nome (ex: `INVALID_PARAMETER_VALUE`), lembre-se que obrigatoriamente no Databricks Unity Catalog a convenção determina nomes tríplices como: `meu_catalogo.meu_schema.meu_modelo`. Trate as envs de configuração no `.env` para carregar este tridente corretamente (`DATABRICKS_CATALOG` e `DATABRICKS_SCHEMA`).
2. **Foco no DSPy Ecosystem:** Como o projeto em parte utiliza _DSPy_, certifique-se de que a string de prompt que volta do `mlflow.genai` consegue compor com clareza o atributo da classe `dspy.Signature` ou do fallback da LLM sem quebras de formatação.
3. **Tracking sem Concorrência Gafanhotada:** Os carregamentos do GenAI Prompt (`load_prompt`) rolam dentro dos Nós asíncronos (`async def node_agente...`); assegure-se de que a chamada HTTP do load não onere nem trave a performance paralela (adicionar caching, se necessário, recuperando as labels _@production_ em memória antes do bootstrap completo do pipeline).

---

> Por favor, forneça os códigos modificados file-by-file para efetivar essa virada arquitetural de forma limpa, priorizando performance do backend e um tracing cristalino acessível pelo painel nativo do MLflow.
