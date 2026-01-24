"""
Configuración de la app productos.
"""

from django.apps import AppConfig


class ProductosConfig(AppConfig):
    """Configuración de la aplicación de productos."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.productos"
    verbose_name = "Productos"
