"""
Configuración del admin de Django para gastos.
"""

from django.contrib import admin
from .models import CategoriaGasto, Gasto


@admin.register(CategoriaGasto)
class CategoriaGastoAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo CategoriaGasto.
    """

    list_display = ["nombre", "activa", "fecha_creacion"]
    list_filter = ["activa", "fecha_creacion"]
    search_fields = ["nombre", "descripcion"]
    ordering = ["nombre"]

    fieldsets = (
        (None, {"fields": ("nombre", "descripcion")}),
        ("Estado", {"fields": ("activa",)}),
        (
            "Fechas",
            {"fields": ("fecha_creacion", "fecha_actualizacion"), "classes": ("collapse",)},
        ),
    )

    readonly_fields = ["fecha_creacion", "fecha_actualizacion"]


@admin.register(Gasto)
class GastoAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo Gasto.
    """

    list_display = ["descripcion", "valor", "categoria", "reporte", "fecha_creacion"]
    list_filter = ["categoria", "fecha_creacion"]
    search_fields = ["descripcion"]
    ordering = ["-fecha_creacion"]
    raw_id_fields = ["reporte"]

    fieldsets = (
        (None, {"fields": ("reporte", "descripcion", "valor", "categoria")}),
        ("Fechas", {"fields": ("fecha_creacion",), "classes": ("collapse",)}),
    )

    readonly_fields = ["fecha_creacion"]
