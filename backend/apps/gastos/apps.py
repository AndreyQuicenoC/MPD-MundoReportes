"""
Configuración de la app gastos.
"""

from django.apps import AppConfig


class GastosConfig(AppConfig):
    """Configuración de la aplicación de gastos."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.gastos"
    verbose_name = "Gastos"
