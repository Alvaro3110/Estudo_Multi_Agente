import mlflow
import json
from datetime import datetime
from typing import Optional

class PromptVersion:
    """Representa uma versão de prompt"""
    
    def __init__(self, agent_name: str, version: str, prompt_text: str):
        self.agent_name = agent_name  # "financial", "sales", etc
        self.version = version  # "v1", "v2", "v3"
        self.prompt_text = prompt_text
        self.created_at = datetime.now()
        self.status = "testing"  # testing, production, deprecated
        self.avg_quality = None
        self.num_runs = 0
    
    def to_dict(self) -> dict:
        return {
            "agent_name": self.agent_name,
            "version": self.version,
            "prompt_text": self.prompt_text,
            "created_at": self.created_at.isoformat(),
            "status": self.status,
            "avg_quality": self.avg_quality,
            "num_runs": self.num_runs
        }

class PromptsManager:
    """Gerencia versionamento de prompts nativamente no MLflow"""
    
    def __init__(self):
        self.prompts = {}  # {agent_name: [PromptVersion, ...]}
        self.current_versions = {}  # {agent_name: "v2"} (qual é ativa)
    
    def create_prompt_version(self, agent_name: str, prompt_text: str) -> str:
        """
        Cria nova versão de prompt e loga no MLflow.
        Retorna o número da versão (v1, v2, v3, etc)
        """
        
        if agent_name not in self.prompts:
            self.prompts[agent_name] = []
            version_num = 1
        else:
            version_num = len(self.prompts[agent_name]) + 1
        
        version = f"v{version_num}"
        
        prompt_obj = PromptVersion(agent_name, version, prompt_text)
        self.prompts[agent_name].append(prompt_obj)
        
        with mlflow.start_run(run_name=f"{agent_name}_{version}", nested=True):
            mlflow.log_param("agent_name", agent_name)
            mlflow.log_param("version", version)
            mlflow.log_param("status", "testing")
            mlflow.log_param("created_at", prompt_obj.created_at.isoformat())
            
            prompt_file = f"/tmp/{agent_name}_{version}_prompt.txt"
            with open(prompt_file, "w") as f:
                f.write(prompt_text)
            mlflow.log_artifact(prompt_file, artifact_path="prompts")
            
            mlflow.set_tag("prompt_version", version)
            mlflow.set_tag("agent_type", agent_name)
            mlflow.set_tag("entity_type", "prompt_definition")
            
            mlflow.log_metric("avg_quality", 0.0)
        
        # Se for o primeiro, já define como produção
        if version_num == 1:
            self.current_versions[agent_name] = version
            prompt_obj.status = "production"
            
        return version
    
    def log_run_with_prompt(
        self,
        agent_name: str,
        version: str,
        quality_score: float,
        tokens_used: int,
        latency_ms: float,
        run_details: dict
    ):
        """
        Registra um run que usou uma versão específica de prompt.
        """
        with mlflow.start_run(run_name=f"{agent_name}_{version}_run", nested=True):
            mlflow.log_param("agent_name", agent_name)
            mlflow.log_param("prompt_version", version)
            mlflow.log_param("status", "production" if self.current_versions.get(agent_name) == version else "testing")
            
            mlflow.log_metric("quality_score", quality_score)
            mlflow.log_metric("tokens_used", tokens_used)
            mlflow.log_metric("latency_ms", latency_ms)
            
            details_file = f"/tmp/{agent_name}_{version}_run_details.json"
            with open(details_file, "w") as f:
                json.dump(run_details, f, indent=2)
            mlflow.log_artifact(details_file, artifact_path="run_details")
            
            mlflow.set_tag("prompt_version", version)
            mlflow.set_tag("agent_type", agent_name)
            mlflow.set_tag("entity_type", "prompt_execution")
    
    def set_production_version(self, agent_name: str, version: str):
        """Define qual versão está em produção."""
        with mlflow.start_run(run_name=f"{agent_name}_{version}_promoted", nested=True):
            mlflow.log_param("action", "promote_to_production")
            mlflow.log_param("version", version)
            mlflow.log_param("agent_name", agent_name)
            mlflow.set_tag("status", "production")
            mlflow.set_tag("entity_type", "prompt_promotion")
        
        self.current_versions[agent_name] = version
        if agent_name in self.prompts:
            for p in self.prompts[agent_name]:
                if p.version == version:
                    p.status = "production"
                else:
                    p.status = "deprecated" if p.status == "production" else p.status
    
    def get_version_metrics(self, agent_name: str, version: str) -> dict:
        """Retorna métricas agregadas de uma versão."""
        client = mlflow.tracking.MlflowClient()
        
        # Discover current tracking experiment or default to PROD
        active = mlflow.active_run()
        exp_ids = []
        if active:
            exp_ids = [active.info.experiment_id]
        else:
            # Fallback for prod script or default tests
            exp = mlflow.get_experiment_by_name("/Users/alvarosouzacruz@gmail.com/multi_agente_projeto")
            exp_test = mlflow.get_experiment_by_name("/Users/alvarosouzacruz@gmail.com/multi_agente_projeto_prompts_test")
            if exp: exp_ids.append(exp.experiment_id)
            if exp_test: exp_ids.append(exp_test.experiment_id)
            
        if not exp_ids:
            # Absolute fallback
            exp_ids = ["0"]
            
        runs = client.search_runs(
            experiment_ids=exp_ids,
            filter_string=f"tags.prompt_version = '{version}' AND tags.agent_type = '{agent_name}' AND tags.entity_type = 'prompt_execution'"
        )
        
        if not runs:
            return {}

        
        quality_scores = [r.data.metrics.get("quality_score", 0) for r in runs if "quality_score" in r.data.metrics]
        tokens_list = [r.data.metrics.get("tokens_used", 0) for r in runs if "tokens_used" in r.data.metrics]
        latency_list = [r.data.metrics.get("latency_ms", 0) for r in runs if "latency_ms" in r.data.metrics]
        
        return {
            "avg_quality": sum(quality_scores) / len(quality_scores) if quality_scores else 0,
            "num_runs": len(runs),
            "avg_tokens": sum(tokens_list) / len(tokens_list) if tokens_list else 0,
            "avg_latency_ms": sum(latency_list) / len(latency_list) if latency_list else 0,
            "min_quality": min(quality_scores) if quality_scores else 0,
            "max_quality": max(quality_scores) if quality_scores else 0,
        }
    
    def compare_versions(self, agent_name: str, version1: str, version2: str) -> dict:
        """Compara 2 versões de prompt."""
        metrics_v1 = self.get_version_metrics(agent_name, version1)
        metrics_v2 = self.get_version_metrics(agent_name, version2)
        
        # Protective defaults if no runs yet
        if not metrics_v1: metrics_v1 = {"avg_quality": 0, "avg_tokens": 0, "avg_latency_ms": 0}
        if not metrics_v2: metrics_v2 = {"avg_quality": 0, "avg_tokens": 0, "avg_latency_ms": 0}
        
        return {
            version1: metrics_v1,
            version2: metrics_v2,
            "improvement": {
                "quality_delta": metrics_v2["avg_quality"] - metrics_v1["avg_quality"],
                "quality_percent": (
                    (metrics_v2["avg_quality"] - metrics_v1["avg_quality"]) / metrics_v1["avg_quality"] * 100
                    if metrics_v1["avg_quality"] > 0 else 0
                ),
                "tokens_saved": metrics_v1["avg_tokens"] - metrics_v2["avg_tokens"],
                "latency_improvement_ms": metrics_v1["avg_latency_ms"] - metrics_v2["avg_latency_ms"],
            }
        }
    
    def get_prompt_history(self, agent_name: str) -> list:
        """Retorna histórico de todas as versões de um agente"""
        if agent_name not in self.prompts:
            return []
        
        history = []
        for prompt_obj in self.prompts[agent_name]:
            metrics = self.get_version_metrics(agent_name, prompt_obj.version)
            history.append({
                "version": prompt_obj.version,
                "created_at": prompt_obj.created_at.isoformat(),
                "status": prompt_obj.status,
                **metrics
            })
        
        return history
    
    def get_prompt_text(self, agent_name: str, version: Optional[str] = None) -> str:
        """
        Retorna o texto do prompt.
        Se version=None, retorna a versão em produção.
        """
        if version is None:
            version = self.current_versions.get(agent_name)
        
        if agent_name not in self.prompts:
            return ""
        
        for prompt_obj in self.prompts[agent_name]:
            if prompt_obj.version == version:
                return prompt_obj.prompt_text
        
        return ""

# Singleton para a aplicação
prompts_manager = PromptsManager()
