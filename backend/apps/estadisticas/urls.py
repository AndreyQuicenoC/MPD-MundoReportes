"""
URLs de la aplicación de estadísticas.

Define las rutas para consulta de métricas y análisis.
"""

from django.urls import path
from .views import (
    EstadisticasVentasView,
    EstadisticasGastosView,
    GastosPorCategoriaView,
    VentasPorMesView,
    ProductosMasVendidosView,
    ResumenPeriodoView,
    DashboardView,
    DeduciblesView,
)

app_name = "estadisticas"

urlpatterns = [
    path("ventas", EstadisticasVentasView.as_view(), name="estadisticas_ventas"),
    path("gastos", EstadisticasGastosView.as_view(), name="estadisticas_gastos"),
    path(
        "gastos/categorias",
        GastosPorCategoriaView.as_view(),
        name="gastos_por_categoria",
    ),
    path("ventas/mensuales", VentasPorMesView.as_view(), name="ventas_por_mes"),
    path(
        "productos/mas-vendidos",
        ProductosMasVendidosView.as_view(),
        name="productos_mas_vendidos",
    ),
    path("resumen", ResumenPeriodoView.as_view(), name="resumen_periodo"),
    path("dashboard", DashboardView.as_view(), name="dashboard"),
    path("deducibles", DeduciblesView.as_view(), name="deducibles"),
]
