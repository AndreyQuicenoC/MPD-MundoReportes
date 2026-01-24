"""
Comando de Django para crear usuarios iniciales.
"""

from django.core.management.base import BaseCommand
from apps.usuarios.models import Usuario


class Command(BaseCommand):
    help = "Crea usuarios iniciales en Supabase"

    def handle(self, *args, **options):
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
        
        self.stdout.write("=" * 60)
        self.stdout.write("CREANDO USUARIOS INICIALES EN SUPABASE")
        self.stdout.write("=" * 60)
        self.stdout.write("")
        
        usuarios_creados = 0
        usuarios_existentes = 0
        
        for user_data in usuarios:
            email = user_data["email"]
            
            # Verificar si el usuario ya existe
            if Usuario.objects.filter(email=email).exists():
                self.stdout.write(f"✓ Usuario ya existe: {email}")
                usuarios_existentes += 1
                continue
            
            # Crear el usuario
            try:
                password = user_data.pop("password")
                usuario = Usuario.objects.create_user(**user_data)
                usuario.set_password(password)
                usuario.save()
                
                self.stdout.write(self.style.SUCCESS(f"✓ Usuario creado: {email}"))
                self.stdout.write(f"  - Nombre: {usuario.nombre}")
                self.stdout.write(f"  - Rol: {usuario.get_rol_display()}")
                self.stdout.write(f"  - Cédula: {usuario.cedula}")
                self.stdout.write("")
                
                usuarios_creados += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"✗ Error creando {email}: {e}"))
                self.stdout.write("")
        
        self.stdout.write("=" * 60)
        self.stdout.write("RESUMEN")
        self.stdout.write("=" * 60)
        self.stdout.write(f"Usuarios creados: {usuarios_creados}")
        self.stdout.write(f"Usuarios ya existentes: {usuarios_existentes}")
        self.stdout.write(f"Total de usuarios: {Usuario.objects.count()}")
        self.stdout.write("")
        
        if usuarios_creados > 0:
            self.stdout.write("=" * 60)
            self.stdout.write("CREDENCIALES DE ACCESO")
            self.stdout.write("=" * 60)
            self.stdout.write("")
            self.stdout.write("ADMINISTRADOR:")
            self.stdout.write("  Email: andreyquic@gmail.com")
            self.stdout.write("  Password: admin123")
            self.stdout.write("")
            self.stdout.write("OPERARIO:")
            self.stdout.write("  Email: operario@mundoreporte.com")
            self.stdout.write("  Password: operario123")
            self.stdout.write("")
            self.stdout.write("ADMIN ALTERNATIVO:")
            self.stdout.write("  Email: admin@mundoreporte.com")
            self.stdout.write("  Password: admin123")
            self.stdout.write("")
        
        self.stdout.write("=" * 60)
        self.stdout.write("VERIFICAR EN SUPABASE")
        self.stdout.write("=" * 60)
        self.stdout.write("1. Ve a: https://app.supabase.com")
        self.stdout.write("2. Selecciona tu proyecto")
        self.stdout.write("3. Ve a 'Table Editor' > 'usuarios_usuario'")
        self.stdout.write("4. Deberías ver los usuarios creados")
        self.stdout.write("=" * 60)
