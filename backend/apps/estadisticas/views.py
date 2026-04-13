"""
Vistas para la aplicación de estadísticas.

Proporciona endpoints para consultar métricas y análisis de datos.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import datetime

from .services import ServicioEstadisticas


class EstadisticasVentasView(APIView):
    """
    Vista para obtener estadísticas de ventas.

    Query params:
        - fecha_inicio: Fecha de inicio (YYYY-MM-DD)
        - fecha_fin: Fecha de fin (YYYY-MM-DD)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Obtener estadísticas de ventas para un periodo.

        Returns:
            Response: Estadísticas de ventas
        """
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")

        # Convertir strings a dates si existen
        if fecha_inicio:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_inicio inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if fecha_fin:
            try:
                fecha_fin = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_fin inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        estadisticas = ServicioEstadisticas.estadisticas_ventas(fecha_inicio, fecha_fin)

        return Response(estadisticas, status=status.HTTP_200_OK)


class EstadisticasGastosView(APIView):
    """
    Vista para obtener estadísticas de gastos.

    Query params:
        - fecha_inicio: Fecha de inicio (YYYY-MM-DD)
        - fecha_fin: Fecha de fin (YYYY-MM-DD)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Obtener estadísticas de gastos para un periodo.

        Returns:
            Response: Estadísticas de gastos
        """
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")

        # Convertir strings a dates si existen
        if fecha_inicio:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_inicio inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if fecha_fin:
            try:
                fecha_fin = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_fin inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        estadisticas = ServicioEstadisticas.estadisticas_gastos(fecha_inicio, fecha_fin)

        return Response(estadisticas, status=status.HTTP_200_OK)


class GastosPorCategoriaView(APIView):
    """
    Vista para obtener gastos agrupados por categoría.

    Query params:
        - fecha_inicio: Fecha de inicio (YYYY-MM-DD)
        - fecha_fin: Fecha de fin (YYYY-MM-DD)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Obtener gastos por categoría.

        Returns:
            Response: Gastos agrupados por categoría
        """
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")

        # Convertir strings a dates si existen
        if fecha_inicio:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_inicio inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if fecha_fin:
            try:
                fecha_fin = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_fin inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        gastos = ServicioEstadisticas.gastos_por_categoria(fecha_inicio, fecha_fin)

        return Response(gastos, status=status.HTTP_200_OK)


class VentasPorMesView(APIView):
    """
    Vista para obtener ventas agrupadas por mes.

    Query params:
        - anio: Año a consultar (opcional, por defecto año actual)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Obtener ventas por mes.

        Returns:
            Response: Ventas mensuales
        """
        anio = request.query_params.get("anio")

        if anio:
            try:
                anio = int(anio)
            except ValueError:
                return Response(
                    {"error": "El año debe ser un número entero"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        ventas = ServicioEstadisticas.ventas_por_mes(anio)

        return Response(ventas, status=status.HTTP_200_OK)


class ProductosMasVendidosView(APIView):
    """
    Vista para obtener los productos más vendidos.

    Query params:
        - fecha_inicio: Fecha de inicio (YYYY-MM-DD)
        - fecha_fin: Fecha de fin (YYYY-MM-DD)
        - limite: Cantidad de productos a retornar (default 10)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Obtener productos más vendidos.

        Returns:
            Response: Lista de productos más vendidos
        """
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")
        limite = request.query_params.get("limite", 10)

        # Convertir strings a dates si existen
        if fecha_inicio:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_inicio inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if fecha_fin:
            try:
                fecha_fin = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_fin inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            limite = int(limite)
        except ValueError:
            return Response(
                {"error": "El límite debe ser un número entero"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        productos = ServicioEstadisticas.productos_mas_vendidos(fecha_inicio, fecha_fin, limite)

        return Response(productos, status=status.HTTP_200_OK)


class ResumenPeriodoView(APIView):
    """
    Vista para obtener un resumen completo de un periodo.

    Query params (obligatorios):
        - fecha_inicio: Fecha de inicio (YYYY-MM-DD)
        - fecha_fin: Fecha de fin (YYYY-MM-DD)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Obtener resumen completo del periodo.

        Returns:
            Response: Resumen con todas las métricas
        """
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")

        if not fecha_inicio or not fecha_fin:
            return Response(
                {"error": "Se requieren fecha_inicio y fecha_fin"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Convertir strings a dates
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            fecha_fin = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Formato de fecha inválido. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar que el rango no sea mayor a 360 días
        diferencia = (fecha_fin - fecha_inicio).days
        if diferencia > 360:
            return Response(
                {"error": "El rango máximo permitido es de 360 días"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        resumen = ServicioEstadisticas.resumen_periodo(fecha_inicio, fecha_fin)

        return Response(resumen, status=status.HTTP_200_OK)


class DashboardView(APIView):
    """
    Vista para obtener datos del dashboard principal.

    Retorna KPIs y métricas clave del mes actual.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Obtener datos del dashboard.

        Returns:
            Response: KPIs del mes actual
        """
        from calendar import monthrange

        hoy = datetime.now().date()
        primer_dia_mes = hoy.replace(day=1)
        # Obtener el último día del mes actual
        ultimo_dia = monthrange(hoy.year, hoy.month)[1]
        ultimo_dia_mes = hoy.replace(day=ultimo_dia)

        # Estadísticas del mes actual completo
        ventas_mes = ServicioEstadisticas.estadisticas_ventas(primer_dia_mes, ultimo_dia_mes)
        gastos_mes = ServicioEstadisticas.estadisticas_gastos(primer_dia_mes, ultimo_dia_mes)
        gastos_categoria = ServicioEstadisticas.gastos_por_categoria(primer_dia_mes, ultimo_dia_mes)
        productos_top = ServicioEstadisticas.productos_mas_vendidos(
            primer_dia_mes, ultimo_dia_mes, limite=5
        )

        # Calcular categoría con mayor gasto
        categoria_mayor = None
        if gastos_categoria:
            categoria_mayor = max(gastos_categoria, key=lambda x: x["total"])

        dashboard = {
            "mes_actual": hoy.strftime("%Y-%m"),
            "total_ventas_mes": float(ventas_mes["total_ventas"]),
            "total_gastos_mes": float(gastos_mes["total_gastos"]),
            "promedio_ventas_diarias": float(ventas_mes["promedio_ventas"]),
            "cantidad_reportes": ventas_mes["total_reportes"],
            "categoria_mayor_gasto": categoria_mayor,
            "productos_mas_vendidos": productos_top,
        }

        return Response(dashboard, status=status.HTTP_200_OK)


class DeduciblesView(APIView):
    """
    Vista para obtener gastos deducibles agrupados por tipo.

    Calcula la suma de gastos cuyas categorías están marcadas como deducibles.

    Query params:
        - fecha_inicio: Fecha de inicio (YYYY-MM-DD)
        - fecha_fin: Fecha de fin (YYYY-MM-DD)
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Obtener deducibles por tipo en un periodo.

        Returns:
            Response: Diccionario con totales por tipo (ingreso, ahorro, transferencia)
        """
        fecha_inicio = request.query_params.get("fecha_inicio")
        fecha_fin = request.query_params.get("fecha_fin")

        # Convertir strings a dates si existen
        if fecha_inicio:
            try:
                fecha_inicio = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_inicio inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if fecha_fin:
            try:
                fecha_fin = datetime.strptime(fecha_fin, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Formato de fecha_fin inválido. Use YYYY-MM-DD"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        deducibles = ServicioEstadisticas.deducibles_por_tipo(fecha_inicio, fecha_fin)

        return Response(deducibles, status=status.HTTP_200_OK)
