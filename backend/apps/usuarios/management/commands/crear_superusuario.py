"""
Comando de Django para crear el superusuario por defecto.

Este comando crea el superusuario administrador con credenciales
predeterminadas si no existe en el sistema.
"""

from django.core.management.base import BaseCommand
from apps.usuarios.models import Usuario


class Command(BaseCommand):
    """Comando para crear el superusuario por defecto."""

    help = "Crea el superusuario administrador por defecto si no existe"

    def handle(self, *args, **options):
        """
        Ejecutar el comando.

        Crea el superusuario con correo andreyquic@gmail.com
        si no existe ningún usuario con ese correo.
        """
        admin_email = "andreyquic@gmail.com"
        admin_password = "11Bakuarya11"
        admin_nombre = "Administrador del Sistema"

        # Verificar si el superusuario ya existe
        if Usuario.objects.filter(email=admin_email).exists():
            self.stdout.write(
                self.style.WARNING(
                    f"El superusuario {admin_email} ya existe. No se creará nuevamente."
                )
            )
            return

        # Crear el superusuario
        try:
            admin_user = Usuario.objects.create_superuser(
                email=admin_email,
                password=admin_password,
                nombre=admin_nombre,
                cedula="0000000000",
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ Superusuario creado exitosamente: {admin_user.email}"
                )
            )
            self.stdout.write(
                self.style.SUCCESS(f"  Nombre: {admin_user.nombre}")
            )
            self.stdout.write(
                self.style.SUCCESS(f"  Rol: {admin_user.get_rol_display()}")
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f"✗ Error al crear superusuario: {str(e)}")
            )
