# Configuración de Supabase para Mundo Reporte

Este documento explica cómo configurar Supabase como base de datos para el proyecto Mundo Reporte.

## ¿Por qué Supabase?

Supabase es una alternativa a Firebase de código abierto que proporciona:
- **PostgreSQL gestionado** - Base de datos robusta y confiable
- **Backups automáticos** - Respaldos diarios por 7 días (plan gratuito)
- **Dashboard visual** - Interfaz web para administrar datos
- **Plan gratuito generoso** - 500MB de base de datos, suficiente para este proyecto
- **Escalabilidad** - Crece con tu negocio sin cambiar código

## Guía Rápida de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea una cuenta o inicia sesión (puedes usar GitHub)
3. Haz clic en **"New Project"**
4. Completa el formulario:
   - **Name**: `mundo-reporte` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña SEGURA
     - ⚠️ **IMPORTANTE**: Guarda esta contraseña, la necesitarás después
     - Usa al menos 12 caracteres con mayúsculas, minúsculas y números
   - **Region**: Elige la más cercana a tu ubicación:
     - `South America (São Paulo)` si estás en Latinoamérica
     - `US East (North Virginia)` si estás en Norteamérica
   - **Pricing Plan**: Free (incluye todo lo necesario)
5. Haz clic en **"Create new project"**
6. Espera ~2 minutos mientras se crea el proyecto

### 2. Ejecutar el Schema SQL

Una vez creado el proyecto:

1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"**
3. Abre el archivo `supabase_schema.sql` del proyecto (está en la raíz)
4. Copia **TODO** el contenido del archivo
5. Pega el contenido en el editor SQL de Supabase
6. Haz clic en **"Run"** (o presiona `Ctrl+Enter`)
7. Verifica que aparezca el mensaje de éxito
8. Verifica que las tablas se crearon:
   - En el menú lateral, clic en **"Table Editor"**
   - Deberías ver tablas como: `usuarios_usuario`, `productos_producto`, `reportes_reportediario`, etc.

### 3. Obtener la Cadena de Conexión

1. En el menú lateral, ve a **Settings** > **Database**
2. Busca la sección **"Connection string"**
3. Selecciona el modo **"URI"** (no Session mode)
4. Copia la cadena que aparece, se verá así:
   ```
   postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```
5. Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el paso 1
6. Guarda esta cadena completa para el siguiente paso

### 4. Configurar Variables de Entorno

1. En la carpeta `backend/` del proyecto, copia el archivo `.env.example` a `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Abre el archivo `backend/.env` y actualiza estos valores:

   ```dotenv
   # Pega aquí la cadena de conexión completa del paso 3
   DATABASE_URL=postgresql://postgres.abcdefghijklmnop:tu_password@aws-0-us-east-1.pooler.supabase.com:5432/postgres

   # Genera una nueva clave secreta para Django
   SECRET_KEY=django-insecure-GENERA-UNA-CLAVE-ALEATORIA-AQUI

   # En desarrollo
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

3. Para generar una `SECRET_KEY` segura, ejecuta:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

### 5. Verificar la Conexión

1. Activa el entorno virtual (si no está activado):
   ```bash
   # Windows
   cd backend
   .\venv\Scripts\activate

   # Linux/Mac
   cd backend
   source venv/bin/activate
   ```

2. Verifica que Django se conecte correctamente:
   ```bash
   python manage.py migrate
   ```
   
   Deberías ver:
   ```
   Operations to perform:
     Apply all migrations: admin, auth, contenttypes, sessions, ...
   No migrations to apply.
   ```

3. Crea un superusuario:
   ```bash
   python manage.py createsuperuser
   ```
   
   Completa los datos:
   - Email: tu@email.com
   - Nombre: Tu Nombre
   - Password: (contraseña segura)

4. Inicia el servidor:
   ```bash
   python manage.py runserver
   ```

5. Verifica que funcione abriendo: http://localhost:8000/api/schema/swagger/

## Verificar Datos en Supabase

