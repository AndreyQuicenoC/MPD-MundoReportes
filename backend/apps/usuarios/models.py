"""
Modelos de la aplicación de usuarios.

Define el modelo de Usuario personalizado con roles
de administrador y usuario operativo.
"""

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    """
    Manager personalizado para el modelo Usuario.

    Proporciona métodos para crear usuarios normales y superusuarios.
    """

    def create_user(self, email, password=None, **extra_fields):
        """
        Crear y guardar un usuario normal.

        Args:
            email: Email del usuario (será el username)
            password: Contraseña en texto plano (se hasheará)
            **extra_fields: Campos adicionales del modelo

        Returns:
            Usuario: Instancia del usuario creado

        Raises:
            ValueError: Si no se proporciona email
        """
        if not email:
            raise ValueError("El email es obligatorio")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Crear y guardar un superusuario.

        Args:
            email: Email del usuario
            password: Contraseña en texto plano
            **extra_fields: Campos adicionales

        Returns:
            Usuario: Instancia del superusuario creado
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("rol", Usuario.ROL_ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe tener is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe tener is_superuser=True")

        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """
    Modelo de usuario personalizado.

    Utiliza email como identificador único en lugar de username.
    Soporta dos roles: administrador y usuario operativo.
    """

    # Roles de usuario
    ROL_ADMIN = "admin"
    ROL_USUARIO = "usuario"

    ROLES_CHOICES = [
        (ROL_ADMIN, "Administrador"),
        (ROL_USUARIO, "Usuario"),
    ]

    # Campos principales
    email = models.EmailField(
        verbose_name="correo electrónico", max_length=255, unique=True, db_index=True
    )

    nombre = models.CharField(verbose_name="nombre completo", max_length=150)

    cedula = models.CharField(
        verbose_name="cédula", max_length=20, unique=True, null=True, blank=True
    )

    edad = models.PositiveIntegerField(verbose_name="edad", null=True, blank=True)

    fecha_ingreso = models.DateField(
        verbose_name="fecha de ingreso", null=True, blank=True
    )

    fecha_fin = models.DateField(
        verbose_name="fecha de fin", null=True, blank=True,
        help_text="Si se establece, el usuario no podrá acceder al sistema después de esta fecha"
    )

    rol = models.CharField(
        verbose_name="rol", max_length=20, choices=ROLES_CHOICES, default=ROL_USUARIO
    )

    # Campos de estado
    is_active = models.BooleanField(verbose_name="activo", default=True)

    is_staff = models.BooleanField(verbose_name="es staff", default=False)

    # Timestamps
    date_joined = models.DateTimeField(verbose_name="fecha de registro", default=timezone.now)

    last_login = models.DateTimeField(verbose_name="último acceso", null=True, blank=True)

    # Manager personalizado
    objects = UsuarioManager()

    # Configuración de autenticación
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nombre"]

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        ordering = ["-date_joined"]

    def __str__(self):
        """Representación en string del usuario."""
        return f"{self.nombre} ({self.email})"

    @property
    def es_administrador(self):
        """Verificar si el usuario es administrador."""
        return self.rol == self.ROL_ADMIN

    @property
    def es_usuario_operativo(self):
        """Verificar si el usuario es operativo."""
        return self.rol == self.ROL_USUARIO

    def puede_acceder(self):
        """
        Verificar si el usuario puede acceder al sistema.
        
        Returns:
            bool: True si el usuario está activo y no ha pasado su fecha_fin
        """
        from datetime import date
        
        if not self.is_active:
            return False
        
        if self.fecha_fin and date.today() > self.fecha_fin:
            return False
        
        return True
