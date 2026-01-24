"""
Configuración de pytest para el proyecto.

Define fixtures compartidos y configuración general de tests.
"""

import pytest
from django.conf import settings


@pytest.fixture(scope="session")
def django_db_setup():
    """Configura la base de datos de pruebas."""
    settings.DATABASES["default"] = {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }


@pytest.fixture(autouse=True)
def enable_db_access_for_all_tests(db):
    """Habilita acceso a BD para todos los tests."""
    pass
