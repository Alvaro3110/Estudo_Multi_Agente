import os
import logging
import json
from app.engine import compilar_multi_agentes

# Configura logs detalhados
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s — %(message)s'
)
logger = logging.getLogger("test_graph")

def test_full_flow():
    logger.info("🚀 Iniciando teste SÍNCRONO do Grafo LangGraph...")
    
    # 1. Compila o grafo (Síncrono)
    try:
        app = compilar_multi_agentes()
        logger.info("✅ Grafo compilado com sucesso.")
    except Exception as e:
        logger.error(f"❌ Erro ao compilar grafo: {e}")
        return

    # 2. Configura input de teste
    inputs = {
        "query": "Como estão as vendas no Varejo SP?",
        "department_id": "auto",
        "group_context": "Varejo Digital SP",
        "modelo_selecionado": "GPT-4o Mini (OpenAI)",
        "thread_id": "test_final_boss_999"
    }
    
    config = {"configurable": {"thread_id": inputs["thread_id"]}}

    # 3. Executa streaming (Síncrono)
    logger.info(f"📡 Enviando query: {inputs['query']}")
    try:
        # Nota: app.stream(..., stream_mode="values") retorna um gerador síncrono
        for event in app.stream(inputs, config=config, stream_mode="values"):
            active_node = event.get("active_node", "unknown")
            logger.info(f"📍 Node Ativo: {active_node}")
            
            # Se houver relatório consolidado, imprime
            if "consolidacao_final" in event and active_node == "consolidador":
                logger.info("📝 CONSOLIDAÇÃO FINAL ENCONTRADA!")
                
            if "sugestoes_follow_up" in event and active_node == "memorizador":
                logger.info("🧠 MEMORIZADO! Sugestões: " + str(event["sugestoes_follow_up"]))
                print("\n" + "="*50)
                print(event["consolidacao_final"])
                print("="*50 + "\n")
                
            if "veredito_juiz" in event:
                logger.info(f"⚖️ Veredito do Juiz: {event['veredito_juiz']}")

    except Exception as e:
        logger.error(f"❌ Erro durante execução do streaming: {e}", exc_info=True)

if __name__ == "__main__":
    test_full_flow()
