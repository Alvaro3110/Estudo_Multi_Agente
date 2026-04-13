import uuid
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class LabelingManager:
    """
    Faz a ponte para permitir anotações manuais dos relatórios pela interface do usuário.
    Gera sessões que o Angular pode renderizar.
    """
    def __init__(self):
        self.schema = {
            "fields": [
                {"name": "quality", "type": "categorical", "options": ["excelente", "bom", "revisar", "ruim"]},
                {"name": "comments", "type": "text"},
                {"name": "needs_revision", "type": "boolean"}
            ]
        }
        self.sessions = {}
    
    def create_labeling_session(self, dataset_name: str, num_samples: int) -> str:
        """Cria e retorna uma sessão de labeling ativa."""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "dataset": dataset_name,
            "status": "open",
            "samples": num_samples
        }
        logger.info(f"Sessão de labeling criada: {session_id} [{dataset_name}]")
        return session_id
        
    def save_labels(self, session_id: str, labels: Dict[str, Any]):
        """Salva a correção humana vinculada a um run_id/sample via MLflow tags."""
        if session_id not in self.sessions:
            logger.warning("Sessão inválida.")
            return False
            
        logger.info(f"Labels salvos na sessão {session_id}: {labels}")
        # AQUI iria o codigo real do MLflow Client logando na TAG do respectivo RUN
        return True

labeling_manager = LabelingManager()
