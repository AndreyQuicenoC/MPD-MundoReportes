"""
Vistas para la aplicación de gastos.

Maneja el CRUD de categorías de gastos.
Los gastos individuales se gestionan a través de reportes.
"""

from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import CategoriaGasto
from .serializers import CategoriaGastoSerializer, CategoriaGastoListaSerializer
from apps.usuarios.permissions import EsAdministrador


class ListaCategoriasView(generics.ListAPIView):
    """
    Vista para listar todas las categorías de gastos.

    Permite filtrar por estado activo y buscar por nombre.
    """

    queryset = CategoriaGasto.objects.all()
    serializer_class = CategoriaGastoListaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["activa"]
    search_fields = ["nombre", "descripcion"]
    ordering_fields = ["nombre", "fecha_creacion"]
    ordering = ["nombre"]


class CrearCategoriaView(generics.CreateAPIView):
    """
    Vista para crear una nueva categoría de gasto.

    Solo administradores pueden crear categorías.
    """

    queryset = CategoriaGasto.objects.all()
    serializer_class = CategoriaGastoSerializer
    permission_classes = [IsAuthenticated, EsAdministrador]

    def create(self, request, *args, **kwargs):
        """
        Crear nueva categoría.

        Args:
            request: Request HTTP

        Returns:
            Response: Datos de la categoría creada
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        categoria = serializer.save()

        return Response(
            {
                "mensaje": "Categoría creada exitosamente",
                "categoria": CategoriaGastoSerializer(categoria).data,
            },
            status=status.HTTP_201_CREATED,
        )


class DetalleCategoriaView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para ver, actualizar o eliminar una categoría.

    Usuarios autenticados pueden ver.
    Solo administradores pueden modificar o eliminar.
    """

    queryset = CategoriaGasto.objects.all()
    serializer_class = CategoriaGastoSerializer
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
        Desactivar categoría en lugar de eliminarla.

        Args:
            request: Request HTTP

        Returns:
            Response: Confirmación
        """
        instance = self.get_object()
        instance.activa = False
        instance.save()

        return Response(
            {"mensaje": "Categoría desactivada exitosamente"},
            status=status.HTTP_200_OK,
        )


class CategoriasActivasView(generics.ListAPIView):
    """
    Vista para listar solo categorías activas.

    Útil para formularios de gastos donde solo se muestran
    categorías disponibles.
    """

    queryset = CategoriaGasto.objects.filter(activa=True)
    serializer_class = CategoriaGastoListaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nombre"]
    ordering_fields = ["nombre"]
    ordering = ["nombre"]
