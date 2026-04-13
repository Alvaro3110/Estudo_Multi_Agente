import mlflow
import os

def setup_genai_prompts():
    """
    Registra os Prompts reais usando a biblioteca nativa mlflow.genai!
    O Tracking e Registry baseiam-se no mlruns.db local configurado no helper.
    """
    mlflow.set_tracking_uri("sqlite:///mlruns.db")
    mlflow.set_registry_uri("sqlite:///mlruns.db")
    
    # Mapeia os agentes reais aos seus arquivos markdown
    agents = {
        "financial_agent": "app/graph/skills/agente_financeiro.md",
        "sales_agent": "app/graph/skills/agente_vendas.md",
        "logistics_agent": "app/graph/skills/agente_logistica.md"
    }

    # Template dinâmico para garantir que os parâmetros de código {period} e {context} funcionem no mlflow
    context_appender = "\n\n## Contexto Opcional\nPeríodo: {period}\nResumo de Dados: {context}"

    for agent_name, file_path in agents.items():
        try:
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    # Limpa as chaves para evitar conflito de formato Python str.format
                    raw_content = f.read().replace("{", "{{").replace("}", "}}")
                    template_content = raw_content + context_appender
                
                # Checa se o prompt atual já está idêntico para não poluir versões a cada reset
                ja_existe = False
                try:
                    latest = mlflow.genai.load_prompt(f"prompts:/{agent_name}@latest")
                    if latest.template == template_content:
                        ja_existe = True
                except Exception:
                    pass
                
                if not ja_existe:
                    mlflow.genai.register_prompt(name=agent_name, template=template_content)
                    print(f"🌟 Nova versão do {agent_name} sincronizada do arquivo .md!")
            else:
                print(f"Aviso: Arquivo {file_path} não encontrado, skill ignorada.")
        except Exception as e:
            print(f"Erro ao registrar {agent_name}: {e}")

    print("✅ Sincronização de Prompts locais via MLflow GenAI concluída!")

if __name__ == "__main__":
    setup_genai_prompts()
