"""
Vistas para la aplicación de productos.

Maneja el CRUD de productos del catálogo.
"""

from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Producto
from .serializers import ProductoSerializer, ProductoListaSerializer
from apps.usuarios.permissions import EsAdministrador


class ListaProductosView(generics.ListAPIView):
    """
    Vista para listar todos los productos.

    Permite filtrar por estado activo y buscar por nombre.
    Usuarios autenticados pueden ver todos los productos.
    """

    queryset = Producto.objects.all()
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

    Solo administradores pueden crear productos.
    """

    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated, EsAdministrador]

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
    Solo administradores pueden modificar o eliminar.
    """

    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        Permisos dinámicos según el método HTTP.

        Returns:
            list: Lista de permisos
        """
        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), EsAdministrador()]
        return [IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        """
        Desactivar producto en lugar de eliminarlo.

        Args:
            request: Request HTTP

        Returns:
            Response: Confirmación
        """
        instance = self.get_object()
        instance.activo = False
        instance.save()

        return Response(
            {"mensaje": "Producto desactivado exitosamente"},
            status=status.HTTP_200_OK,
        )


class ProductosActivosView(generics.ListAPIView):
    """
    Vista para listar solo productos activos.

    Útil para formularios de ventas donde solo se muestran
    productos disponibles.
    """

    queryset = Producto.objects.filter(activo=True)
    serializer_class = ProductoListaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nombre"]
    ordering_fields = ["nombre", "precio_unitario"]
    ordering = ["nombre"]
