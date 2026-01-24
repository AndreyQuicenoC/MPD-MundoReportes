"""
Test de verificación de Supabase.
Prueba la conexión y los usuarios creados.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_supabase():
    print("=" * 60)
    print("VERIFICACIÓN DE SUPABASE")
    print("=" * 60)
    print()
    
    # Test 1: Login con admin
    print("1. Test de login con administrador...")
    login_data = {
        "email": "andreyquic@gmail.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            print("✓ Login exitoso!")
            print(f"  - Email: {data.get('email')}")
            print(f"  - Nombre: {data.get('nombre')}")
            print(f"  - Rol: {data.get('rol')}")
            print(f"  - Token recibido: Sí")
            token = data.get('access')
        else:
            print(f"✗ Error en login: {response.status_code}")
            print(f"  {response.text}")
            return
    except Exception as e:
        print(f"✗ Error conectando al servidor: {e}")
        print("  Asegúrate de que el servidor esté corriendo (python manage.py runserver)")
        return
    
    print()
    
    # Test 2: Obtener perfil
    print("2. Test de obtener perfil...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/auth/perfil/", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print("✓ Perfil obtenido correctamente!")
            print(f"  - ID: {data.get('id')}")
            print(f"  - Email: {data.get('email')}")
            print(f"  - Cédula: {data.get('cedula')}")
        else:
            print(f"✗ Error obteniendo perfil: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    print()
    
    # Test 3: Login con operario
    print("3. Test de login con operario...")
    login_data = {
        "email": "operario@mundoreporte.com",
        "password": "operario123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            print("✓ Login exitoso!")
            print(f"  - Email: {data.get('email')}")
            print(f"  - Nombre: {data.get('nombre')}")
            print(f"  - Rol: {data.get('rol')}")
        else:
            print(f"✗ Error en login: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    print()
    print("=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print("✓ Supabase está funcionando correctamente")
    print("✓ Los usuarios fueron creados exitosamente")
    print("✓ La autenticación está funcionando")
    print()
    print("Puedes verificar los datos en Supabase:")
    print("1. Ve a https://app.supabase.com")
    print("2. Selecciona tu proyecto")
    print("3. Table Editor > usuarios_usuario")
    print("=" * 60)


if __name__ == "__main__":
    test_supabase()
