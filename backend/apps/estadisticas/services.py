"""
Servicios de estadísticas para Mundo Reporte.

Contiene toda la lógica de análisis y agregación de datos
para generar métricas de negocio.
"""

from datetime import datetime
from decimal import Decimal
from django.db.models import Sum, Count, Avg, Max, Min
from django.db.models.functions import TruncMonth
from apps.reportes.models import ReporteDiario, VentaProducto
from apps.gastos.models import Gasto, GastoDeducible


class ServicioEstadisticas:
    """
    Servicio para generar estadísticas de ventas y gastos.

    Proporciona métodos para calcular métricas por diferentes periodos.
    """

    @staticmethod
    def estadisticas_ventas(fecha_inicio=None, fecha_fin=None):
        """
        Calcular estadísticas de ventas para un periodo.

        Args:
            fecha_inicio: Fecha de inicio del periodo (opcional)
            fecha_fin: Fecha de fin del periodo (opcional)

        Returns:
            dict: Diccionario con estadísticas de ventas
        """
        # Filtrar reportes por rango de fechas
        reportes = ReporteDiario.objects.all()

        if fecha_inicio:
            reportes = reportes.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            reportes = reportes.filter(fecha__lte=fecha_fin)

        # Calcular métricas
        agregados = reportes.aggregate(
            total_ventas=Sum("venta_total"),
            promedio_ventas=Avg("venta_total"),
            venta_maxima=Max("venta_total"),
            venta_minima=Min("venta_total"),
            cantidad_reportes=Count("id"),
            total_gastos=Sum("total_gastos"),
            total_entregas=Sum("entrega"),
        )

        return {
            "total_ventas": float(agregados["total_ventas"] or Decimal("0.00")),
            "promedio_ventas": float(agregados["promedio_ventas"] or Decimal("0.00")),
            "venta_maxima": float(agregados["venta_maxima"] or Decimal("0.00")),
            "venta_minima": float(agregados["venta_minima"] or Decimal("0.00")),
            "cantidad_reportes": agregados["cantidad_reportes"] or 0,
            "total_gastos": float(agregados["total_gastos"] or Decimal("0.00")),
            "total_entregas": float(agregados["total_entregas"] or Decimal("0.00")),
            "total_reportes": agregados["cantidad_reportes"] or 0,
            "periodo": {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
            },
        }

    @staticmethod
    def estadisticas_gastos(fecha_inicio=None, fecha_fin=None):
        """
        Calcular estadísticas de gastos para un periodo.

        Args:
            fecha_inicio: Fecha de inicio del periodo (opcional)
            fecha_fin: Fecha de fin del periodo (opcional)

        Returns:
            dict: Diccionario con estadísticas de gastos
        """
        # Filtrar reportes por rango de fechas
        reportes = ReporteDiario.objects.all()

        if fecha_inicio:
            reportes = reportes.filter(fecha__gte=fecha_inicio)
        if fecha_fin:
            reportes = reportes.filter(fecha__lte=fecha_fin)

        # Calcular métricas de reportes
        agregados_reportes = reportes.aggregate(
            suma_gastos=Sum("total_gastos"),
            promedio_gastos=Avg("total_gastos"),
            gasto_maximo=Max("total_gastos"),
            gasto_minimo=Min("total_gastos"),
        )

        # Calcular cantidad de gastos individuales
        gastos = Gasto.objects.filter(reporte__in=reportes)
        cantidad_gastos = gastos.count()

        return {
            "total_gastos": float(agregados_reportes["suma_gastos"] or Decimal("0.00")),
            "promedio_gastos": float(agregados_reportes["promedio_gastos"] or Decimal("0.00")),
            "gasto_maximo": float(agregados_reportes["gasto_maximo"] or Decimal("0.00")),
            "gasto_minimo": float(agregados_reportes["gasto_minimo"] or Decimal("0.00")),
            "cantidad_gastos": cantidad_gastos,
            "periodo": {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
            },
        }

    @staticmethod
    def gastos_por_categoria(fecha_inicio=None, fecha_fin=None):
        """
        Calcular gastos agrupados por categoría.

        Args:
            fecha_inicio: Fecha de inicio del periodo (opcional)
            fecha_fin: Fecha de fin del periodo (opcional)

        Returns:
            list: Lista de diccionarios con gastos por categoría
        """
        # Filtrar gastos por rango de fechas
        gastos = Gasto.objects.all()

        if fecha_inicio:
            gastos = gastos.filter(reporte__fecha__gte=fecha_inicio)
        if fecha_fin:
            gastos = gastos.filter(reporte__fecha__lte=fecha_fin)

        # Agrupar por categoría
        gastos_categorizados = (
            gastos.filter(categoria__isnull=False)
            .values("categoria__nombre")
            .annotate(total=Sum("valor"), cantidad=Count("id"))
            .order_by("-total")
        )

        # Calcular gastos sin categoría
        gastos_sin_categoria = gastos.filter(categoria__isnull=True).aggregate(
            total=Sum("valor"), cantidad=Count("id")
        )

        resultado = [
            {
                "categoria": item["categoria__nombre"],
                "total": float(item["total"]),
                "cantidad": item["cantidad"],
            }
            for item in gastos_categorizados
        ]

        # Agregar gastos sin categoría si existen
        if gastos_sin_categoria["total"]:
            resultado.append(
                {
                    "categoria": "Sin categoría",
                    "total": float(gastos_sin_categoria["total"]),
                    "cantidad": gastos_sin_categoria["cantidad"],
                }
            )

        return resultado

    @staticmethod
    def ventas_por_mes(anio=None):
        """
        Calcular ventas agrupadas por mes.

        Args:
            anio: Año a analizar (opcional, por defecto año actual)

        Returns:
            list: Lista de diccionarios con ventas por mes
        """
        if anio is None:
            anio = datetime.now().year

        reportes = ReporteDiario.objects.filter(fecha__year=anio)

        ventas_mensuales = (
            reportes.annotate(mes=TruncMonth("fecha"))
            .values("mes")
            .annotate(
                total_ventas=Sum("venta_total"),
                total_gastos=Sum("total_gastos"),
                cantidad_reportes=Count("id"),
            )
            .order_by("mes")
        )

        return [
            {
                "mes": item["mes"].month,
                "anio": item["mes"].year,
                "total_ventas": float(item["total_ventas"] or 0),
                "total_gastos": float(item["total_gastos"] or 0),
                "utilidad": float((item["total_ventas"] or 0) - (item["total_gastos"] or 0)),
                "cantidad_reportes": item["cantidad_reportes"],
            }
            for item in ventas_mensuales
        ]

    @staticmethod
    def productos_mas_vendidos(fecha_inicio=None, fecha_fin=None, limite=10):
        """
        Obtener los productos más vendidos en un periodo.

        Args:
            fecha_inicio: Fecha de inicio del periodo (opcional)
            fecha_fin: Fecha de fin del periodo (opcional)
            limite: Cantidad máxima de productos a retornar

        Returns:
            list: Lista de productos más vendidos
        """
        ventas = VentaProducto.objects.all()

        if fecha_inicio:
            ventas = ventas.filter(reporte__fecha__gte=fecha_inicio)
        if fecha_fin:
            ventas = ventas.filter(reporte__fecha__lte=fecha_fin)

        productos_vendidos = (
            ventas.values("producto__nombre")
            .annotate(
                cantidad_total=Sum("cantidad"),
                valor_total=Sum("precio_unitario_momento"),
            )
            .order_by("-cantidad_total")[:limite]
        )

        return [
            {
                "producto": item["producto__nombre"],
                "cantidad_total": item["cantidad_total"],
                "valor_total": float(item["valor_total"] or 0),
            }
            for item in productos_vendidos
        ]

    @staticmethod
    def resumen_periodo(fecha_inicio, fecha_fin):
        """
        Generar un resumen completo de un periodo.

        Args:
            fecha_inicio: Fecha de inicio
            fecha_fin: Fecha de fin

        Returns:
            dict: Resumen completo con todas las métricas
        """
        return {
            "periodo": {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin,
            },
            "ventas": ServicioEstadisticas.estadisticas_ventas(fecha_inicio, fecha_fin),
            "gastos": ServicioEstadisticas.estadisticas_gastos(fecha_inicio, fecha_fin),
            "gastos_por_categoria": ServicioEstadisticas.gastos_por_categoria(
                fecha_inicio, fecha_fin
            ),
            "productos_mas_vendidos": ServicioEstadisticas.productos_mas_vendidos(
                fecha_inicio, fecha_fin, limite=5
            ),
        }

    @staticmethod
    def deducibles_por_tipo(fecha_inicio=None, fecha_fin=None):
        """
        Calcular gastos deducibles agrupados por tipo.

        Suma los valores de gastos cuyas categorías están marcadas como deducibles,
        agrupado por tipo (ingreso, ahorro, transferencia).

        Args:
            fecha_inicio: Fecha de inicio del periodo (opcional)
            fecha_fin: Fecha de fin del periodo (opcional)

        Returns:
            dict: Diccionario con totales por tipo de deducible
        """
        # Obtener todos los gastos en el rango de fechas
        gastos = Gasto.objects.all()

        if fecha_inicio:
            gastos = gastos.filter(reporte__fecha__gte=fecha_inicio)
        if fecha_fin:
            gastos = gastos.filter(reporte__fecha__lte=fecha_fin)

        # Obtener todas las categorías marcadas como deducibles
        deducibles_map = {}
        for deducible in GastoDeducible.objects.filter(activo=True):
            deducibles_map[deducible.categoria_id] = deducible.tipo

        # Inicializar diccionario de totales
        totales = {
            'ingreso': 0.0,
            'ahorro': 0.0,
            'transferencia': 0.0,
            'total_deducible': 0.0,
        }

        # Sumar los gastos que son deducibles
        for gasto in gastos:
            if gasto.categoria_id in deducibles_map:
                tipo = deducibles_map[gasto.categoria_id]
                valor = float(gasto.valor or Decimal('0.00'))
                totales[tipo] += valor
                totales['total_deducible'] += valor

        return totales
