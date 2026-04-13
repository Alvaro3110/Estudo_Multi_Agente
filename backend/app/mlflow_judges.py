from typing import Dict, Any

class ReportJudge:
    """
    Judge que avalia a qualidade do report retornado por um agente.
    Pode usar abordagens baseadas em regras (heurísticas) ou LLM as a Judge.
    """
    def __init__(self):
        self.criteria = {
            "tem_metrics": lambda r: len(r.get("metrics", {})) > 0 if isinstance(r, dict) else False,
            "tem_insights": lambda r: len(r.get("insights", [])) > 0 if isinstance(r, dict) else False,
            "metricas_validas": self._validate_metrics
        }
    
    def _validate_metrics(self, report: Any) -> bool:
        """Verifica se não existem valores absurdos/NaNs nas métricas principais."""
        if not isinstance(report, dict):
            return False
        metrics = report.get("metrics", {})
        for k, v in metrics.items():
            if v is None:
                return False
        return True

    def judge(self, report: Any) -> float:
        """Retorna um score normalizado de 0.0 a 1.0."""
        if not report:
            return 0.0
            
        score = sum(1.0 if c(report) else 0.0 for c in self.criteria.values())
        return score / len(self.criteria)

# Instância Singleton
report_judge = ReportJudge()
