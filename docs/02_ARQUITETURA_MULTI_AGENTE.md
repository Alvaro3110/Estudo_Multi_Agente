# 🧠 Arquitetura Multi-Agente & Dados

O "Coração" do **Santander AI** não reside em um único LLM gigantesco, mas sim em uma "Sociedade de Agentes" orquestrada via **LangGraph**.

## 🤖 Padrão Arquitetural: Supervisor e Especialistas
A arquitetura simula a estrutura real do banco:
1. **Agente Supervisor (O Chat Principal):** O componente `Agente Principal` recebe o prompt do usuário, avalia o contexto departamental selecionado na UI e roteia a pergunta.
2. **Workers Especializados:**
   - *Agente Financeiro:* Detém permissões de query na tabela Databricks `sales_transactions` e `finance_reports`.
   - *Agente de Crédito/Bacen:* Compreende a base de dados do SCR via RAG, e responde sobre riscos.
   - *Agente de Logística:* Tem acesso aos dados de despachos operacionais.

## 🛡️ Anti-Bias Engine
Antes de emitir o `agent_report` para a UI, os dados estruturados de crédito e limites passam pelo **Anti-Bias Pipeline**. Se ele detectar recomendações de crédito discrepantes em clusters demográficos sensíveis, ele bloqueia o Output Seguro e despacha a requisição para um Node de Alarme, inserindo na UI a tag `alerta crítico` indicando falta de equidade. Dessa forma, a aplicação atende a normativas rigorosas do Bacen e Open Finance.

## 🗄️ Integração Databricks (Pool Singleton)
Historicamente a latência do Databricks Python SDK era um gargalo (até 3 segundos no handshake HTTP).
No backend, foi implementado o `db_connector.py` usando pooling em memória.
- No `startup` do app, inicializamos `X` conexões passivas via Pyspark ou SDK connector.
- Quando o agente faz RAG, a thread de IA empresta o DB Session em microssegundos em vez de fazer overhead de TLS e Auth Handshake.

## 🛑 HITL (Human-in-the-Loop)
Múltiplos comandos operacionais gerados pelos agentes (e.g., "Aprovar limite automático de R$2M") param a execução da streaming na API (`status="checkpoint"`), suspendendo a _State Machine_ do LangGraph na memória Redis/Postgres. 
A UI renderiza o `app-hitl-card`. O usuário clica "Aprovar", enviamos uma request `/api/agent/resume`, o Node é descongelado no Backend, executando o impacto na base final.
