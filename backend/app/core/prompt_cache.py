import hashlib
import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

class PromptCache:
    """
    Cache em memória simples para interceptar requisições reduntantes ao LLM.
    Ideal para cenários onde múltiplas mensagens de chat consecutivas acabam sendo
    semanticamente idênticas após normalização, muito comum no Transformer e Router.
    """
    def __init__(self):
        self._cache = {}
        self.hits = 0
        self.misses = 0

    def _generate_key(self, prefix: str, input_data: Any) -> str:
        """Gera um hash unívoco para os inputs fornecidos."""
        # Se for um obj complexo/dict, serializa para json para poder fazer hash
        if isinstance(input_data, dict):
            # Sort keys para garantir que a ordem não importe
            serializable = json.dumps(input_data, sort_keys=True, ensure_ascii=False)
        else:
            serializable = str(input_data)
            
        hash_digest = hashlib.sha256(serializable.encode('utf-8')).hexdigest()
        return f"{prefix}_{hash_digest}"

    def get(self, prefix: str, input_data: Any) -> Optional[Any]:
        """Tenta resgatar do cache."""
        key = self._generate_key(prefix, input_data)
        if key in self._cache:
            self.hits += 1
            logger.info(f"✅ CACHE HIT [{prefix}] -> Economizou tokens!")
            return self._cache[key]
        self.misses += 1
        return None

    def set(self, prefix: str, input_data: Any, result: Any):
        """Salva no cache."""
        key = self._generate_key(prefix, input_data)
        self._cache[key] = result
        logger.debug(f"💾 Caching salvo [{prefix}]")

    def get_hit_rate(self) -> float:
        total = self.hits + self.misses
        if total == 0:
            return 0.0
        return self.hits / total

# Instâncias globais singleton
transformer_cache_manager = PromptCache()
router_cache_manager = PromptCache()
