# Santander AI — Multi-Agent Intelligence Platform

[![Status](https://img.shields.io/badge/Status-Operacional-brightgreen)](https://github.com/alvarocruz/Santander-AI)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](https://github.com/alvarocruz/Santander-AI)

Plataforma corporativa de inteligência artificial multi-agente projetada para o ecossistema Santander. O sistema utiliza **LangGraph** para orquestrar agentes especializados, integrando-se diretamente ao **Databricks SQL** com camadas de otimização de latência e garantia de qualidade (Anti-Viés).

---

## 🏗️ Arquitetura do Sistema

O projeto é dividido em uma estrutura monorepo moderna:

### Backend (Python/FastAPI)
- **Engine LangGraph**: Orquestração de agentes com loops de reflexão e replanejamento.
- **Databricks Integration**: Pool de conexões singleton e cache de schemas em background.
- **GEPA (Anti-Bias Engine)**: Camada de processamento de linguagem natural (DSPy) que sanitiza e valida as saídas dos agentes.
- **Persistence**: Checkpoints de sessão via SQLite para suporte a fluxos Human-in-the-Loop (HITL).

### Frontend (Angular 18+)
- **SSE Streaming**: Interface reativa que exibe o processo cognitivo dos agentes em tempo real.
- **Dashboard Persona-based**: Experiência de usuário premium adaptada para diferentes perfis bancários.
- **Interactive UI**: Gráficos dinâmicos e tabelas para visualização de dados financeiros.

---

## 🚀 Como Iniciar

### Pré-requisitos
- Python 3.10+
- Node.js 18+ & Angular CLI
- Acesso ao Databricks SQL Warehouse

### Configuração Rápida
1. Clone o repositório.
2. Configure o arquivo `.env` no diretório `backend/` com suas credenciais Databricks e OpenAI.
3. Execute o script de inicialização na raiz:
   ```bash
   ./run_project.sh
   ```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Angular 18, RxJS, Tailwind CSS (Design System Santander).
- **Backend**: FastAPI, LangChain/LangGraph, DSPy, Pydantic.
- **Data**: Databricks SQL, SQLite (Checkpoints).

---

## 📄 Documentação Adicional
- [Relatório de Status Atual](brain/3e14039b-a8f2-4729-a55a-0d9e93444a5a/status_report.md)
- [Walkthrough de Funcionalidades](brain/3e14039b-a8f2-4729-a55a-0d9e93444a5a/walkthrough.md)

---
*Desenvolvido para transformar o futuro dos dados no Santander.*
