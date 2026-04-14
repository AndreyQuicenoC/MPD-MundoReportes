"""
Vistas para la aplicación de productos.

Maneja el CRUD de productos del catálogo.
"""

from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .models import Producto
from .serializers import ProductoSerializer, ProductoListaSerializer
from apps.usuarios.permissions import EsOperarioOAdmin


class ListaProductosView(generics.ListAPIView):
    """
    Vista para listar todos los productos.

    Permite filtrar por estado activo y buscar por nombre.
    Usuarios autenticados pueden ver todos los productos.
    """

    queryset = Producto.objects.filter(deleted=False)
    serializer_class = ProductoListaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["activo"]
    search_fields = ["nombre"]
    ordering_fields = ["nombre", "precio_unitario", "fecha_creacion"]
    ordering = ["nombre"]


class CrearProductoView(generics.CreateAPIView):
    """
    Vista para crear un nuevo producto.

    Administradores y operarios pueden crear productos.
    """

    queryset = Producto.objects.filter(deleted=False)
    serializer_class = ProductoSerializer
    permission_classes = [EsOperarioOAdmin]

    def create(self, request, *args, **kwargs):
        """
        Crear nuevo producto.

        Args:
            request: Request HTTP

        Returns:
            Response: Datos del producto creado
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        producto = serializer.save()

        return Response(
            {
                "mensaje": "Producto creado exitosamente",
                "producto": ProductoSerializer(producto).data,
            },
            status=status.HTTP_201_CREATED,
        )


class DetalleProductoView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para ver, actualizar o eliminar un producto.

    Usuarios autenticados pueden ver.
    Administradores y operarios pueden modificar o eliminar.
    """

    queryset = Producto.objects.filter(deleted=False)
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        Permisos dinámicos según el método HTTP.

        Returns:
            list: Lista de permisos
        """
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), EsOperarioOAdmin()]
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        """
        Eliminar permanentemente un producto.

        Args:
            request: Request HTTP

        Returns:
            Response: Confirmación
        """
        instance = self.get_object()
        instance.deleted = True
        instance.save()

        return Response(
            {"mensaje": "Producto eliminado permanentemente"},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def desactivar(self, request, pk=None):
        """
        Desactivar o activar un producto.

        Args:
            request: Request HTTP
            pk: Product ID

        Returns:
            Response: Confirmación
        """
        producto = self.get_object()
        nuevo_estado = not producto.activo
        producto.activo = nuevo_estado
        producto.save()

        accion = "Desactivado" if not nuevo_estado else "Activado"
        return Response(
            {"mensaje": f"Producto {accion.lower()} exitosamente"},
            status=status.HTTP_200_OK,
        )


class ProductosActivosView(generics.ListAPIView):
    """
    Vista para listar solo productos activos.

    Útil para formularios de ventas donde solo se muestran
    productos disponibles.
    """

    queryset = Producto.objects.filter(activo=True, deleted=False)
    serializer_class = ProductoListaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nombre"]
    ordering_fields = ["nombre", "precio_unitario"]
    ordering = ["nombre"]
