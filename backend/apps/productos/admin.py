"""
Configuración del admin de Django para productos.
"""

from django.contrib import admin
from .models import Producto


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Producto.
    """

    list_display = ["nombre", "precio_unitario", "activo", "fecha_creacion"]
    list_filter = ["activo", "fecha_creacion"]
    search_fields = ["nombre"]
    ordering = ["nombre"]

    fieldsets = (
        (None, {"fields": ("nombre", "precio_unitario")}),
        ("Estado", {"fields": ("activo",)}),
        (
            "Fechas",
            {"fields": ("fecha_creacion", "fecha_actualizacion"), "classes": ("collapse",)},
        ),
    )

    readonly_fields = ["fecha_creacion", "fecha_actualizacion"]
