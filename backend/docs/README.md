# Documentación Backend

Documentación técnica específica del backend Django.

## Estructura

El backend está organizado en aplicaciones Django:

```
backend/
├── config/          # Configuración principal
├── apps/
│   ├── usuarios/    # Gestión de usuarios y autenticación
│   ├── reportes/    # Reportes diarios de ventas
│   ├── gastos/      # Gestión de gastos y categorías
│   ├── productos/   # Catálogo de productos
│   └── estadisticas/# Análisis y estadísticas
├── scripts/         # Scripts de utilidad
├── docs/            # Documentación (este directorio)
└── manage.py        # Comando principal de Django
```

## Modelos Principales

### Usuarios (apps.usuarios)

- **Usuario**: Usuario custom con rol (admin/usuario)

### Reportes (apps.reportes)

- **ReporteDiario**: Reporte diario con resumen de ventas y gastos
- **VentaProducto**: Detalle de productos vendidos

### Gastos (apps.gastos)

- **CategoriaGasto**: Categorías reutilizables
- **Gasto**: Gastos individuales asociados a reportes
- **GastoAutomatico**: Gastos predefinidos reutilizables
- **GastoDeducible**: Categorías marcadas como deducibles

### Productos (apps.productos)

- **Producto**: Catálogo de productos con precios

### Estadísticas (apps.estadisticas)

- Vistas para análisis y reportes

## API Endpoints

### Autenticación

- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/logout/` - Cerrar sesión
- `POST /api/auth/refresh/` - Refrescar token

### Reportes

- `GET /api/reportes/` - Lista de reportes
- `POST /api/reportes/` - Crear reporte
- `GET /api/reportes/{id}/` - Detalle de reporte
- `PUT /api/reportes/{id}/` - Actualizar reporte
- `DELETE /api/reportes/{id}/` - Eliminar reporte

### Productos

- `GET /api/productos/` - Lista de productos
- `POST /api/productos/crear/` - Crear producto
- `PUT /api/productos/{id}/` - Actualizar producto
- `DELETE /api/productos/{id}/` - Eliminar producto

### Gastos

- `GET /api/gastos/automaticos/` - Gastos automáticos
- `GET /api/gastos/deducibles/` - Gastos deducibles

## Variables de Entorno

Ver `.env.example` para la lista completa.

### Principales

- `DATABASE_URL` - URL de conexión a base de datos
- `SECRET_KEY` - Clave secreta de Django
- `DEBUG` - Modo debug (True/False)
- `CORS_ALLOWED_ORIGINS` - Orígenes permitidos para CORS
- `JWT_ACCESS_TOKEN_LIFETIME` - Minutos de validez del token

## Desarrollo Local

1. Crear entorno virtual:

   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   ```

2. Instalar dependencias:

   ```bash
   pip install -r requirements.txt
   ```

3. Configurar base de datos:

   ```bash
   python manage.py migrate
   ```

   > **Importante**: No ejecutar `crear_datos_prueba` en producción. El sistema carga datos reales de Supabase. Para crear un usuario admin, usar:
   > ```bash
   > python manage.py crear_superusuario
   > ```

4. Ejecutar servidor:
   ```bash
   python manage.py runserver
   ```

El API estará disponible en http://localhost:8000/api/

## Nota sobre Datos

El sistema está configurado para cargar **datos reales** de la base de datos Supabase especificada en `DATABASE_URL`. No se crean automáticamente datos sintéticos.

- Los usuarios deben ser creados manualmente en Supabase o usando los comandos de management
- Los productos, categorías y otros datos deben insertarse directamente en la base de datos
- El frontend solo carga datos que existen en Supabase a través de la API
