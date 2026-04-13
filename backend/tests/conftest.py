import pytest
from unittest.mock import patch

@pytest.fixture(autouse=True)
def mock_warmup():
    with patch("main._warmup_cache"):
        yield
