"""
Configuración de URLs para el proyecto Mundo Reporte.

Este módulo define todas las rutas principales del proyecto,
incluyendo el admin de Django, endpoints de API y documentación.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Admin de Django
    path("admin/", admin.site.urls),
    # API endpoints
    path("api/auth/", include("apps.usuarios.urls")),
    path("api/reportes/", include("apps.reportes.urls")),
    path("api/gastos/", include("apps.gastos.urls")),
    path("api/productos/", include("apps.productos.urls")),
    path("api/estadisticas/", include("apps.estadisticas.urls")),
    # Documentación de API
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Configurar títulos del admin
admin.site.site_header = "Mundo Reporte Admin"
admin.site.site_title = "Mundo Reporte"
admin.site.index_title = "Administración del Sistema"
