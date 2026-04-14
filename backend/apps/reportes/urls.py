"""
URLs de la aplicación de reportes.

Define las rutas para gestión de reportes diarios.
"""

from django.urls import path
from .views import (
    ListaReportesView,
    CrearReporteView,
    DetalleReporteView,
    ActualizarReporteView,
    EliminarReporteView,
    EstadisticasReporteView,
)

app_name = "reportes"

urlpatterns = [
    path("", ListaReportesView.as_view(), name="lista_reportes"),
    path("crear", CrearReporteView.as_view(), name="crear_reporte"),
    path("<int:pk>", DetalleReporteView.as_view(), name="detalle_reporte"),
    path("<int:pk>/actualizar", ActualizarReporteView.as_view(), name="actualizar_reporte"),
    path("<int:pk>/eliminar", EliminarReporteView.as_view(), name="eliminar_reporte"),
    path(
        "<int:pk>/estadisticas",
        EstadisticasReporteView.as_view(),
        name="estadisticas_reporte",
    ),
]
