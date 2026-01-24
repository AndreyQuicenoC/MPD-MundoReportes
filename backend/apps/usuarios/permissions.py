"""
Permisos personalizados para la aplicación de usuarios.

Define permisos específicos para diferentes roles de usuario.
"""

from rest_framework import permissions


class EsAdministrador(permissions.BasePermission):
    """
    Permiso que solo permite acceso a administradores.

    Verifica que el usuario autenticado tenga rol de administrador.
    """

    message = "Solo los administradores pueden realizar esta acción"

    def has_permission(self, request, view):
        """
        Verificar si el usuario es administrador.

        Args:
            request: Request HTTP
            view: Vista que solicita el permiso

        Returns:
            bool: True si es administrador, False en caso contrario
        """
        return (
            request.user
            and request.user.is_authenticated
            and request.user.rol == "admin"
        )
