import os
import sys

# Agregar el directorio backend al path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Configurar Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from apps.usuarios.models import Usuario

# Crear usuarios
usuarios_data = [
    {
        "email": "andreyquic@gmail.com",
        "nombre": "Andrey Quiceno",
        "rol": Usuario.ROL_ADMIN,
        "cedula": "1000000001",
        "edad": 30,
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "email": "operario@mundoreporte.com",
        "nombre": "Operario de Prueba",
        "rol": Usuario.ROL_USUARIO,
        "cedula": "1000000002",
        "edad": 25,
    },
]

print("=" * 60)
print("CREANDO USUARIOS EN SUPABASE")
print("=" * 60)

for user_data in usuarios_data:
    email = user_data["email"]
    
    if Usuario.objects.filter(email=email).exists():
        print(f"✓ Usuario ya existe: {email}")
    else:
        usuario = Usuario.objects.create_user(**user_data)
        usuario.set_password("admin123" if usuario.rol == Usuario.ROL_ADMIN else "operario123")
        usuario.save()
        print(f"✓ Usuario creado: {email} ({usuario.get_rol_display()})")

print("\nTotal usuarios:", Usuario.objects.count())
print("\nCREDENCIALES:")
print("  Admin: andreyquic@gmail.com / admin123")
print("  Operario: operario@mundoreporte.com / operario123")
print("=" * 60)
