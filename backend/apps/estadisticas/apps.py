"""
Configuración de la app estadísticas.
"""

from django.apps import AppConfig


class EstadisticasConfig(AppConfig):
    """Configuración de la aplicación de estadísticas."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.estadisticas"
    verbose_name = "Estadísticas"
