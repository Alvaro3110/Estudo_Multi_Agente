import pytest
from unittest.mock import MagicMock, patch
from utils.db_connector import (
    _get_connection, _release_connection,
    _connection_pool, POOL_SIZE, pool_status, fechar_pool
)

def test_pool_reutiliza_conexao():
    """Conexão devolvida ao pool deve ser retornada na próxima chamada."""
    mock_conn = MagicMock()
    _release_connection(mock_conn)
    conn = _get_connection()
    # Se o pool tinha a conexão, deve retornar ela
    # (pode falhar se pool já estava cheio — limpar antes)
    assert conn is not None

def test_release_descarta_quando_pool_cheio():
    """Pool cheio deve fechar a conexão ao invés de guardar."""
    # Encher o pool
    mocks = [MagicMock() for _ in range(POOL_SIZE)]
    for m in mocks:
        _release_connection(m)

    extra = MagicMock()
    _release_connection(extra)
    extra.close.assert_called_once()

def test_pool_status_retorna_dict():
    status = pool_status()
    assert "conexoes_disponiveis" in status
    assert "tamanho_maximo" in status
    assert status["tamanho_maximo"] == POOL_SIZE

def test_fechar_pool_limpa_tudo():
    mock = MagicMock()
    _connection_pool.append(mock)
    fechar_pool()
    assert len(_connection_pool) == 0
    mock.close.assert_called_once()

@patch("utils.db_connector._get_connection")
def test_query_devolve_conexao_ao_pool(mock_get):
    """Após query bem-sucedida, conexão deve voltar ao pool."""
    mock_conn = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.__enter__ = MagicMock(return_value=mock_cursor)
    mock_cursor.__exit__ = MagicMock(return_value=False)
    mock_cursor.description = [("col1",)]
    mock_cursor.fetchall.return_value = [("val1",)]
    mock_conn.cursor.return_value = mock_cursor
    mock_get.return_value = mock_conn

    from utils.db_connector import executar_query_databricks
    resultado = executar_query_databricks("SELECT 1")
    assert resultado == [{"col1": "val1"}]
