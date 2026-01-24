"""
Script para crear usuarios iniciales en Supabase.

Crea los usuarios que existían en la implementación anterior.
"""

import os
import sys
import django

# Configurar Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.usuarios.models import Usuario


def crear_usuarios_iniciales():
    """Crear usuarios iniciales del sistema."""
    
    usuarios = [
        {
            "email": "andreyquic@gmail.com",
            "nombre": "Andrey Quiceno",
            "rol": Usuario.ROL_ADMIN,
            "password": "admin123",
            "cedula": "1000000001",
            "edad": 30,
            "is_staff": True,
            "is_superuser": True,
        },
        {
            "email": "operario@mundoreporte.com",
            "nombre": "Operario de Prueba",
            "rol": Usuario.ROL_USUARIO,
            "password": "operario123",
            "cedula": "1000000002",
            "edad": 25,
        },
        {
            "email": "admin@mundoreporte.com",
            "nombre": "Administrador",
            "rol": Usuario.ROL_ADMIN,
            "password": "admin123",
            "cedula": "1000000003",
            "edad": 35,
            "is_staff": True,
        },
    ]
    
    print("=" * 60)
    print("CREANDO USUARIOS INICIALES EN SUPABASE")
    print("=" * 60)
    print()
    
    usuarios_creados = 0
    usuarios_existentes = 0
    
    for user_data in usuarios:
        email = user_data["email"]
        
        # Verificar si el usuario ya existe
        if Usuario.objects.filter(email=email).exists():
            print(f"✓ Usuario ya existe: {email}")
            usuarios_existentes += 1
            continue
        
        # Crear el usuario
        try:
            password = user_data.pop("password")
            usuario = Usuario.objects.create_user(**user_data)
            usuario.set_password(password)
            usuario.save()
            
            print(f"✓ Usuario creado: {email}")
            print(f"  - Nombre: {usuario.nombre}")
            print(f"  - Rol: {usuario.get_rol_display()}")
            print(f"  - Cédula: {usuario.cedula}")
            print()
            
            usuarios_creados += 1
        except Exception as e:
            print(f"✗ Error creando {email}: {e}")
            print()
    
    print("=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print(f"Usuarios creados: {usuarios_creados}")
    print(f"Usuarios ya existentes: {usuarios_existentes}")
    print(f"Total de usuarios: {Usuario.objects.count()}")
    print()
    
    if usuarios_creados > 0:
        print("=" * 60)
        print("CREDENCIALES DE ACCESO")
        print("=" * 60)
        print()
        print("ADMINISTRADOR:")
        print("  Email: andreyquic@gmail.com")
        print("  Password: admin123")
        print()
        print("OPERARIO:")
        print("  Email: operario@mundoreporte.com")
        print("  Password: operario123")
        print()
        print("ADMIN ALTERNATIVO:")
        print("  Email: admin@mundoreporte.com")
        print("  Password: admin123")
        print()
    
    print("=" * 60)
    print("VERIFICAR EN SUPABASE")
    print("=" * 60)
    print("1. Ve a: https://app.supabase.com")
    print("2. Selecciona tu proyecto")
    print("3. Ve a 'Table Editor' > 'usuarios_usuario'")
    print("4. Deberías ver los usuarios creados")
    print("=" * 60)


if __name__ == "__main__":
    crear_usuarios_iniciales()
