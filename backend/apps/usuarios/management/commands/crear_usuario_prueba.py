"""
Comando de management para crear usuario de prueba.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta

Usuario = get_user_model()


class Command(BaseCommand):
    help = 'Crea un usuario administrador de prueba'

    def handle(self, *args, **kwargs):
        email = 'adolfo.quiceno@correounivalle.edu.co'
        password = '11Bakuarya11*'
        
        # Verificar si ya existe
        if Usuario.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Usuario {email} ya existe'))
            usuario = Usuario.objects.get(email=email)
            # Actualizar contraseña
            usuario.set_password(password)
            usuario.save()
            self.stdout.write(self.style.SUCCESS(f'Contraseña actualizada para {email}'))
        else:
            # Crear nuevo usuario
            usuario = Usuario.objects.create_user(
                email=email,
                password=password,
                nombre='Adolfo Quiceno',
                rol='admin',
                cedula='1234567890',
                is_staff=True,
                is_superuser=True,
                fecha_inicio_acceso=datetime.now(),
                fecha_fin_acceso=datetime.now() + timedelta(days=365)
            )
            self.stdout.write(self.style.SUCCESS(f'✅ Usuario creado: {email}'))
        
        self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
        self.stdout.write(self.style.SUCCESS(f'Rol: {usuario.rol}'))
        self.stdout.write(self.style.SUCCESS(f'Activo: {usuario.is_active}'))
