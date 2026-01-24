"""
Configuración del admin de Django para usuarios.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    """
    Configuración del admin para el modelo Usuario.
    """

    list_display = ["email", "nombre", "rol", "is_active", "date_joined"]
    list_filter = ["rol", "is_active", "is_staff"]
    search_fields = ["email", "nombre"]
    ordering = ["-date_joined"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Información personal", {"fields": ("nombre", "rol")}),
        (
            "Permisos",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Fechas importantes", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "nombre", "rol", "password1", "password2"),
            },
        ),
    )

    readonly_fields = ["date_joined", "last_login"]