1. Ve a tu proyecto en Supabase
2. En el menú lateral, clic en **"Table Editor"**
3. Selecciona la tabla `usuarios_usuario`
4. Deberías ver el superusuario que acabas de crear
5. También verás datos iniciales en:
   - `gastos_categoriagasto` - Categorías predefinidas
   - `productos_producto` - Productos de ejemplo

## Características de Supabase

### Backups Automáticos

- El plan gratuito incluye backups diarios por 7 días
- Para restaurar un backup:
  1. Ve a **Database** > **Backups**
  2. Selecciona el backup que deseas restaurar
  3. Haz clic en **"Restore"**

### Dashboard de Datos

- Puedes ver, editar y eliminar datos directamente desde **Table Editor**
- Útil para:
  - Verificar reportes creados
  - Corregir datos manualmente
  - Auditar información

### SQL Editor

- Ejecuta consultas SQL personalizadas
- Ejemplos útiles:
  ```sql
  -- Ver total de ventas por mes
  SELECT 
    DATE_TRUNC('month', fecha) as mes,
    SUM(venta_total) as total_ventas
  FROM reportes_reportediario
  GROUP BY mes
  ORDER BY mes DESC;

  -- Productos más vendidos
  SELECT 
    p.nombre,
    SUM(vp.cantidad) as total_vendido
  FROM reportes_ventaproducto vp
  JOIN productos_producto p ON vp.producto_id = p.id
  GROUP BY p.nombre
  ORDER BY total_vendido DESC
  LIMIT 10;
  ```

## Migración desde SQLite

Si ya tienes datos en SQLite local y quieres migrarlos a Supabase:

1. Exporta los datos desde SQLite:
   ```bash
   python manage.py dumpdata --natural-foreign --natural-primary > data.json
   ```

2. Configura Supabase (pasos 1-4 arriba)

3. Importa los datos:
   ```bash
   python manage.py loaddata data.json
   ```

## Limitaciones del Plan Gratuito

| Recurso | Límite Gratuito | ¿Es suficiente? |
|---------|----------------|-----------------|
| Espacio en DB | 500 MB | ✅ Sí (miles de reportes) |
| Transferencia | 1 GB/mes | ✅ Sí (uso moderado) |
| Storage | 2 GB | ✅ Sí (sin archivos grandes) |
| Pausado automático | Después de 1 semana de inactividad | ⚠️ Se reactiva al visitar |

**Nota**: El proyecto se pausa si no se usa por 7 días, pero se reactiva automáticamente al hacer una petición (toma ~1-2 minutos).

## Solución de Problemas

### Error: "No se puede conectar a la base de datos"

1. Verifica que copiaste correctamente la cadena de conexión
2. Asegúrate de reemplazar `[YOUR-PASSWORD]` con tu contraseña real
3. Verifica que no haya espacios al inicio o final de `DATABASE_URL`
4. En Supabase, ve a Settings > Database y verifica el estado de la base de datos

### Error: "La tabla no existe"

- Verifica que ejecutaste el script SQL completo en el paso 2
- En Supabase, ve a Table Editor y confirma que las tablas existen

### Error: "Authentication failed"

- La contraseña en `DATABASE_URL` no es correcta
- Ve a Settings > Database en Supabase y resetea la contraseña si es necesario

### El proyecto está pausado

- Esto es normal después de 7 días sin actividad
- Simplemente abre tu aplicación y espera 1-2 minutos
- El proyecto se reactivará automáticamente

## Producción

Para desplegar en producción:

1. Actualiza `backend/.env`:
   ```dotenv
   DEBUG=False
   ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
   CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
   ```

2. En Supabase, ve a Settings > Database > Connection Pooling
3. Usa la cadena de conexión con **Transaction Mode** para mejor rendimiento

## Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase + Django](https://supabase.com/docs/guides/getting-started/quickstarts/django)
- [PostgreSQL en Django](https://docs.djangoproject.com/en/5.0/ref/databases/#postgresql-notes)

## Soporte

Si tienes problemas:
1. Revisa la [documentación de Supabase](https://supabase.com/docs)
2. Revisa los logs en Settings > Logs en tu proyecto de Supabase
3. Verifica los mensajes de error de Django en la consola
