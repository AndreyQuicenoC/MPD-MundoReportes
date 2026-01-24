"""
Tests para el servicio de reportes.

Pruebas unitarias de la lógica de negocio de reportes.
"""

import pytest
from decimal import Decimal
from django.utils import timezone
from apps.reportes.models import ReporteDiario  # noqa: F401
from apps.reportes.models import VentaProducto  # noqa: F401
from apps.reportes.services import ServicioReporte
from apps.productos.models import Producto
from apps.gastos.models import CategoriaGasto
from apps.usuarios.models import Usuario


@pytest.fixture
def usuario():
    """Fixture de usuario de prueba."""
    return Usuario.objects.create_user(
        email="test@test.com", nombre="Usuario Test", password="test123"
    )


@pytest.fixture
def producto():
    """Fixture de producto de prueba."""
    return Producto.objects.create(nombre="Pintura Blanca", precio_unitario=Decimal("50000"))


@pytest.fixture
def categoria():
    """Fixture de categoría de prueba."""
    return CategoriaGasto.objects.create(nombre="Servicios")


@pytest.mark.django_db
class TestServicioReporte:
    """Tests del servicio de reportes."""

    def test_crear_reporte_basico(self, usuario):
        """Test de creación de reporte básico sin gastos ni ventas."""
        datos_reporte = {
            "fecha": timezone.now().date(),
            "base_inicial": Decimal("100000"),
            "venta_total": Decimal("50000"),
            "entrega": Decimal("20000"),
            "observacion": "Test",
        }

        reporte = ServicioReporte.crear_reporte(
            datos_reporte=datos_reporte,
            gastos_data=[],
            ventas_productos_data=[],
            usuario=usuario,
        )

        assert reporte.id is not None
        assert reporte.base_inicial == Decimal("100000")
        assert reporte.venta_total == Decimal("50000")
        assert reporte.total_gastos == Decimal("0")
        assert reporte.entrega == Decimal("20000")
        # base_siguiente = base_inicial + venta - gastos - entrega
        # 100000 + 50000 - 0 - 20000 = 130000
        assert reporte.base_siguiente == Decimal("130000")

    def test_crear_reporte_con_gastos(self, usuario, categoria):
        """Test de creación de reporte con gastos."""
        datos_reporte = {
            "fecha": timezone.now().date(),
            "base_inicial": Decimal("100000"),
            "venta_total": Decimal("50000"),
            "entrega": Decimal("0"),
        }

        gastos_data = [
            {"descripcion": "Gasto 1", "valor": Decimal("10000"), "categoria": categoria.id},
            {"descripcion": "Gasto 2", "valor": Decimal("5000"), "categoria": None},
        ]

        reporte = ServicioReporte.crear_reporte(
            datos_reporte=datos_reporte,
            gastos_data=gastos_data,
            ventas_productos_data=[],
            usuario=usuario,
        )

        assert reporte.total_gastos == Decimal("15000")
        assert reporte.gastos.count() == 2
        # base_siguiente = 100000 + 50000 - 15000 - 0 = 135000
        assert reporte.base_siguiente == Decimal("135000")

    def test_crear_reporte_con_ventas_productos(self, usuario, producto):
        """Test de creación de reporte con ventas de productos."""
        datos_reporte = {
            "fecha": timezone.now().date(),
            "base_inicial": Decimal("100000"),
            "venta_total": Decimal("100000"),
            "entrega": Decimal("0"),
        }

        ventas_data = [{"producto": producto.id, "cantidad": 2}]

        reporte = ServicioReporte.crear_reporte(
            datos_reporte=datos_reporte,
            gastos_data=[],
            ventas_productos_data=ventas_data,
            usuario=usuario,
        )

        assert reporte.ventas_productos.count() == 1
        venta = reporte.ventas_productos.first()
        assert venta.cantidad == 2
        assert venta.precio_unitario_momento == producto.precio_unitario

    def test_calcular_base_siguiente_correctamente(self, usuario):
        """Test que verifica el cálculo correcto de la base siguiente."""
        datos_reporte = {
            "fecha": timezone.now().date(),
            "base_inicial": Decimal("200000"),
            "venta_total": Decimal("150000"),
            "entrega": Decimal("100000"),
        }

        gastos_data = [{"descripcion": "Test", "valor": Decimal("30000"), "categoria": None}]

        reporte = ServicioReporte.crear_reporte(
            datos_reporte=datos_reporte,
            gastos_data=gastos_data,
            ventas_productos_data=[],
            usuario=usuario,
        )

        # base_siguiente = 200000 + 150000 - 30000 - 100000 = 220000
        assert reporte.base_siguiente == Decimal("220000")

    def test_no_permitir_reporte_duplicado(self, usuario):
        """Test que no permite crear dos reportes para la misma fecha."""
        fecha = timezone.now().date()
        datos_reporte = {
            "fecha": fecha,
            "base_inicial": Decimal("100000"),
            "venta_total": Decimal("50000"),
            "entrega": Decimal("0"),
        }

        # Crear primer reporte
        ServicioReporte.crear_reporte(
            datos_reporte=datos_reporte,
            gastos_data=[],
            ventas_productos_data=[],
            usuario=usuario,
        )

        # Intentar crear segundo reporte para la misma fecha
        with pytest.raises(ValueError, match="Ya existe un reporte"):
            ServicioReporte.crear_reporte(
                datos_reporte=datos_reporte,
                gastos_data=[],
                ventas_productos_data=[],
                usuario=usuario,
            )
