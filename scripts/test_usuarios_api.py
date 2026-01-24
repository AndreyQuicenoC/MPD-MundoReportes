"""
Script de prueba para la API de usuarios.
Prueba login, creación de usuarios, perfil y cambio de contraseña.
"""

import requests
import json
from datetime import date, timedelta

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

def print_warning(message):
    print(f"{Colors.YELLOW}⚠ {message}{Colors.END}")

# Variables globales
admin_token = None
operario_token = None
nuevo_usuario_id = None

def test_login_admin():
    """Prueba de login como administrador"""
    global admin_token
    print_info("Probando login como administrador...")
    
    url = f"{BASE_URL}/auth/login/"
    data = {
        "email": "andreyquic@gmail.com",
        "password": "11Bakuarya11"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            result = response.json()
            admin_token = result["access"]
            print_success(f"Login exitoso - Usuario: {result['usuario']['nombre']}")
            print_success(f"Rol: {result['usuario']['rol']}")
            return True
        else:
            print_error(f"Login falló: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error en login: {str(e)}")
        return False

def test_crear_usuario():
    """Prueba de creación de usuario operario"""
    global nuevo_usuario_id
    print_info("Probando creación de usuario operario...")
    
    url = f"{BASE_URL}/auth/admin/usuarios/"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "email": "operario.test@mundoreporte.com",
        "nombre": "Usuario Operario Test",
        "cedula": "1234567890",
        "edad": 25,
        "fecha_ingreso": str(date.today()),
        "password": "OperarioTest123",
        "password_confirmacion": "OperarioTest123",
        "rol": "usuario",
        "is_active": True
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            result = response.json()
            nuevo_usuario_id = result["id"]
            print_success(f"Usuario creado exitosamente - ID: {nuevo_usuario_id}")
            print_success(f"Email: {result['email']}")
            print_success(f"Cédula: {result['cedula']}")
            return True
        else:
            print_error(f"Creación falló: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error al crear usuario: {str(e)}")
        return False

def test_login_operario():
    """Prueba de login como operario"""
    global operario_token
    print_info("Probando login como operario...")
    
    url = f"{BASE_URL}/auth/login/"
    data = {
        "email": "operario.test@mundoreporte.com",
        "password": "OperarioTest123"
    }
    
    try:
        response = requests.post(url, json=data)
        if response.status_code == 200:
            result = response.json()
            operario_token = result["access"]
            print_success(f"Login exitoso - Usuario: {result['usuario']['nombre']}")
            print_success(f"Rol: {result['usuario']['rol']}")
            return True
        else:
            print_error(f"Login falló: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error en login: {str(e)}")
        return False

def test_obtener_perfil():
    """Prueba de obtención de perfil"""
    print_info("Probando obtención de perfil del operario...")
    
    url = f"{BASE_URL}/auth/perfil/"
    headers = {
        "Authorization": f"Bearer {operario_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print_success(f"Perfil obtenido - Nombre: {result['nombre']}")
            print_success(f"Email: {result['email']} (read-only)")
            print_success(f"Cédula: {result['cedula']} (read-only)")
            return True
        else:
            print_error(f"Obtención de perfil falló: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error al obtener perfil: {str(e)}")
        return False

def test_actualizar_perfil():
    """Prueba de actualización de perfil"""
    print_info("Probando actualización de perfil (nombre y edad)...")
    
    url = f"{BASE_URL}/auth/perfil/"
    headers = {
        "Authorization": f"Bearer {operario_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "nombre": "Usuario Operario Test Actualizado",
        "edad": 26
    }
    
    try:
        response = requests.patch(url, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print_success(f"Perfil actualizado - Nuevo nombre: {result['nombre']}")
            print_success(f"Nueva edad: {result['edad']}")
            return True
        else:
            print_error(f"Actualización falló: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error al actualizar perfil: {str(e)}")
        return False

def test_cambiar_contrasena():
    """Prueba de cambio de contraseña"""
    print_info("Probando cambio de contraseña...")
    
    url = f"{BASE_URL}/auth/perfil/cambiar-contrasena/"
    headers = {
        "Authorization": f"Bearer {operario_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "contrasena_actual": "OperarioTest123",
        "contrasena_nueva": "NuevaContrasena123",
        "confirmar_contrasena": "NuevaContrasena123"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            print_success("Contraseña cambiada exitosamente")
            return True
        else:
            print_error(f"Cambio de contraseña falló: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error al cambiar contraseña: {str(e)}")
        return False

def test_listar_usuarios():
    """Prueba de listado de usuarios (solo admin)"""
    print_info("Probando listado de usuarios como admin...")
    
    url = f"{BASE_URL}/auth/admin/usuarios/"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print_success(f"Usuarios listados - Total: {len(result)}")
            return True
        else:
            print_error(f"Listado falló: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error al listar usuarios: {str(e)}")
        return False

def test_estadisticas_usuarios():
    """Prueba de estadísticas de usuarios"""
    print_info("Probando estadísticas de usuarios...")
    
    url = f"{BASE_URL}/auth/admin/usuarios/estadisticas/"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print_success(f"Total usuarios: {result['total_usuarios']}")
            print_success(f"Usuarios activos: {result['usuarios_activos']}")
            print_success(f"Usuarios inactivos: {result['usuarios_inactivos']}")
            return True
        else:
            print_error(f"Estadísticas fallaron: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error al obtener estadísticas: {str(e)}")
        return False

def test_editar_usuario():
    """Prueba de edición de usuario por admin"""
    print_info("Probando edición de usuario como admin...")
    
    url = f"{BASE_URL}/auth/admin/usuarios/{nuevo_usuario_id}/"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "nombre": "Usuario Operario Test Editado por Admin",
        "edad": 30,
        "fecha_fin": str(date.today() + timedelta(days=365))
    }
    
    try:
        response = requests.patch(url, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print_success(f"Usuario editado - Nuevo nombre: {result['nombre']}")
            print_success(f"Nueva edad: {result['edad']}")
            print_success(f"Fecha fin: {result['fecha_fin']}")
            return True
        else:
            print_error(f"Edición falló: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error al editar usuario: {str(e)}")
        return False

def test_desactivar_usuario():
    """Prueba de desactivación de usuario"""
    print_info("Probando desactivación de usuario...")
    
    url = f"{BASE_URL}/auth/admin/usuarios/{nuevo_usuario_id}/"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.delete(url, headers=headers)
        if response.status_code == 204:
            print_success("Usuario desactivado exitosamente")
            return True
        else:
            print_error(f"Desactivación falló: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print_error(f"Error al desactivar usuario: {str(e)}")
        return False

def run_all_tests():
    """Ejecutar todas las pruebas"""
    print("\n" + "="*60)
    print("  PRUEBAS DE API - SISTEMA DE USUARIOS")
    print("="*60 + "\n")
    
    tests = [
        ("Login Administrador", test_login_admin),
        ("Crear Usuario Operario", test_crear_usuario),
        ("Login Operario", test_login_operario),
        ("Obtener Perfil", test_obtener_perfil),
        ("Actualizar Perfil", test_actualizar_perfil),
        ("Cambiar Contraseña", test_cambiar_contrasena),
        ("Listar Usuarios", test_listar_usuarios),
        ("Estadísticas Usuarios", test_estadisticas_usuarios),
        ("Editar Usuario (Admin)", test_editar_usuario),
        ("Desactivar Usuario", test_desactivar_usuario),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n{'─'*60}")
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print_error(f"Error inesperado: {str(e)}")
            failed += 1
    
    print("\n" + "="*60)
    print(f"  RESUMEN DE PRUEBAS")
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
        print_warning("\n\nPruebas interrumpidas por el usuario")
        exit(1)
    except Exception as e:
        print_error(f"\n\nError fatal: {str(e)}")
        exit(1)
