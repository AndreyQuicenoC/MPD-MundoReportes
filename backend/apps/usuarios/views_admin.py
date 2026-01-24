"""
Vistas para gestión de usuarios por administradores y perfil de usuario.

Incluye endpoints para CRUD de usuarios (solo admin) y gestión de perfil.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .serializers_admin import (
    AdminUsuarioSerializer,
    AdminCrearUsuarioSerializer,
    AdminActualizarUsuarioSerializer,
    PerfilUsuarioSerializer,
    CambiarContrasenaSerializer,
)
from .permissions import EsAdministrador

Usuario = get_user_model()


class AdminUsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para que administradores gestionen usuarios.

    Endpoints:
    - GET /api/admin/usuarios/ - Listar todos los usuarios
    - POST /api/admin/usuarios/ - Crear nuevo usuario
    - GET /api/admin/usuarios/{id}/ - Ver detalle de usuario
    - PUT/PATCH /api/admin/usuarios/{id}/ - Actualizar usuario
    - DELETE /api/admin/usuarios/{id}/ - Eliminar usuario (soft delete)
    """

    permission_classes = [IsAuthenticated, EsAdministrador]
    queryset = Usuario.objects.all().order_by("-date_joined")

    def get_serializer_class(self):
        """Retornar el serializador apropiado según la acción."""
        if self.action == "create":
            return AdminCrearUsuarioSerializer
        elif self.action in ["update", "partial_update"]:
            return AdminActualizarUsuarioSerializer
        return AdminUsuarioSerializer

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete: desactivar usuario en lugar de eliminarlo.
        """
        instance = self.get_object()

        # No permitir que el admin se elimine a sí mismo
        if instance.id == request.user.id:
            return Response(
                {"error": "No puedes desactivar tu propia cuenta"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        instance.is_active = False
        instance.save()

        return Response(
            {"mensaje": "Usuario desactivado exitosamente"},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def activar(self, request, pk=None):
        """
        Activar un usuario desactivado.

        POST /api/admin/usuarios/{id}/activar/
        """
        usuario = self.get_object()
        usuario.is_active = True
        usuario.save()

        return Response(
            {"mensaje": "Usuario activado exitosamente"},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["delete"])
    def eliminar_permanente(self, request, pk=None):
        """
        Eliminar permanentemente un usuario (hard delete).

        DELETE /api/admin/usuarios/{id}/eliminar_permanente/
        """
        usuario = self.get_object()

        # No permitir que el admin se elimine a sí mismo
        if usuario.id == request.user.id:
            return Response(
                {"error": "No puedes eliminar tu propia cuenta"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        nombre_usuario = usuario.nombre
        email_usuario = usuario.email
        usuario.delete()

        return Response(
            {"mensaje": f"Usuario {nombre_usuario} ({email_usuario}) eliminado permanentemente"},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def estadisticas(self, request):
        """
        Obtener estadísticas de usuarios.

        GET /api/admin/usuarios/estadisticas/
        """
        total_usuarios = Usuario.objects.count()
        usuarios_activos = Usuario.objects.filter(is_active=True).count()
        usuarios_admin = Usuario.objects.filter(rol=Usuario.ROL_ADMIN).count()
        usuarios_operativos = Usuario.objects.filter(rol=Usuario.ROL_USUARIO).count()

        # Usuarios con fecha_fin próxima (dentro de 30 días)
        from datetime import date, timedelta

        fecha_limite = date.today() + timedelta(days=30)
        usuarios_proximos_vencer = Usuario.objects.filter(
            fecha_fin__lte=fecha_limite,
            fecha_fin__gte=date.today(),
            is_active=True,
        ).count()

        return Response(
            {
                "total_usuarios": total_usuarios,
                "usuarios_activos": usuarios_activos,
                "usuarios_inactivos": total_usuarios - usuarios_activos,
                "usuarios_admin": usuarios_admin,
                "usuarios_operativos": usuarios_operativos,
                "usuarios_proximos_vencer": usuarios_proximos_vencer,
            }
        )


class PerfilUsuarioAPIView(APIView):
    """
    API View para gestión del perfil del usuario autenticado.

    Endpoints:
    - GET /api/auth/perfil/ - Ver perfil actual
    - PUT /api/auth/perfil/ - Actualizar perfil completo
    - PATCH /api/auth/perfil/ - Actualizar perfil parcialmente
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtener perfil del usuario autenticado."""
        serializer = PerfilUsuarioSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """Actualizar perfil completo del usuario autenticado."""
        serializer = PerfilUsuarioSerializer(request.user, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        """Actualizar perfil parcialmente del usuario autenticado."""
        serializer = PerfilUsuarioSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CambiarContrasenaAPIView(APIView):
    """
    API View para cambiar la contraseña del usuario autenticado.

    Endpoint:
    - POST /api/auth/perfil/cambiar-contrasena/ - Cambiar contraseña
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Cambiar contraseña del usuario autenticado."""
        serializer = CambiarContrasenaSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"mensaje": "Contraseña cambiada exitosamente"},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
