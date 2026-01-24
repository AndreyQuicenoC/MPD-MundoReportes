"""
URLs de la aplicación de usuarios.

Define las rutas para autenticación y gestión de usuarios.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    RegistroView,
    PerfilView,
    CambioPasswordView,
    ListaUsuariosView,
    DetalleUsuarioView,
)

app_name = "usuarios"

urlpatterns = [
    # Autenticación
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Perfil
    path("perfil/", PerfilView.as_view(), name="perfil"),
    path("cambiar-password/", CambioPasswordView.as_view(), name="cambiar_password"),
    # Gestión de usuarios (solo admin)
    path("usuarios/", ListaUsuariosView.as_view(), name="lista_usuarios"),
    path("usuarios/crear/", RegistroView.as_view(), name="crear_usuario"),
    path("usuarios/<int:pk>/", DetalleUsuarioView.as_view(), name="detalle_usuario"),
]
