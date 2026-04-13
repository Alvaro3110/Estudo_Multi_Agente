import os
import mlflow
import logging
from typing import Dict

logger = logging.getLogger(__name__)

class PromptManager:
    """
    Gerencia versões de prompts e integração com MLflow.
    """
    def __init__(self, skills_dir: str = "app/graph/skills"):
        self.skills_dir = skills_dir

    def get_skill_path(self, agent_name: str, version: str = None) -> str:
        """Retorna o caminho do arquivo de skill, suportando versionamento de arquivo."""
        if version and version != "latest":
            path = os.path.join(self.skills_dir, f"{agent_name}_{version}.md")
            if os.path.exists(path):
                return path
        return os.path.join(self.skills_dir, f"{agent_name}.md")

    def log_prompt_evolution(self, agent_name: str, new_content: str, version: str):
        """Salva uma nova versão de prompt e registra no MLflow."""
        path = os.path.join(self.skills_dir, f"{agent_name}_{version}.md")
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        
        logger.info(f"Nova versão de prompt salva: {path}")
        
        if mlflow.active_run():
            mlflow.set_tag(f"{agent_name}_version", version)
            mlflow.log_text(new_content, f"evolutions/{agent_name}_{version}.md")

prompt_manager = PromptManager()
