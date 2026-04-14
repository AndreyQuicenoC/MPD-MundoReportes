"""
URLs de la aplicación de gastos.

Define las rutas para gestión de categorías, gastos automáticos y deducibles.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ListaCategoriasView,
    CrearCategoriaView,
    DetalleCategoriaView,
    CategoriasActivasView,
    GastoAutomaticoViewSet,
    GastoDeducibleViewSet,
)

app_name = "gastos"

router = DefaultRouter(trailing_slash=False)
router.register(r"automaticos", GastoAutomaticoViewSet, basename="gasto-automatico")
router.register(r"deducibles", GastoDeducibleViewSet, basename="gasto-deducible")

urlpatterns = [
    path("", include(router.urls)),
    path("categorias", ListaCategoriasView.as_view(), name="lista_categorias"),
    path("categorias/crear", CrearCategoriaView.as_view(), name="crear_categoria"),
    path("categorias/activas", CategoriasActivasView.as_view(), name="categorias_activas"),
    path("categorias/<int:pk>", DetalleCategoriaView.as_view(), name="detalle_categoria"),
]
