# Supabase Integration Guide

Este documento explica cómo usar Mundo Reporte con Supabase en desarrollo local.

## Estado Actual

✅ **Backend conectado a Supabase PostgreSQL**
✅ **Migraciones aplicadas (nuevas tablas creadas)**
✅ **Datos de prueba disponibles**
✅ **Autenticación funcional con JWT**
✅ **CORS configurado correctamente**

## Credenciales de Prueba

```
Email:     usuario@prueba.com
Contraseña: 123456789
Rol:       usuario
```

## Datos Disponibles en Supabase

| Recurso | Cantidad | Detalles |
|---------|----------|----------|
| **Usuarios** | 7 | Incluyendo usuario de prueba |
| **Productos** | 29 | Catálogo completo de pinturas y accesorios |
| **Categorías** | 41 | Categorías de gastos reutilizables |
| **Gastos Automáticos** | 4 | Gastos predefinidos (arriendo, servicios, salario, gasolina) |
| **Reportes** | 90 | Última 10 días con datos sintéticos |

## Conexión a Supabase

### Variables de Entorno

El backend está configurado con estas variables en `.env`:

```env
DATABASE_URL=postgresql://postgres.zmcqlwkkspjflzrugxam:...@aws-0-us-west-2.pooler.supabase.com:6543/postgres
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:5175,http://127.0.0.1:5175
DEBUG=True
```

### Tablas Nuevas Creadas

Durante esta integración se crearon dos nuevas tablas:

1. **gastos_gastoautomatico**
   - Gastos predefinidos reutilizables
   - Campos: descripcion, valor, categoria_id, activo, timestamps

2. **gastos_gastodeducible**
   - Categorías marcadas como deducibles
   - Campos: tipo (transferencia/ahorro/ingreso), categoria_id (unique), activo, timestamps

## Iniciar la Aplicación

### Backend (Django)

```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

El API estará disponible en: **http://localhost:8000/api/**

### Frontend (React)

```bash
cd frontend
npm install  # (primera vez)
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173**

## Test de Conexión

### Probar Login vía cURL

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@prueba.com",
    "password": "123456789"
  }'
```

**Respuesta esperada:** Tokens JWT para acceso y refresh

### Probar API desde Frontend

1. Abre http://localhost:5173
2. Ingresa credentials:
   - Email: `usuario@prueba.com`
   - Password: `123456789`
3. Verifica que se carguen los reportes y datos

## Alternativas de Base de Datos

### Cambiar a SQLite (Local)

Si necesitas trabajar sin conexión a Supabase:

```env
# En backend/.env, comenta Supabase y descomenta SQLite:
DATABASE_URL=sqlite:///db.sqlite3
```

Luego ejecuta:
```bash
python manage.py migrate
python manage.py crear_datos_prueba
```

### Cambiar de vuelta a Supabase

```env
DATABASE_URL=postgresql://postgres.zmcqlwkkspjflzrugxam:...@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

## Endpoints Principales

### Autenticación
- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/logout/` - Cerrar sesión
- `POST /api/auth/refresh/` - Refrescar token

### Reportes
- `GET /api/reportes/` - Lista de reportes
- `POST /api/reportes/` - Crear reporte
- `GET /api/reportes/{id}/` - Detalle de reporte

### Gastos Automáticos
- `GET /api/gastos/automaticos/` - Lista de gastos automáticos

### Gastos Deducibles
- `GET /api/gastos/deducibles/` - Lista de gastos deducibles

## Script SQL Manual

Si necesitas crear las tablas manualmente en Supabase, usa el script:

```bash
backend/scripts/supabase_create_tables.sql
```

Cópialo en el editor SQL de Supabase y ejecútalo.

## Troubleshooting

### Error: "No se puede conectar a Supabase"

**Solución:** Verifica que la URL de conexión sea correcta en `.env` y que tengas acceso a internet.

### Error: "CORS Policy blocked"

**Solución:** Asegúrate de que `CORS_ALLOWED_ORIGINS` incluya `http://localhost:5173` y `http://localhost:5175`.

### Error: "Tabla no existe"

**Solución:** Ejecuta `python manage.py migrate` para aplicar todas las migraciones.

## Próximos Pasos

- [ ] Desplegar frontend a Vercel
- [ ] Desplegar backend a Render
- [ ] Configurar SSL/HTTPS
- [ ] Implementar más funcionalidades (PDF export completo, estadísticas mejoradas)

---

**Última actualización:** 2026-04-09
**Versión:** 1.1.0
**Estado:** Funcionando con Supabase en desarrollo local
