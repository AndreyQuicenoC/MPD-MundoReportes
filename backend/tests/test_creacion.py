"""
Tests para verificar creación de productos y categorías.

Prueba que operarios pueden crear productos y categorías correctamente.
"""

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.usuarios.models import Usuario
from apps.productos.models import Producto
from apps.gastos.models import CategoriaGasto


class ProductoCategoriaCreacionTests(TestCase):
    """Tests de creación de productos y categorías."""

    def setUp(self):
        """Configurar el ambiente de pruebas."""
        self.client = APIClient()

        # Crear usuario operario de prueba
        self.operario = Usuario.objects.create_user(
            email="test_operario@test.com",
            password="testpass123",
            nombre="Test Operario",
            rol="usuario",
        )

        # Crear usuario admin de prueba
        self.admin = Usuario.objects.create_user(
            email="test_admin@test.com",
            password="testpass123",
            nombre="Test Admin",
            rol="admin",
        )

    def test_operario_puede_crear_producto(self):
        """Verificar que un operario puede crear un producto."""
        # Autenticar como operario
        self.client.force_authenticate(user=self.operario)

        # Datos del producto
        data = {
            "nombre": "Producto Test",
            "precio_unitario": "10000.00",
            "precio_venta": "15000.00",
            "stock": 100,
            "activo": True,
        }

        # Hacer request POST
        response = self.client.post("/api/productos/crear/", data, format="json")

        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Producto.objects.count(), 1)
        self.assertEqual(Producto.objects.get().nombre, "Producto Test")

        print("✓ Test operario_puede_crear_producto: PASÓ")

    def test_operario_puede_crear_categoria(self):
        """Verificar que un operario puede crear una categoría."""
        # Autenticar como operario
        self.client.force_authenticate(user=self.operario)

        # Datos de la categoría
        data = {"nombre": "Categoría Test", "descripcion": "Descripción test", "activa": True}

        # Hacer request POST
        response = self.client.post("/api/gastos/categorias/crear/", data, format="json")

        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CategoriaGasto.objects.count(), 1)
        self.assertEqual(CategoriaGasto.objects.get().nombre, "Categoría Test")

        print("✓ Test operario_puede_crear_categoria: PASÓ")

    def test_admin_puede_crear_producto(self):
        """Verificar que un admin puede crear un producto."""
        # Autenticar como admin
        self.client.force_authenticate(user=self.admin)

        # Datos del producto
        data = {
            "nombre": "Producto Admin",
            "precio_unitario": "20000.00",
            "precio_venta": "25000.00",
            "stock": 50,
            "activo": True,
        }

        # Hacer request POST
        response = self.client.post("/api/productos/crear/", data, format="json")

        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Producto.objects.count(), 1)

        print("✓ Test admin_puede_crear_producto: PASÓ")

    def test_admin_puede_crear_categoria(self):
        """Verificar que un admin puede crear una categoría."""
        # Autenticar como admin
        self.client.force_authenticate(user=self.admin)

        # Datos de la categoría
        data = {
            "nombre": "Categoría Admin",
            "descripcion": "Categoría de administrador",
            "activa": True,
        }

        # Hacer request POST
        response = self.client.post("/api/gastos/categorias/crear/", data, format="json")

        # Verificar respuesta
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CategoriaGasto.objects.count(), 1)

        print("✓ Test admin_puede_crear_categoria: PASÓ")

    def test_sin_autenticacion_no_puede_crear(self):
        """Verificar que sin autenticación no se puede crear."""
        # Sin autenticar
        data = {
            "nombre": "Producto Sin Auth",
            "precio_unitario": "10000.00",
            "precio_venta": "15000.00",
            "stock": 10,
        }

        response = self.client.post("/api/productos/crear/", data, format="json")

        # Debe devolver 401 Unauthorized
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        print("✓ Test sin_autenticacion_no_puede_crear: PASÓ")


def run_tests():
    """Ejecutar tests de forma programática."""
    from django.core.management import call_command

    print("\n" + "=" * 60)
    print("EJECUTANDO TESTS DE CREACIÓN DE PRODUCTOS Y CATEGORÍAS")
    print("=" * 60 + "\n")

    try:
        call_command("test", "tests.test_creacion", verbosity=2)
        print("\n" + "=" * 60)
        print("✓ TODOS LOS TESTS PASARON EXITOSAMENTE")
        print("=" * 60 + "\n")
        return True
    except Exception as e:
        print("\n" + "=" * 60)
        print(f"✗ ERROR EN TESTS: {e}")
        print("=" * 60 + "\n")
        return False


if __name__ == "__main__":
    run_tests()
