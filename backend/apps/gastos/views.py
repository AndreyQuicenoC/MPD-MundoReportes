"""
Vistas para la aplicación de gastos.

Maneja el CRUD de categorías de gastos, gastos automáticos
y gastos deducibles. Los gastos individuales se gestionan a través de reportes.
"""

from rest_framework import generics, status, filters, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import CategoriaGasto, GastoAutomatico, GastoDeducible
from .serializers import (
    CategoriaGastoSerializer,
    CategoriaGastoListaSerializer,
    GastoAutomaticoSerializer,
    GastoDeducibleSerializer,
)
from apps.usuarios.permissions import EsAdministrador, EsOperarioOAdmin


class ListaCategoriasView(generics.ListAPIView):
    """
    Vista para listar todas las categorías de gastos.

    Permite filtrar por estado activo y buscar por nombre.
    """

    queryset = CategoriaGasto.objects.all()
    serializer_class = CategoriaGastoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["activa"]
    search_fields = ["nombre", "descripcion"]
    ordering_fields = ["nombre", "fecha_creacion"]
    ordering = ["nombre"]


class CrearCategoriaView(generics.CreateAPIView):
    """
    Vista para crear una nueva categoría de gasto.

    Administradores y operarios pueden crear categorías.
    """

    queryset = CategoriaGasto.objects.all()
    serializer_class = CategoriaGastoSerializer
    permission_classes = [EsOperarioOAdmin]

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
    Administradores y operarios pueden modificar o eliminar.
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
            return [IsAuthenticated(), EsOperarioOAdmin()]
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


class GastoAutomaticoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar gastos automáticos predefinidos.

    Endpoints:
    - GET /api/gastos-automaticos/ - Listar gastos automáticos
    - POST /api/gastos-automaticos/ - Crear gasto automático
    - GET /api/gastos-automaticos/{id}/ - Ver detalle
    - PUT/PATCH /api/gastos-automaticos/{id}/ - Actualizar
    - DELETE /api/gastos-automaticos/{id}/ - Eliminar
    """

    queryset = GastoAutomatico.objects.filter(activo=True)
    serializer_class = GastoAutomaticoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["categoria", "activo"]
    search_fields = ["descripcion", "categoria__nombre"]
    ordering_fields = ["categoria", "descripcion"]
    ordering = ["categoria", "descripcion"]

    def get_permissions(self):
        """Permisos dinámicos: lectura para todos, escritura para admin/operario."""
        if self.request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), EsOperarioOAdmin()]
        return [IsAuthenticated()]


class GastoDeducibleViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar categorías de gastos deducibles.

    Los deducibles son categorías que, aunque se registran como gastos,
    representan ingresos o ahorros y se restan del total de gastos.

    Endpoints:
    - GET /api/gastos-deducibles/ - Listar deducibles
    - POST /api/gastos-deducibles/ - Crear deducible
    - GET /api/gastos-deducibles/{id}/ - Ver detalle
    - PUT/PATCH /api/gastos-deducibles/{id}/ - Actualizar
    - DELETE /api/gastos-deducibles/{id}/ - Eliminar
    """

    queryset = GastoDeducible.objects.filter(activo=True)
    serializer_class = GastoDeducibleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["tipo", "activo"]
    search_fields = ["categoria__nombre", "descripcion"]
    ordering_fields = ["categoria", "tipo"]
    ordering = ["categoria"]

    def get_permissions(self):
        """Permisos dinámicos: operarios y admin pueden crear/modificar deducibles."""
        if self.request.method in ["POST", "PUT", "PATCH", "DELETE"]:
            return [IsAuthenticated(), EsOperarioOAdmin()]
        return [IsAuthenticated()]
