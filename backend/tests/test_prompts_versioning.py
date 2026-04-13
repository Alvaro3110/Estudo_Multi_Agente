import pytest
import mlflow
from app.prompts_manager import PromptsManager

class TestPromptsVersioning:
    
    @pytest.fixture
    def pm(self):
        # Para evitar side-effects, limpa tracking global
        mlflow.set_experiment("/Users/alvarosouzacruz@gmail.com/multi_agente_projeto_prompts_test")
        return PromptsManager()
    
    def test_create_prompt_version(self, pm):
        """Testa criação de versão"""
        version = pm.create_prompt_version(
            "financial",
            "Você é um analista"
        )
        
        assert version == "v1"
        assert "financial" in pm.prompts
        assert len(pm.prompts["financial"]) == 1
    
    def test_multiple_versions(self, pm):
        """Testa múltiplas versões"""
        v1 = pm.create_prompt_version("financial", "Prompt v1")
        v2 = pm.create_prompt_version("financial", "Prompt v2")
        v3 = pm.create_prompt_version("financial", "Prompt v3")
        
        assert v1 == "v1"
        assert v2 == "v2"
        assert v3 == "v3"
        assert len(pm.prompts["financial"]) == 3
    
    def test_set_production_version(self, pm):
        """Testa promoção pra produção"""
        pm.create_prompt_version("financial", "Prompt v1")
        pm.create_prompt_version("financial", "Prompt v2")
        
        pm.set_production_version("financial", "v2")
        
        assert pm.current_versions["financial"] == "v2"
    
    def test_get_prompt_text(self, pm):
        """Testa recuperar texto do prompt"""
        text_v1 = "Você é um analista"
        pm.create_prompt_version("financial", text_v1)
        
        retrieved = pm.get_prompt_text("financial", "v1")
        assert retrieved == text_v1
    
    def test_get_production_prompt(self, pm):
        """Testa pegar prompt da produção"""
        pm.create_prompt_version("financial", "Prompt v1")
        pm.create_prompt_version("financial", "Prompt v2")
        
        pm.set_production_version("financial", "v2")
        
        # Sem especificar version, pega da produção
        retrieved = pm.get_prompt_text("financial")
        assert "Prompt v2" in retrieved
    
    def test_compare_versions(self, pm):
        """Testa comparação de versões"""
        pm.create_prompt_version("financial", "Prompt v1")
        pm.create_prompt_version("financial", "Prompt v2")
        
        # Simular runs com qualidades diferentes
        pm.log_run_with_prompt("financial", "v1", 0.72, 3200, 1200, {})
        pm.log_run_with_prompt("financial", "v2", 0.81, 3100, 1100, {})
        
        comparison = pm.compare_versions("financial", "v1", "v2")
        
        assert comparison["v1"]["avg_quality"] == 0.72
        assert comparison["v2"]["avg_quality"] == 0.81
        assert comparison["improvement"]["quality_delta"] > 0
    
    def test_prompt_history(self, pm):
        """Testa histórico de versões"""
        pm.create_prompt_version("financial", "Prompt v1")
        pm.create_prompt_version("financial", "Prompt v2")
        pm.create_prompt_version("financial", "Prompt v3")
        
        history = pm.get_prompt_history("financial")
        
        assert len(history) == 3
        # As it gets fetched, version is string
        # Test just the existence to be sure
        assert any(h["version"] == "v1" for h in history)
        assert any(h["version"] == "v3" for h in history)

# ===== TESTE INTEGRADO =====

class TestPromptsVersioningIntegrated:
    
    def test_full_versioning_workflow(self):
        """
        Testa workflow completo:
        1. Criar 3 versões
        2. Rodar com cada uma
        3. Comparar resultados
        4. Promover melhor pra produção
        """
        mlflow.set_experiment("/Users/alvarosouzacruz@gmail.com/multi_agente_projeto_prompts_test")
        pm = PromptsManager()
        
        with mlflow.start_run(run_name="test_full_versioning"):
            # 1. Criar 3 versões
            v1 = pm.create_prompt_version("financial", "Versão baseline")
            v2 = pm.create_prompt_version("financial", "Versão otimizada com DSPy")
            v3 = pm.create_prompt_version("financial", "Versão com Chain of Thought")
            
            # 2. Simular runs com cada versão
            # v1: baseline quality
            pm.log_run_with_prompt("financial", v1, 0.72, 3500, 1500, {})
            pm.log_run_with_prompt("financial", v1, 0.70, 3400, 1400, {})
            
            # v2: melhoria moderada
            pm.log_run_with_prompt("financial", v2, 0.81, 3200, 1200, {})
            pm.log_run_with_prompt("financial", v2, 0.80, 3100, 1100, {})
            
            # v3: melhor qualidade mas mais tokens
            pm.log_run_with_prompt("financial", v3, 0.87, 3800, 1600, {})
            pm.log_run_with_prompt("financial", v3, 0.88, 3900, 1650, {})
            
            # 3. Comparar v1 vs v2
            comp_v1_v2 = pm.compare_versions("financial", v1, v2)
            assert comp_v1_v2["improvement"]["quality_delta"] > 0.05
            
            mlflow.log_metric("v1_vs_v2_quality_improvement", 
                            comp_v1_v2["improvement"]["quality_delta"])
            
            # 4. Comparar v2 vs v3
            comp_v2_v3 = pm.compare_versions("financial", v2, v3)
            mlflow.log_metric("v2_vs_v3_quality_improvement",
                            comp_v2_v3["improvement"]["quality_delta"])
            
            # 5. Decidir: v3 tem melhor qualidade mas v2 é mais eficiente
            # → Promover v2 (bom custo-benefício)
            pm.set_production_version("financial", v2)
            
            mlflow.log_param("promoted_version", v2)
            mlflow.log_param("reason", "Best quality/cost ratio")
            
            # Validar
            assert pm.current_versions["financial"] == v2
            assert pm.get_prompt_text("financial") != ""
