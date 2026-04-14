import os
import django
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

User = get_user_model()

# Crear cliente API
client = APIClient()

# Obtener o crear usuario de prueba
user = User.objects.filter(rol="usuario").first()
if not user:
    print("No existe usuario con rol 'usuario'")
    user = User.objects.first()
    if not user:
        print("No existe ningún usuario")
        exit(1)

# Obtener o crear token
token, _ = Token.objects.get_or_create(user=user)
client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

print("=== TEST ENDPOINTS ===\n")

# Test 1: Listar reportes
print("1. GET /api/reportes/")
response = client.get("/api/reportes/")
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    if isinstance(data, list):
        print(f"   Cantidad: {len(data)} reportes")
        for r in data:
            print(f"     - ID: {r['id']}, Fecha: {r['fecha']}, Venta: ${r['venta_total']}")
    else:
        print(f"   Tipo de respuesta: {type(data)}")
        print(f"   Keys: {data.keys() if hasattr(data, 'keys') else 'No es dict'}")
else:
    print(f"   Error: {response.json()}")

# Test 2: Dashboard
print("\n2. GET /api/estadisticas/dashboard/")
response = client.get("/api/estadisticas/dashboard/")
print(f"   Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"   Mes actual: {data.get('mes_actual')}")
    print(f"   Total ventas mes: ${data.get('total_ventas_mes')}")
    print(f"   Total gastos mes: ${data.get('total_gastos_mes')}")
    print(f"   Promedio diario: ${data.get('promedio_ventas_diarias')}")
    print(f"   Cantidad reportes: {data.get('cantidad_reportes')}")
else:
    print(f"   Error: {response.json() if response.status_code != 500 else 'Error 500'}")
    if response.status_code == 500:
        print(f"   Contenido: {response.content}")
