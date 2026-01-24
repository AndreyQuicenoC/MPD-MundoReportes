"""
Configuración del admin de Django para reportes.
"""

from django.contrib import admin
from .models import ReporteDiario, VentaProducto


class VentaProductoInline(admin.TabularInline):
    """
    Inline para mostrar ventas de productos en el admin de reportes.
    """

    model = VentaProducto
    extra = 0
    fields = ["producto", "cantidad", "precio_unitario_momento", "subtotal"]
    readonly_fields = ["subtotal"]


@admin.register(ReporteDiario)
class ReporteDiarioAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo ReporteDiario.
    """

    list_display = [
        "fecha",
        "venta_total",
        "total_gastos",
        "base_siguiente",
        "usuario_creacion",
        "fecha_creacion",
    ]
    list_filter = ["fecha", "fecha_creacion"]
    search_fields = ["observacion"]
    ordering = ["-fecha"]
    readonly_fields = [
        "total_gastos",
        "base_siguiente",
        "fecha_creacion",
        "fecha_actualizacion",
    ]

    fieldsets = (
        ("Información del Reporte", {"fields": ("fecha", "usuario_creacion")}),
        (
            "Valores Monetarios",
            {
                "fields": (
                    "base_inicial",
                    "venta_total",
                    "total_gastos",
                    "entrega",
                    "base_siguiente",
                )
            },
        ),
        ("Observaciones", {"fields": ("observacion",)}),
        (
            "Fechas",
            {"fields": ("fecha_creacion", "fecha_actualizacion"), "classes": ("collapse",)},
        ),
    )

    inlines = [VentaProductoInline]


@admin.register(VentaProducto)
class VentaProductoAdmin(admin.ModelAdmin):
    """
    Configuración del admin para el modelo VentaProducto.
    """

    list_display = [
        "reporte",
        "producto",
        "cantidad",
        "precio_unitario_momento",
        "subtotal",
    ]
    list_filter = ["fecha_creacion"]
    search_fields = ["producto__nombre", "reporte__fecha"]
    ordering = ["-fecha_creacion"]
    raw_id_fields = ["reporte", "producto"]

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "reporte",
                    "producto",
                    "cantidad",
                    "precio_unitario_momento",
                )
            },
        ),
        ("Fechas", {"fields": ("fecha_creacion",), "classes": ("collapse",)}),
    )

    readonly_fields = ["fecha_creacion"]
