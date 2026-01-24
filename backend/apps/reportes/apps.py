"""
Configuración de la app reportes.
"""

from django.apps import AppConfig


class ReportesConfig(AppConfig):
    """Configuración de la aplicación de reportes."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.reportes"
    verbose_name = "Reportes"
