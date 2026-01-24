"""
Tests para el servicio de estadísticas.

Pruebas unitarias de generación de métricas y análisis.
"""

import pytest
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from apps.reportes.models import ReporteDiario, VentaProducto
from apps.gastos.models import Gasto, CategoriaGasto
from apps.productos.models import Producto
from apps.estadisticas.services import ServicioEstadisticas
from apps.usuarios.models import Usuario


@pytest.fixture
def usuario():
    """Fixture de usuario de prueba."""
    return Usuario.objects.create_user(
        email="stats@test.com", nombre="Stats User", password="test123"
    )


@pytest.fixture
def categoria():
    """Fixture de categoría de gasto."""
    return CategoriaGasto.objects.create(nombre="Servicios")


@pytest.fixture
def producto():
    """Fixture de producto."""
    return Producto.objects.create(nombre="Pintura", precio_unitario=Decimal("50000"))


@pytest.mark.django_db
class TestServicioEstadisticas:
    """Tests del servicio de estadísticas."""

    def test_estadisticas_ventas_vacio(self):
        """Test de estadísticas cuando no hay reportes."""
        stats = ServicioEstadisticas.estadisticas_ventas()

        assert stats["total_ventas"] == Decimal("0")
        assert stats["promedio_ventas"] == Decimal("0")
        assert stats["total_entregas"] == Decimal("0")

    def test_estadisticas_ventas_con_datos(self, usuario):
        """Test de estadísticas con reportes existentes."""
        # Crear reportes
        fecha_hoy = timezone.now().date()

        ReporteDiario.objects.create(
            fecha=fecha_hoy,
            base_inicial=Decimal("100000"),
            venta_total=Decimal("50000"),
            entrega=Decimal("20000"),
            usuario=usuario,
        )

        ReporteDiario.objects.create(
            fecha=fecha_hoy - timedelta(days=1),
            base_inicial=Decimal("80000"),
            venta_total=Decimal("60000"),
            entrega=Decimal("30000"),
            usuario=usuario,
        )

        stats = ServicioEstadisticas.estadisticas_ventas()

        assert stats["total_ventas"] == Decimal("110000")
        assert stats["promedio_ventas"] == Decimal("55000")
        assert stats["total_entregas"] == Decimal("50000")

    def test_gastos_por_categoria(self, usuario, categoria):
        """Test de agrupación de gastos por categoría."""
        fecha = timezone.now().date()
        reporte = ReporteDiario.objects.create(
            fecha=fecha,
            base_inicial=Decimal("100000"),
            venta_total=Decimal("50000"),
            entrega=Decimal("0"),
            usuario=usuario,
        )

        Gasto.objects.create(
            reporte=reporte, descripcion="Gasto 1", valor=Decimal("10000"), categoria=categoria
        )
        Gasto.objects.create(
            reporte=reporte, descripcion="Gasto 2", valor=Decimal("15000"), categoria=categoria
        )
        Gasto.objects.create(reporte=reporte, descripcion="Sin cat", valor=Decimal("5000"))

        gastos = ServicioEstadisticas.gastos_por_categoria()

        # Debe haber 2 categorías: Servicios y Sin Categoría
        assert len(gastos) == 2

        servicios = next(g for g in gastos if g["categoria"] == "Servicios")
        assert servicios["total"] == Decimal("25000")

    def test_resumen_periodo(self, usuario):
        """Test de resumen de periodo específico."""
        fecha_inicio = timezone.now().date() - timedelta(days=7)
        fecha_fin = timezone.now().date()

        # Crear reportes dentro del periodo
        ReporteDiario.objects.create(
            fecha=fecha_inicio + timedelta(days=1),
            base_inicial=Decimal("100000"),
            venta_total=Decimal("50000"),
            entrega=Decimal("20000"),
            usuario=usuario,
        )

        # Crear reporte fuera del periodo (no debe contarse)
        ReporteDiario.objects.create(
            fecha=fecha_inicio - timedelta(days=1),
            base_inicial=Decimal("100000"),
            venta_total=Decimal("100000"),
            entrega=Decimal("0"),
            usuario=usuario,
        )

        resumen = ServicioEstadisticas.resumen_periodo(
            fecha_inicio=fecha_inicio, fecha_fin=fecha_fin
        )

        assert resumen["reportes_count"] == 1
        assert resumen["total_ventas"] == Decimal("50000")

    def test_productos_mas_vendidos(self, usuario, producto):
        """Test de productos más vendidos."""
        fecha = timezone.now().date()
        reporte = ReporteDiario.objects.create(
            fecha=fecha,
            base_inicial=Decimal("100000"),
            venta_total=Decimal("100000"),
            entrega=Decimal("0"),
            usuario=usuario,
        )

        VentaProducto.objects.create(
            reporte=reporte, producto=producto, cantidad=5, precio_unitario_momento=Decimal("50000")
        )

        productos = ServicioEstadisticas.productos_mas_vendidos()

        assert len(productos) == 1
        assert productos[0]["producto__nombre"] == "Pintura"
        assert productos[0]["total_cantidad"] == 5
