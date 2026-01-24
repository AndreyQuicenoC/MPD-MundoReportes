"""
URLs de la aplicación de usuarios.

Define las rutas para autenticación y gestión de usuarios.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    RegistroView,
    PerfilView,
    CambioPasswordView,
    ListaUsuariosView,
    DetalleUsuarioView,
)
from .views_admin import AdminUsuarioViewSet, PerfilUsuarioViewSet

# Router para viewsets
router = DefaultRouter()
router.register(r"admin/usuarios", AdminUsuarioViewSet, basename="admin-usuarios")
router.register(r"perfil", PerfilUsuarioViewSet, basename="perfil-usuario")

app_name = "usuarios"

urlpatterns = [
    # Autenticación
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Perfil (vistas antiguas, mantener por compatibilidad)
    path("perfil-old/", PerfilView.as_view(), name="perfil-old"),
    path("cambiar-password/", CambioPasswordView.as_view(), name="cambiar_password"),
    # Gestión de usuarios (solo admin) - vistas antiguas
    path("usuarios/", ListaUsuariosView.as_view(), name="lista_usuarios"),
    path("usuarios/crear/", RegistroView.as_view(), name="crear_usuario"),
    path("usuarios/<int:pk>/", DetalleUsuarioView.as_view(), name="detalle_usuario"),
    # Incluir rutas del router (nuevos endpoints)
    path("", include(router.urls)),
]
