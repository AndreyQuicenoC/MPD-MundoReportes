"""Script para probar el endpoint del dashboard"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Login como usuario normal (operario)
print("1. Login como operario...")
login_response = requests.post(
    f"{BASE_URL}/auth/login/",
    json={"email": "operario@example.com", "password": "Operario123!"}
)

if login_response.status_code != 200:
    print(f"Error en login: {login_response.status_code}")
    print(login_response.text)
    
    # Intentar con admin si no existe operario
    print("\nIntentando con admin...")
    login_response = requests.post(
        f"{BASE_URL}/auth/login/",
        json={"email": "andreyquic@gmail.com", "password": "11Bakuarya11"}
    )
    if login_response.status_code != 200:
        print(f"Error en login admin: {login_response.status_code}")
        exit(1)

token = login_response.json()["access"]
print(f"✓ Token obtenido")

# Probar endpoint dashboard
print("\n2. Probando endpoint /api/estadisticas/dashboard/...")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

dashboard_response = requests.get(
    f"{BASE_URL}/estadisticas/dashboard/",
    headers=headers
)

print(f"Status Code: {dashboard_response.status_code}")
print("Respuesta:")
try:
    print(json.dumps(dashboard_response.json(), indent=2, ensure_ascii=False))
except:
    print(dashboard_response.text)

if dashboard_response.status_code != 200:
    print("\n✗ Error al obtener dashboard")
else:
    print("\n✓ Dashboard obtenido exitosamente")
