"""
Vistas para la aplicación de gastos.

Maneja el CRUD de categorías de gastos, gastos automáticos
y gastos deducibles. Los gastos individuales se gestionan a través de reportes.
"""

from rest_framework import generics, status, filters, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .models import CategoriaGasto, GastoAutomatico, GastoDeducible
from .serializers import (
    CategoriaGastoSerializer,
    CategoriaGastoListaSerializer,
    GastoAutomaticoSerializer,
    GastoDeducibleSerializer,
)
from apps.usuarios.permissions import EsOperarioOAdmin


class ListaCategoriasView(generics.ListAPIView):
    """
    Vista para listar todas las categorías de gastos.

    Permite filtrar por estado activo y buscar por nombre.
    """

    queryset = CategoriaGasto.objects.filter(deleted=False)
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

    queryset = CategoriaGasto.objects.filter(deleted=False)
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
        Eliminar permanentemente una categoría.

        Args:
            request: Request HTTP

        Returns:
            Response: Confirmación
        """
        instance = self.get_object()
        instance.deleted = True
        instance.save()

        return Response(
            {"mensaje": "Categoría eliminada permanentemente"},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def desactivar(self, request, pk=None):
        """
        Desactivar o activar una categoría.

        Args:
            request: Request HTTP
            pk: Category ID

        Returns:
            Response: Confirmación
        """
        categoria = self.get_object()
        nuevo_estado = not categoria.activa
        categoria.activa = nuevo_estado
        categoria.save()

        accion = "Desactivada" if not nuevo_estado else "Activada"
        return Response(
            {"mensaje": f"Categoría {accion.lower()} exitosamente"},
            status=status.HTTP_200_OK,
        )


class CategoriasActivasView(generics.ListAPIView):
    """
    Vista para listar solo categorías activas.

    Útil para formularios de gastos donde solo se muestran
    categorías disponibles.
    """

    queryset = CategoriaGasto.objects.filter(activa=True, deleted=False)
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

    queryset = GastoAutomatico.objects.filter(deleted=False)
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

    def destroy(self, request, *args, **kwargs):
        """
        Eliminar permanentemente un gasto automático.

        Args:
            request: Request HTTP

        Returns:
            Response: Confirmación
        """
        instance = self.get_object()
        instance.deleted = True
        instance.save()

        return Response(
            {"mensaje": "Gasto automático eliminado permanentemente"},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def desactivar(self, request, pk=None):
        """
        Desactivar o activar un gasto automático.

        Args:
            request: Request HTTP
            pk: GastoAutomatico ID

        Returns:
            Response: Confirmación
        """
        gasto = self.get_object()
        nuevo_estado = not gasto.activo
        gasto.activo = nuevo_estado
        gasto.save()

        accion = "Desactivado" if not nuevo_estado else "Activado"
        return Response(
            {"mensaje": f"Gasto automático {accion.lower()} exitosamente"},
            status=status.HTTP_200_OK,
        )


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

    queryset = GastoDeducible.objects.filter(deleted=False)
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

    def destroy(self, request, *args, **kwargs):
        """
        Eliminar permanentemente un gasto deducible.

        Args:
            request: Request HTTP

        Returns:
            Response: Confirmación
        """
        instance = self.get_object()
        instance.deleted = True
        instance.save()

        return Response(
            {"mensaje": "Gasto deducible eliminado permanentemente"},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def desactivar(self, request, pk=None):
        """
        Desactivar o activar un gasto deducible.

        Args:
            request: Request HTTP
            pk: GastoDeducible ID

        Returns:
            Response: Confirmación
        """
        deducible = self.get_object()
        nuevo_estado = not deducible.activo
        deducible.activo = nuevo_estado
        deducible.save()

        accion = "Desactivado" if not nuevo_estado else "Activado"
        return Response(
            {"mensaje": f"Gasto deducible {accion.lower()} exitosamente"},
            status=status.HTTP_200_OK,
        )
