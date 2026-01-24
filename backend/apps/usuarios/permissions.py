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
        return request.user and request.user.is_authenticated and request.user.rol == "admin"


class EsOperario(permissions.BasePermission):
    """
    Permiso que solo permite acceso a usuarios operarios.

    Verifica que el usuario autenticado tenga rol de usuario (operario).
    """

    message = "Solo los usuarios operarios pueden realizar esta acción"

    def has_permission(self, request, view):
        """
        Verificar si el usuario es operario.

        Args:
            request: Request HTTP
            view: Vista que solicita el permiso

        Returns:
            bool: True si es operario, False en caso contrario
        """
        return request.user and request.user.is_authenticated and request.user.rol == "usuario"


class EsOperarioOAdmin(permissions.BasePermission):
    """
    Permiso que permite acceso tanto a administradores como operarios.

    Útil para funciones compartidas entre roles.
    """

    message = "Necesitas estar autenticado para realizar esta acción"

    def has_permission(self, request, view):
        """
        Verificar si el usuario está autenticado.

        Args:
            request: Request HTTP
            view: Vista que solicita el permiso

        Returns:
            bool: True si está autenticado
        """
        return request.user and request.user.is_authenticated
