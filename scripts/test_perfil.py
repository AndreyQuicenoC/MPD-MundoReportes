"""
Script de prueba enfocado en el módulo de Perfil.
Prueba todas las operaciones del perfil de usuario.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

# Colores para la consola
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✓ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}✗ {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ {message}{Colors.END}")

def print_section(title):
    print(f"\n{Colors.BLUE}{'─'*60}")
    print(f"  {title}")
    print(f"{'─'*60}{Colors.END}\n")

# Variable global para el token
user_token = None

def login():
    """Login para obtener token"""
    print_section("AUTENTICACIÓN")
    print_info("Iniciando sesión como administrador...")
    
    url = f"{BASE_URL}/auth/login/"
    data = {
        "email": "andreyquic@gmail.com",
        "password": "11Bakuarya11"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            global user_token
            result = response.json()
            user_token = result["access"]
            print_success(f"Login exitoso")
            print_success(f"Usuario: {result['usuario']['nombre']}")
            print_success(f"Email: {result['usuario']['email']}")
            print_success(f"Rol: {result['usuario']['rol']}")
            print_success(f"Cédula: {result['usuario']['cedula']}")
            return True
        else:
            print_error(f"Login falló: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error en login: {str(e)}")
        return False

def test_obtener_perfil():
    """Prueba obtención de perfil"""
    print_section("OBTENER PERFIL")
    print_info("Obteniendo información del perfil...")
    
    url = f"{BASE_URL}/auth/perfil/"
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_success("Perfil obtenido exitosamente")
            print("\n📋 Datos del perfil:")
            print(f"  - ID: {result.get('id')}")
            print(f"  - Nombre: {result.get('nombre')}")
            print(f"  - Email: {result.get('email')} (read-only)")
            print(f"  - Cédula: {result.get('cedula')} (read-only)")
            print(f"  - Edad: {result.get('edad')}")
            print(f"  - Fecha ingreso: {result.get('fecha_ingreso')}")
            print(f"  - Fecha fin: {result.get('fecha_fin')}")
            print(f"  - Rol: {result.get('rol')}")
            print(f"  - Activo: {result.get('is_active')}")
            return True
        else:
            print_error(f"Error al obtener perfil: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_actualizar_nombre():
    """Prueba actualización de nombre"""
    print_section("ACTUALIZAR NOMBRE")
    print_info("Actualizando nombre del usuario...")
    
    url = f"{BASE_URL}/auth/perfil/"
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "nombre": "Andrey Quiceño (Actualizado desde Script)"
    }
    
    try:
        response = requests.patch(url, json=data, headers=headers)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_success("Nombre actualizado exitosamente")
            print(f"  Nuevo nombre: {result['nombre']}")
            return True
        else:
            print_error(f"Error al actualizar nombre: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_actualizar_edad():
    """Prueba actualización de edad"""
    print_section("ACTUALIZAR EDAD")
    print_info("Actualizando edad del usuario...")
    
    url = f"{BASE_URL}/auth/perfil/"
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "edad": 30
    }
    
    try:
        response = requests.patch(url, json=data, headers=headers)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_success("Edad actualizada exitosamente")
            print(f"  Nueva edad: {result['edad']}")
            return True
        else:
            print_error(f"Error al actualizar edad: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_cambiar_contrasena_exitoso():
    """Prueba cambio de contraseña exitoso"""
    print_section("CAMBIAR CONTRASEÑA (EXITOSO)")
    print_info("Cambiando contraseña con credenciales correctas...")
    
    url = f"{BASE_URL}/auth/perfil/cambiar-contrasena/"
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "contrasena_actual": "11Bakuarya11",
        "contrasena_nueva": "11Bakuarya11Nueva",
        "confirmar_contrasena": "11Bakuarya11Nueva"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print_success("Contraseña cambiada exitosamente")
            # Restaurar contraseña original
            print_info("Restaurando contraseña original...")
            data2 = {
                "contrasena_actual": "11Bakuarya11Nueva",
                "contrasena_nueva": "11Bakuarya11",
                "confirmar_contrasena": "11Bakuarya11"
            }
            response2 = requests.post(url, json=data2, headers=headers)
            if response2.status_code == 200:
                print_success("Contraseña restaurada a la original")
            return True
        else:
            print_error(f"Error al cambiar contraseña: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_cambiar_contrasena_fallido():
    """Prueba cambio de contraseña con contraseña actual incorrecta"""
    print_section("CAMBIAR CONTRASEÑA (FALLIDO - Contraseña incorrecta)")
    print_info("Intentando cambiar contraseña con contraseña actual incorrecta...")
    
    url = f"{BASE_URL}/auth/perfil/cambiar-contrasena/"
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "contrasena_actual": "ContraseñaIncorrecta",
        "contrasena_nueva": "NuevaContraseña123",
        "confirmar_contrasena": "NuevaContraseña123"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print_info(f"Status Code: {response.status_code}")
        
        if response.status_code == 400:
            print_success("Validación correcta: contraseña actual incorrecta detectada")
            print(f"  Mensaje de error: {response.json()}")
            return True
        elif response.status_code == 200:
            print_error("ERROR: Se permitió cambiar la contraseña con credenciales incorrectas")
            return False
        else:
            print_error(f"Error inesperado: {response.status_code}")
            print_error(f"Respuesta: {response.text}")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_intentar_cambiar_email():
    """Prueba que no se puede cambiar el email"""
    print_section("INTENTAR CAMBIAR EMAIL (Debe fallar)")
    print_info("Intentando cambiar email (debería ser rechazado)...")
    
    url = f"{BASE_URL}/auth/perfil/"
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "email": "nuevo.email@test.com"
    }
    
    try:
        response = requests.patch(url, json=data, headers=headers)
        print_info(f"Status Code: {response.status_code}")
        
        result = response.json()
        if result.get('email') != "nuevo.email@test.com":
            print_success("Validación correcta: email no puede ser modificado")
            return True
        else:
            print_error("ERROR: Se permitió cambiar el email")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def test_intentar_cambiar_cedula():
    """Prueba que no se puede cambiar la cédula"""
    print_section("INTENTAR CAMBIAR CÉDULA (Debe fallar)")
    print_info("Intentando cambiar cédula (debería ser rechazado)...")
    
    url = f"{BASE_URL}/auth/perfil/"
    headers = {
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "cedula": "9999999999"
    }
    
    try:
        response = requests.patch(url, json=data, headers=headers)
        print_info(f"Status Code: {response.status_code}")
        
        result = response.json()
        if result.get('cedula') != "9999999999":
            print_success("Validación correcta: cédula no puede ser modificada")
            return True
        else:
            print_error("ERROR: Se permitió cambiar la cédula")
            return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

def run_all_tests():
    """Ejecutar todas las pruebas del perfil"""
    print("\n" + "="*60)
    print("  PRUEBAS DE MÓDULO DE PERFIL")
    print("="*60)
    
    if not login():
        print_error("\nNo se pudo autenticar. Abortando pruebas.")
        return False
    
    tests = [
        test_obtener_perfil,
        test_actualizar_nombre,
        test_actualizar_edad,
        test_cambiar_contrasena_exitoso,
        test_cambiar_contrasena_fallido,
        test_intentar_cambiar_email,
        test_intentar_cambiar_cedula,
    ]
    
    passed = 0
    failed = 0
    
    for test_func in tests:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print_error(f"Error inesperado: {str(e)}")
            failed += 1
    
    print("\n" + "="*60)
    print("  RESUMEN DE PRUEBAS")
    print("="*60)
    print_success(f"Pruebas exitosas: {passed}")
    if failed > 0:
        print_error(f"Pruebas fallidas: {failed}")
    else:
        print_success(f"Pruebas fallidas: {failed}")
    print(f"Total: {passed + failed}")
    print("="*60 + "\n")
    
    return failed == 0

if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nPruebas interrumpidas por el usuario")
        exit(1)
    except Exception as e:
        print_error(f"\n\nError fatal: {str(e)}")
        exit(1)
