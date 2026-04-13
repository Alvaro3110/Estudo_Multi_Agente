# 💻 Santander AI - Guia do Desenvolvedor

Este guia detalha a arquitetura técnica do projeto, as ferramentas utilizadas e os passos para configuração do ambiente.

## 🛠️ Stack Tecnológica
- **Frontend:** Angular 17+ (Design System customizado baseado em SCSS Vanilla, focado na identidade global do Santander; uso de RxJS para observáveis e gerenciamento de estado assíncrono).
- **Backend:** FastAPI (Python 3.12+), arquitetura assíncrona orientada a eventos usando Server-Sent Events (SSE) para stream do Chat.
- **Integração de IA:** LangChain, LangGraph (para orquestração de Agentes Múltiplos) e modelos LLM (OpenAI Gpt-4o Mini suportado e plugável para Azure OpenAI).
- **Banco de Dados / Big Data:** Databricks SQL (otimizado via Connection Pooling customizado).

## 📂 Estrutura de Diretórios
```text
Projeto_Completo/
├── docs/                # Documentação técnica e executiva (você está aqui)
├── frontend/            # Aplicação Angular 17
│   ├── src/app/
│   │   ├── core/        # Serviços Singleton, Models e Guards (auth, agent, dashboard)
│   │   ├── features/    # Módulos roteáveis (chat, step1, step2, step3, historico)
│   │   └── shared/      # Componentes visuais reutilizáveis (sidebar, header, hitl-card, agent-bubble)
├── backend/             # Aplicação e APIs FastAPI
│   ├── api/             # Controladores (routes) da aplicação
│   ├── app/graph/       # Arquitetura LangGraph (nós, state, tools)
│   ├── utils/           # db_connector, loggers, formatters
│   └── main.py          # Entrypoint da API
└── run_project.sh       # Script de orquestração de ambiente de desenvolvimento
```

## ⚙️ Como Executar Localmente
Na raiz do projeto (`/home/alvarocruz/Documentos/Projeto_Completo`), execute o script orquestrador:
```bash
./run_project.sh
```
O script fará:
1. Limpeza de portas zumbis na 8000 (Backend), 4000 (Proxy/Nova Porta de Auth), e 4200 (Frontend).
2. Bootstrapping do FastAPI (aguardará ouvir tráfego na porta).
3. Bootstrapping do `ng serve` do Angular.
4. Acessível em: `http://localhost:4200`

## 🧩 Adicionando um Novo Departamento
1. Adicione a nova interface/mock no `MOCK_GROUPS` em `src/app/core/user-groups.service.ts`.
2. Adicione os dados do relatório em `REPORT_CONFIGS` dentro de `src/app/core/dashboard.service.ts`.
3. Certifique-se de registrar o SVG associado em `src/app/shared/components/dept-icon/dept-icon.component.ts`.
4. No Backend, mapeie o `departmentId` dentro dos Tools do agente (`app/graph/tools/`), garantindo que a base do Databricks suporte as query tables equivalentes do novo setor.
