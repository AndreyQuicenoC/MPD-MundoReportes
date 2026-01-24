"""
URLs de la aplicación de gastos.

Define las rutas para gestión de categorías de gastos.
"""

from django.urls import path
from .views import (
    ListaCategoriasView,
    CrearCategoriaView,
    DetalleCategoriaView,
    CategoriasActivasView,
)

app_name = "gastos"

urlpatterns = [
    path("categorias/", ListaCategoriasView.as_view(), name="lista_categorias"),
    path("categorias/crear/", CrearCategoriaView.as_view(), name="crear_categoria"),
    path("categorias/activas/", CategoriasActivasView.as_view(), name="categorias_activas"),
    path("categorias/<int:pk>/", DetalleCategoriaView.as_view(), name="detalle_categoria"),
]
