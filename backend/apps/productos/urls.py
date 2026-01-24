"""
URLs de la aplicación de productos.

Define las rutas para gestión de productos.
"""

from django.urls import path
from .views import (
    ListaProductosView,
    CrearProductoView,
    DetalleProductoView,
    ProductosActivosView,
)

app_name = "productos"

urlpatterns = [
    path("", ListaProductosView.as_view(), name="lista_productos"),
    path("crear/", CrearProductoView.as_view(), name="crear_producto"),
    path("activos/", ProductosActivosView.as_view(), name="productos_activos"),
    path("<int:pk>/", DetalleProductoView.as_view(), name="detalle_producto"),
]
