"""
Servicios de dominio para reportes.

Contiene toda la lógica de negocio relacionada con reportes diarios.
Los servicios encapsulan operaciones complejas y cálculos del dominio.
"""

from decimal import Decimal
from django.db import transaction
from apps.reportes.models import ReporteDiario, VentaProducto
from apps.gastos.models import Gasto
from apps.productos.models import Producto


class ServicioReporte:
    """
    Servicio para gestionar reportes diarios.

    Centraliza la lógica de negocio de creación, actualización
    y cálculos de reportes.
    """

    @staticmethod
    @transaction.atomic
    def crear_reporte(datos_reporte, gastos_data, ventas_productos_data, usuario):
        """
        Crear un nuevo reporte diario con gastos y ventas de productos.

        Args:
            datos_reporte: Diccionario con datos del reporte
            gastos_data: Lista de diccionarios con datos de gastos
            ventas_productos_data: Lista de diccionarios con datos de ventas
            usuario: Usuario que crea el reporte

        Returns:
            ReporteDiario: Reporte creado

        Raises:
            ValueError: Si los datos son inválidos
        """
        # Validar que no exista un reporte para esa fecha
        fecha = datos_reporte.get("fecha")
        if ReporteDiario.objects.filter(fecha=fecha).exists():
            raise ValueError(f"Ya existe un reporte para la fecha {fecha}")

        # Crear el reporte (sin gastos aún)
        reporte = ReporteDiario.objects.create(
            fecha=datos_reporte["fecha"],
            base_inicial=datos_reporte["base_inicial"],
            venta_total=datos_reporte["venta_total"],
            entrega=datos_reporte.get("entrega", Decimal("0.00")),
            observacion=datos_reporte.get("observacion", ""),
            usuario_creacion=usuario,
            total_gastos=Decimal("0.00"),  # Se actualizará después
        )

        # Crear gastos asociados
        if gastos_data:
            ServicioReporte._crear_gastos(reporte, gastos_data)

        # Crear ventas de productos
        if ventas_productos_data:
            ServicioReporte._crear_ventas_productos(reporte, ventas_productos_data)

        # Recalcular y guardar
        reporte.total_gastos = reporte.calcular_total_gastos()
        reporte.base_siguiente = reporte.calcular_base_siguiente()
        reporte.save()

        return reporte

    @staticmethod
    @transaction.atomic
    def actualizar_reporte(reporte, datos_reporte, gastos_data, ventas_productos_data):
        """
        Actualizar un reporte existente.

        Args:
            reporte: Instancia del reporte a actualizar
            datos_reporte: Diccionario con datos actualizados
            gastos_data: Lista de gastos (reemplaza los existentes)
            ventas_productos_data: Lista de ventas (reemplaza las existentes)

        Returns:
            ReporteDiario: Reporte actualizado
        """
        # Actualizar campos básicos
        reporte.base_inicial = datos_reporte.get("base_inicial", reporte.base_inicial)
        reporte.venta_total = datos_reporte.get("venta_total", reporte.venta_total)
        reporte.entrega = datos_reporte.get("entrega", reporte.entrega)
        reporte.observacion = datos_reporte.get("observacion", reporte.observacion)

        # Eliminar gastos existentes y crear nuevos
        if gastos_data is not None:
            reporte.gastos.all().delete()
            ServicioReporte._crear_gastos(reporte, gastos_data)

        # Eliminar ventas existentes y crear nuevas
        if ventas_productos_data is not None:
            reporte.ventas_productos.all().delete()
            ServicioReporte._crear_ventas_productos(reporte, ventas_productos_data)

        # Recalcular y guardar
        reporte.total_gastos = reporte.calcular_total_gastos()
        reporte.base_siguiente = reporte.calcular_base_siguiente()
        reporte.save()

        return reporte

    @staticmethod
    def _crear_gastos(reporte, gastos_data):
        """
        Crear gastos asociados a un reporte.

        Args:
            reporte: Reporte al que asociar los gastos
            gastos_data: Lista de diccionarios con datos de gastos
        """
        for gasto_data in gastos_data:
            Gasto.objects.create(
                reporte=reporte,
                descripcion=gasto_data["descripcion"],
                valor=gasto_data["valor"],
                categoria_id=gasto_data.get("categoria"),
            )

    @staticmethod
    def _crear_ventas_productos(reporte, ventas_data):
        """
        Crear ventas de productos asociadas a un reporte.

        Args:
            reporte: Reporte al que asociar las ventas
            ventas_data: Lista de diccionarios con datos de ventas

        Raises:
            ValueError: Si un producto no existe o está inactivo
        """
        for venta_data in ventas_data:
            producto_id = venta_data["producto"]
            cantidad = venta_data["cantidad"]

            # Validar que el producto exista y esté activo
            try:
                producto = Producto.objects.get(id=producto_id, activo=True)
            except Producto.DoesNotExist:
                raise ValueError(f"El producto con ID {producto_id} no existe o está inactivo")

            # Crear la venta con el precio del producto en el momento
            VentaProducto.objects.create(
                reporte=reporte,
                producto=producto,
                cantidad=cantidad,
                precio_unitario_momento=producto.precio_unitario,
            )

    @staticmethod
    def calcular_estadisticas_reporte(reporte):
        """
        Calcular estadísticas de un reporte.

        Args:
            reporte: Reporte del cual calcular estadísticas

        Returns:
            dict: Diccionario con estadísticas calculadas
        """
        # Calcular total de ventas por productos
        total_ventas_productos = sum(venta.subtotal for venta in reporte.ventas_productos.all())

        # Calcular diferencia (útil si venta_total difiere de suma de productos)
        diferencia = reporte.venta_total - total_ventas_productos

        return {
            "total_gastos": reporte.total_gastos,
            "base_siguiente": reporte.base_siguiente,
            "total_ventas_productos": total_ventas_productos,
            "diferencia": diferencia,
            "cantidad_gastos": reporte.gastos.count(),
            "cantidad_productos_vendidos": reporte.ventas_productos.count(),
        }
