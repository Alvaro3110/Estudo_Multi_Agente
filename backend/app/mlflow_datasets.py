import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class DatasetManager:
    """
    Gerencia a criação e carga de datasets "Gold" (bons exemplos).
    Esses exemplos são capturados quando o ReportJudge dá score alto.
    """
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.dataset_name = f"{agent_name}_reports_good"
        # Temporariamente usando memoria, o ideal é salvar referências no MLflow Data Tables
        self._local_buffer: List[Dict[str, Any]] = []
    
    def save_example(self, input_data: Dict[str, Any], output: Dict[str, Any], score: float):
        """Salva no dataset se o score for alto."""
        if score > 0.85:
            example = {
                "input": input_data,
                "output": output,
                "score": score
            }
            self._local_buffer.append(example)
            logger.debug(f"[{self.agent_name}] Exemplo de alta qualidade retido no dataset.")
            # Posteriormente, fazer append em um artefato real no DBFS/MLflow.
            
    def get_examples(self, version: str = "latest") -> List[Dict[str, Any]]:
        """Recupera exemplos de uma versão para injeção few-shot/DSPy optimization."""
        return self._local_buffer
        
    def list_versions(self) -> List[str]:
        """Lista todas as versões do dataset."""
        return ["v1"]

def get_dataset_manager(agent_name: str) -> DatasetManager:
    return DatasetManager(agent_name)
