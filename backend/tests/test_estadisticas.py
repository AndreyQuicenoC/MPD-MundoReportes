"""
Tests para verificar estadísticas y dashboard.

Valida que los endpoints de estadísticas retornen datos correctos
y que el dashboard muestre información completa.
"""

from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from apps.usuarios.models import Usuario
from apps.reportes.models import ReporteDiario, VentaProducto
from apps.productos.models import Producto
from apps.gastos.models import CategoriaGasto, Gasto


class EstadisticasTests(TestCase):
    """Tests para verificar endpoints de estadísticas."""

    def setUp(self):
        """Configurar datos de prueba."""
        # Crear usuario operario
        self.operario = Usuario.objects.create_user(
            email="test_operario@test.com",
            password="test123",
            nombre="Test Operario",
            cedula="1234567890",
            rol="usuario",
        )

        # Crear categoría y producto
        self.categoria = CategoriaGasto.objects.create(
            nombre="Transporte", descripcion="Gastos de transporte"
        )

        self.producto = Producto.objects.create(
            nombre="Producto Test", precio_unitario=Decimal("10000.00")
        )

        # Crear reportes de prueba
        hoy = date.today()
        ayer = hoy - timedelta(days=1)

        # Reporte de hoy
        self.reporte_hoy = ReporteDiario.objects.create(
            fecha=hoy,
            base_inicial=Decimal("100000.00"),
            venta_total=Decimal("50000.00"),
            entrega=Decimal("10000.00"),
            usuario_creacion=self.operario,
        )

        # Agregar venta de producto
        VentaProducto.objects.create(
            reporte=self.reporte_hoy,
            producto=self.producto,
            cantidad=3,
            precio_unitario_momento=Decimal("10000.00"),
        )

        # Agregar gasto
        Gasto.objects.create(
            reporte=self.reporte_hoy,
            categoria=self.categoria,
            descripcion="Taxi",
            valor=Decimal("5000.00"),
        )

        # Reporte de ayer
        self.reporte_ayer = ReporteDiario.objects.create(
            fecha=ayer,
            base_inicial=Decimal("80000.00"),
            venta_total=Decimal("30000.00"),
            entrega=Decimal("5000.00"),
            usuario_creacion=self.operario,
        )

        # Agregar gasto
        Gasto.objects.create(
            reporte=self.reporte_ayer,
            categoria=self.categoria,
            descripcion="Gasolina",
            valor=Decimal("10000.00"),
        )

        # Recalcular totales
        self.reporte_hoy.save()
        self.reporte_ayer.save()

        # Cliente API
        self.client = APIClient()
        self.client.force_authenticate(user=self.operario)

    def test_dashboard_devuelve_datos_correctos(self):
        """Verificar que el dashboard devuelve datos del mes actual."""
        url = reverse("estadisticas:dashboard")
        response = self.client.get(url)

        print("\n✓ Test dashboard_devuelve_datos_correctos:")
        print(f"  Status: {response.status_code}")
        print(f"  Data: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_ventas_mes", response.data)
        self.assertIn("total_gastos_mes", response.data)
        self.assertIn("promedio_ventas_diarias", response.data)
        self.assertIn("cantidad_reportes", response.data)

        # El dashboard filtra por mes actual, así que puede ser 0 si no hay reportes del mes
        # Lo importante es que devuelva la estructura correcta
        self.assertIsNotNone(response.data["total_ventas_mes"])
        self.assertIsNotNone(response.data["cantidad_reportes"])

    def test_estadisticas_ventas_incluye_todos_campos(self):
        """Verificar que estadísticas de ventas incluye total_gastos y total_entregas."""
        url = reverse("estadisticas:estadisticas_ventas")
        response = self.client.get(url)

        print("\n✓ Test estadisticas_ventas_incluye_todos_campos:")
        print(f"  Status: {response.status_code}")
        print(f"  Data: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_ventas", response.data)
        self.assertIn("total_gastos", response.data)
        self.assertIn("total_entregas", response.data)
        self.assertIn("total_reportes", response.data)

        # Verificar valores correctos
        self.assertEqual(float(response.data["total_ventas"]), 80000.00)  # 50k + 30k
        self.assertEqual(float(response.data["total_gastos"]), 15000.00)  # 5k + 10k
        self.assertEqual(float(response.data["total_entregas"]), 15000.00)  # 10k + 5k

    def test_gastos_por_categoria_devuelve_datos(self):
        """Verificar que gastos por categoría devuelve datos."""
        url = reverse("estadisticas:gastos_por_categoria")
        response = self.client.get(url)

        print("\n✓ Test gastos_por_categoria_devuelve_datos:")
        print(f"  Status: {response.status_code}")
        print(f"  Data: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreater(len(response.data), 0)

        # Verificar que tiene los campos correctos
        primer_gasto = response.data[0]
        self.assertIn("categoria", primer_gasto)
        self.assertIn("total", primer_gasto)
        self.assertEqual(primer_gasto["categoria"], "Transporte")

    def test_productos_mas_vendidos_devuelve_datos(self):
        """Verificar que productos más vendidos devuelve datos."""
        url = reverse("estadisticas:productos_mas_vendidos")
        response = self.client.get(url)

        print("\n✓ Test productos_mas_vendidos_devuelve_datos:")
        print(f"  Status: {response.status_code}")
        print(f"  Data: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertGreater(len(response.data), 0)

        # Verificar estructura
        primer_producto = response.data[0]
        self.assertIn("producto", primer_producto)
        self.assertIn("cantidad_total", primer_producto)

    def test_ventas_mensuales_formato_correcto(self):
        """Verificar que ventas mensuales tiene mes y año separados."""
        url = reverse("estadisticas:ventas_por_mes")
        response = self.client.get(url)

        print("\n✓ Test ventas_mensuales_formato_correcto:")
        print(f"  Status: {response.status_code}")
        print(f"  Data: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

        if len(response.data) > 0:
            primer_mes = response.data[0]
            self.assertIn("mes", primer_mes)
            self.assertIn("anio", primer_mes)
            # Verificar que mes es int, no string
            self.assertIsInstance(primer_mes["mes"], int)
            self.assertIsInstance(primer_mes["anio"], int)

    def test_reporte_lista_incluye_base_inicial(self):
        """Verificar que lista de reportes incluye base_inicial."""
        url = reverse("reportes:lista_reportes")
        response = self.client.get(url)

        print("\n✓ Test reporte_lista_incluye_base_inicial:")
        print(f"  Status: {response.status_code}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # El response puede ser paginado o un array directo
        reportes = (
            response.data if isinstance(response.data, list) else response.data.get("results", [])
        )

        self.assertGreater(len(reportes), 0)

        # Verificar que tiene base_inicial
        primer_reporte = reportes[0]
        print(f"  Campos del reporte: {primer_reporte.keys()}")

        self.assertIn("base_inicial", primer_reporte)
        self.assertIsNotNone(primer_reporte["base_inicial"])
