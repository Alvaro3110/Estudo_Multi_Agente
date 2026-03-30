import re
import logging

logger = logging.getLogger(__name__)

def sanitizar_relatorio(texto, fallback="[Dados indisponíveis]"):
    """
    Remove termos técnicos como 'undefined', 'null', 'NaN' e substitui por
    termos executivos amigáveis.
    """
    if texto is None:
        return fallback
    
    texto_str = str(texto)
    
    padroes_sujeira = [
        (r'\bundefined\b', fallback),
        (r'\bnull\b', fallback),
        (r'\bNaN\b', "[Valor não calculado]"),
        (r'\bNone\b', fallback),
        (r'\[object Object\]', "[Estrutura complexa]"),
    ]
    
    for padrao, subst in padroes_sujeira:
        texto_str = re.sub(padrao, subst, texto_str, flags=re.IGNORECASE)
    
    return texto_str

def formatar_latex_streamlit(texto):
    """
    Adapta a notação LaTeX para o padrão reconhecido pelo Streamlit.
    """
    if not texto: return ""
    
    texto = re.sub(r'\\\[(.*?)\\\]', r'$$\1$$', texto, flags=re.DOTALL)
    texto = re.sub(r'\\\((.*?)\\\)', r'$\1$', texto, flags=re.DOTALL)
    texto = re.sub(r'(?<!\\)\[\s*(.*?(?:\\text|\\frac|\\left|\\approx|\\sum).*?)\s*\]', r'$$\1$$', texto, flags=re.DOTALL)
    texto = re.sub(r'(?<!\$)(?<!\$)(?<!\\)(\\left\(.*?\\right\))(?!\$)', r'$\1$', texto)
    texto = re.sub(r'(?<!\$)(?<!\$)(?<!\\)(\\frac\{[^}]*\}\{[^}]*\})(?!\$)', r'$\1$', texto)
    texto = re.sub(r'(?<!\$)(?<!\$)(?<!\\)(\\approx\s*[\-\d,.]+\s*\\?%?)(?!\$)', r'$\1$', texto)
    
    return texto

def registrar_skill(nome: str, descricao: str):
    """Skill Logger: Registra a ativação de uma capacidade técnica no terminal."""
    logger.info(f"[Skill Active] 🚀 {nome}: {descricao}")
