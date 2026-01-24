"""
Vistas para la aplicación de reportes.

Maneja el CRUD de reportes diarios con toda su lógica de negocio.
"""

from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import ReporteDiario
from .serializers import (
    ReporteDiarioSerializer,
    ReporteDiarioListaSerializer,
    CrearReporteDiarioSerializer,
    ActualizarReporteDiarioSerializer,
)
from .services import ServicioReporte


class ListaReportesView(generics.ListAPIView):
    """
    Vista para listar reportes diarios.

    Permite filtrar por rango de fechas y buscar por observaciones.
    """

    queryset = ReporteDiario.objects.all()
    serializer_class = ReporteDiarioListaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["observacion"]
    ordering_fields = ["fecha", "venta_total", "total_gastos", "fecha_creacion"]
    ordering = ["-fecha"]

    def get_queryset(self):
        """
        Filtrar reportes por rango de fechas si se proporcionan.

        Query params:
            - fecha_inicio: Fecha de inicio (YYYY-MM-DD)
            - fecha_fin: Fecha de fin (YYYY-MM-DD)

        Returns:
            QuerySet: Reportes filtrados
        """
        queryset = super().get_queryset()

        fecha_inicio = self.request.query_params.get("fecha_inicio")
        fecha_fin = self.request.query_params.get("fecha_fin")

        if fecha_inicio:
            queryset = queryset.filter(fecha__gte=fecha_inicio)

        if fecha_fin:
            queryset = queryset.filter(fecha__lte=fecha_fin)

        return queryset


class CrearReporteView(APIView):
    """
    Vista para crear un nuevo reporte diario.

    Usa el servicio de dominio para manejar la lógica de negocio.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Crear nuevo reporte con gastos y ventas de productos.

        Args:
            request: Request HTTP con datos del reporte

        Returns:
            Response: Reporte creado con todos sus datos
        """
        serializer = CrearReporteDiarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Extraer datos
            datos_reporte = {
                "fecha": serializer.validated_data["fecha"],
                "base_inicial": serializer.validated_data["base_inicial"],
                "venta_total": serializer.validated_data["venta_total"],
                "entrega": serializer.validated_data["entrega"],
                "observacion": serializer.validated_data["observacion"],
            }

            gastos_data = [
                {
                    "descripcion": g["descripcion"],
                    "valor": g["valor"],
                    "categoria": g.get("categoria"),
                }
                for g in serializer.validated_data["gastos"]
            ]

            ventas_data = [
                {
                    "producto": v["producto"].id,
                    "cantidad": v["cantidad"],
                }
                for v in serializer.validated_data["ventas_productos"]
            ]

            # Crear reporte usando el servicio
            reporte = ServicioReporte.crear_reporte(
                datos_reporte=datos_reporte,
                gastos_data=gastos_data,
                ventas_productos_data=ventas_data,
                usuario=request.user,
            )

            # Retornar reporte creado
            return Response(
                {
                    "mensaje": "Reporte creado exitosamente",
                    "reporte": ReporteDiarioSerializer(reporte).data,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class DetalleReporteView(generics.RetrieveAPIView):
    """
    Vista para ver el detalle completo de un reporte.

    Incluye todos los gastos y ventas de productos.
    """

    queryset = ReporteDiario.objects.all()
    serializer_class = ReporteDiarioSerializer
    permission_classes = [IsAuthenticated]


class ActualizarReporteView(APIView):
    """
    Vista para actualizar un reporte existente.

    Usa el servicio de dominio para manejar la lógica de negocio.
    """

    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        """
        Actualizar reporte completo.

        Args:
            request: Request HTTP con datos actualizados
            pk: ID del reporte

        Returns:
            Response: Reporte actualizado
        """
        try:
            reporte = ReporteDiario.objects.get(pk=pk)
        except ReporteDiario.DoesNotExist:
            return Response(
                {"error": "Reporte no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ActualizarReporteDiarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            # Extraer datos
            datos_reporte = {}
            if "base_inicial" in serializer.validated_data:
                datos_reporte["base_inicial"] = serializer.validated_data["base_inicial"]
            if "venta_total" in serializer.validated_data:
                datos_reporte["venta_total"] = serializer.validated_data["venta_total"]
            if "entrega" in serializer.validated_data:
                datos_reporte["entrega"] = serializer.validated_data["entrega"]
            if "observacion" in serializer.validated_data:
                datos_reporte["observacion"] = serializer.validated_data["observacion"]

            gastos_data = None
            if "gastos" in serializer.validated_data:
                gastos_data = [
                    {
                        "descripcion": g["descripcion"],
                        "valor": g["valor"],
                        "categoria": g.get("categoria"),
                    }
                    for g in serializer.validated_data["gastos"]
                ]

            ventas_data = None
            if "ventas_productos" in serializer.validated_data:
                ventas_data = [
                    {
                        "producto": v["producto"].id,
                        "cantidad": v["cantidad"],
                    }
                    for v in serializer.validated_data["ventas_productos"]
                ]

            # Actualizar usando el servicio
            reporte = ServicioReporte.actualizar_reporte(
                reporte=reporte,
                datos_reporte=datos_reporte,
                gastos_data=gastos_data,
                ventas_productos_data=ventas_data,
            )

            return Response(
                {
                    "mensaje": "Reporte actualizado exitosamente",
                    "reporte": ReporteDiarioSerializer(reporte).data,
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )


class EliminarReporteView(generics.DestroyAPIView):
    """
    Vista para eliminar un reporte.

    Solo administradores pueden eliminar reportes.
    """

    queryset = ReporteDiario.objects.all()
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        """
        Eliminar reporte.

        Args:
            request: Request HTTP

        Returns:
            Response: Confirmación
        """
        instance = self.get_object()
        fecha = instance.fecha
        instance.delete()

        return Response(
            {"mensaje": f"Reporte del {fecha} eliminado exitosamente"},
            status=status.HTTP_200_OK,
        )


class EstadisticasReporteView(APIView):
    """
    Vista para obtener estadísticas de un reporte específico.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        """
        Obtener estadísticas del reporte.

        Args:
            request: Request HTTP
            pk: ID del reporte

        Returns:
            Response: Estadísticas calculadas
        """
        try:
            reporte = ReporteDiario.objects.get(pk=pk)
        except ReporteDiario.DoesNotExist:
            return Response(
                {"error": "Reporte no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )

        estadisticas = ServicioReporte.calcular_estadisticas_reporte(reporte)

        return Response(estadisticas, status=status.HTTP_200_OK)
