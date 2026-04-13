import os
import logging
import mlflow
from mlflow.tracking import MlflowClient

logger = logging.getLogger(__name__)

class MLflowConfig:
    """
    Configuração e inicialização avançada do MLflow.
    Implementa um setup de 'Multi-Experiment' onde cada agente
    tem seu próprio experimento no Databricks.
    """
    def __init__(self):
        # 1. Obter credenciais (garante que estão no enviroment para a lib acessar)
        self.host = os.getenv("DATABRICKS_HOST", "")
        self.token = os.getenv("DATABRICKS_TOKEN", "")
        self.user_email = os.getenv("DATABRICKS_USER_EMAIL", "alvarosouzacruz@gmail.com")
        
        # 2. Configura a URI - 'databricks' força o uso do credentials provider nativo
        mlflow.set_tracking_uri("databricks")
        self.client = MlflowClient()
        
        # 3. Mapeamento de agentes (direto na raiz do usuário)
        # O usuário especificou usar apenas um experimento mestre: /Users/alvarosouzacruz@gmail.com/multi_agente_projeto
        base_path = f"/Users/{self.user_email}/multi_agente_projeto"
        self.experiments = {
            "agente_financeiro": base_path,
            "agente_vendas": base_path,
            "agente_logistica": base_path,
            "agente_risco": base_path,
            "agente_compliance": base_path,
            "agente_regulatorio": base_path,
            "orquestrador": base_path
        }
    
    def init_workspace(self):
        """Cria todos os experimentos no Databricks se eles não existirem."""
        logger.info("🔧 Inicializando MLflow Multi-Experiment Configuration...")
        for agent_name, exp_path in self.experiments.items():
            try:
                # Tenta pegar o experimento. Se não existir, vai levantar exceção ou criar
                exp = self.client.get_experiment_by_name(exp_path)
                if not exp:
                    logger.info(f"Criando experimento para {agent_name}: {exp_path}")
                    self.client.create_experiment(exp_path)
                else:
                    logger.debug(f"Experimento {agent_name} já existe: {exp.experiment_id}")
            except Exception as e:
                logger.warning(f"Erro ao verificar/criar experivento para {agent_name}: {e}")
        
    def get_experiment_id(self, agent_name: str) -> str:
        """Retorna o ID do experimento do Databricks dado o nome do agente."""
        path = self.experiments.get(agent_name, self.experiments["orquestrador"])
        try:
            exp = self.client.get_experiment_by_name(path)
            if exp:
                return exp.experiment_id
            return "0"
        except Exception:
            return "0"

    def set_active_agent(self, agent_name: str):
        """Torna ativo o experimento de um agente específico."""
        path = self.experiments.get(agent_name, self.experiments["orquestrador"])
        mlflow.set_experiment(path)

# Instância Singleton
mlflow_config_manager = MLflowConfig()
