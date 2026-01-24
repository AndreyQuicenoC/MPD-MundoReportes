"""
Vistas para la aplicación de usuarios.

Maneja autenticación, registro, perfil y gestión de usuarios.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from .serializers import (
    UsuarioSerializer,
    RegistroSerializer,
    CambioPasswordSerializer,
    PerfilSerializer,
)
from .permissions import EsAdministrador

Usuario = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializador personalizado de tokens JWT.

    Agrega información adicional del usuario en la respuesta del login.
    """

    def validate(self, attrs):
        """
        Validar credenciales y agregar datos del usuario.

        Args:
            attrs: Credenciales de login

        Returns:
            dict: Tokens y datos del usuario
        """
        data = super().validate(attrs)

        # Agregar información del usuario
        data["usuario"] = {
            "id": self.user.id,
            "email": self.user.email,
            "nombre": self.user.nombre,
            "rol": self.user.rol,
        }

        return data


class LoginView(TokenObtainPairView):
    """
    Vista de login.

    Autentica usuarios y devuelve tokens JWT junto con información del usuario.
    """

    serializer_class = CustomTokenObtainPairSerializer


class RegistroView(generics.CreateAPIView):
    """
    Vista de registro de usuarios.

    Solo administradores pueden crear nuevos usuarios.
    """

    queryset = Usuario.objects.all()
    serializer_class = RegistroSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrador]

    def create(self, request, *args, **kwargs):
        """
        Crear nuevo usuario.

        Args:
            request: Request HTTP

        Returns:
            Response: Datos del usuario creado
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "mensaje": "Usuario creado exitosamente",
                "usuario": UsuarioSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class PerfilView(generics.RetrieveUpdateAPIView):
    """
    Vista de perfil del usuario autenticado.

    Permite ver y actualizar datos del perfil.
    """

    serializer_class = PerfilSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        """
        Obtener el usuario autenticado.

        Returns:
            Usuario: Usuario actual
        """
        return self.request.user


class CambioPasswordView(APIView):
    """
    Vista para cambiar contraseña.

    Permite a usuarios autenticados cambiar su propia contraseña.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Cambiar contraseña del usuario.

        Args:
            request: Request HTTP con contraseñas

        Returns:
            Response: Confirmación del cambio
        """
        serializer = CambioPasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"mensaje": "Contraseña actualizada exitosamente"},
            status=status.HTTP_200_OK,
        )


class ListaUsuariosView(generics.ListAPIView):
    """
    Vista para listar todos los usuarios.

    Solo administradores pueden ver la lista completa de usuarios.
    """

    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrador]


class DetalleUsuarioView(generics.RetrieveUpdateDestroyAPIView):
    """
    Vista para ver, actualizar o eliminar un usuario específico.

    Solo administradores pueden gestionar usuarios.
    """

    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated, EsAdministrador]

    def destroy(self, request, *args, **kwargs):
        """
        Desactivar usuario en lugar de eliminarlo.

        Args:
            request: Request HTTP

        Returns:
            Response: Confirmación
        """
        instance = self.get_object()

        # No permitir desactivar al propio usuario
        if instance.id == request.user.id:
            return Response(
                {"error": "No puedes desactivar tu propio usuario"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Desactivar en lugar de eliminar
        instance.is_active = False
        instance.save()

        return Response(
            {"mensaje": "Usuario desactivado exitosamente"},
            status=status.HTTP_200_OK,
        )
