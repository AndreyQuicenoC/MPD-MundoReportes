"""Script para probar la creación de usuario"""
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

# 1. Login
print("1. Obteniendo token...")
login_response = requests.post(
    f"{BASE_URL}/auth/login/",
    json={"email": "andreyquic@gmail.com", "password": "11Bakuarya11"}
)

if login_response.status_code != 200:
    print(f"Error en login: {login_response.status_code}")
    print(login_response.text)
    exit(1)

token = login_response.json()["access"]
print(f"✓ Token obtenido")

# 2. Crear usuario con timestamp para hacerlo único
print("\n2. Creando usuario...")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
nuevo_usuario = {
    "email": f"test{timestamp}@example.com",
    "nombre": "Usuario de Prueba",
    "cedula": f"123456{timestamp[-4:]}",
    "edad": 25,
    "fecha_ingreso": "2026-01-24",
    "fecha_fin": None,
    "password": "TestPassword123!",
    "password_confirmacion": "TestPassword123!",
    "rol": "usuario",
    "is_active": True
}

print("Datos a enviar:")
print(json.dumps(nuevo_usuario, indent=2))

create_response = requests.post(
    f"{BASE_URL}/auth/admin/usuarios/",
    json=nuevo_usuario,
    headers=headers
)

print(f"\nStatus Code: {create_response.status_code}")
print("Respuesta:")
print(json.dumps(create_response.json(), indent=2, ensure_ascii=False))

if create_response.status_code == 201:
    print("\n✓ Usuario creado exitosamente")
    # Eliminar usuario de prueba
    user_id = create_response.json()["id"]
    delete_response = requests.delete(
        f"{BASE_URL}/auth/admin/usuarios/{user_id}/",
        headers=headers
    )
    print(f"Usuario de prueba eliminado (status: {delete_response.status_code})")
else:
    print("\n✗ Error al crear usuario")
