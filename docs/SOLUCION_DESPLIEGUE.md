# 🔧 SOLUCIÓN: Error de Conexión IPv6 en Render + Supabase

## ❌ Problema Identificado

Tu despliegue en Render está fallando porque:

1. **IPv6 no soportado**: Render intenta conectarse a Supabase usando IPv6 (`2600:1f13:...`) pero la red no lo permite
2. **Script innecesario**: El deployment intenta crear usuarios de prueba, pero con Supabase esto no es necesario
3. **Configuración de conexión**: Faltan opciones para forzar IPv4

## ✅ Soluciones Aplicadas (Ya Implementadas en el Código)

### 1. ✅ Eliminado script de creación de usuarios

- **Archivo**: `backend/start.sh`
- **Cambio**: Eliminada la línea `python manage.py crear_usuario_prueba`
- **Razón**: Los usuarios se gestionan directamente en Supabase

### 2. ✅ Actualizado DATABASE_URL local

- **Archivo**: `backend/.env`
- **Cambio**: Agregado `?options=-c%20jit%3Doff` para optimizar conexión

### 3. ✅ Configuración mejorada en settings.py

- **Archivo**: `backend/config/settings.py`
- **Cambios**:
  - Agregado `connect_timeout=10`
  - Agregadas opciones de PostgreSQL
  - Configuración específica para producción

---

## 🚀 PASOS PARA SOLUCIONAR EN RENDER

### Paso 1: Actualizar Variables de Entorno en Render

Ve a **Render Dashboard** → Tu servicio backend → **Environment**

#### Opción A: Usar pooler de Supabase (RECOMENDADO)

En Supabase, ve a **Database Settings** → **Connection Pooling** y copia la URI de "Transaction" mode:

```
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

#### Opción B: Usar conexión directa con parámetros

```
DATABASE_URL=postgresql://postgres:9nG%3F%3FJ%407e9nb%24%40u@db.zmcqlwkkspjflzrugxam.supabase.co:5432/postgres?sslmode=require
```

#### Otras Variables Requeridas:

```
SECRET_KEY=#_x4#0^pm$8@sy=-*!bv4mdnu7t5)j&z)&zx#m)d9@e&rzcvy&
DEBUG=False
ALLOWED_HOSTS=mundoreportes.onrender.com
CORS_ALLOWED_ORIGINS=https://mundoreportes.vercel.app
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440
```

### Paso 2: Hacer Commit y Push de los Cambios

Los archivos ya han sido modificados. Ahora necesitas subirlos:

```powershell
# En la terminal de VS Code (en la carpeta del proyecto)
git add backend/start.sh backend/config/settings.py backend/.env
git commit -m "fix: Eliminar creación de usuarios y mejorar conexión IPv4 a Supabase"
git push origin main
```

### Paso 3: Redeploy en Render

1. Ve a tu servicio en Render
2. Click en **"Manual Deploy"** → **"Deploy latest commit"**
3. O espera el auto-deploy si está configurado

### Paso 4: Verificar los Logs

Durante el deployment, deberías ver:

```
✅ 🔄 Ejecutando migraciones...
✅ Operations to perform: Apply all migrations
✅ Running migrations: No migrations to apply
✅ 📁 Recolectando archivos estáticos...
✅ 161 static files copied
✅ 🚀 Iniciando servidor...
✅ [INFO] Starting gunicorn
✅ Your service is live 🎉
```

---

## 🌐 VERIFICAR FRONTEND EN VERCEL

### Paso 1: Configurar Variable de Entorno

En **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**:

```
VITE_API_URL=https://mundoreportes.onrender.com/api
```

### Paso 2: Redeploy Frontend

```bash
# Opción 1: Desde Vercel Dashboard
# Click en "Redeploy" en el último deployment

# Opción 2: Hacer push de un cambio
git commit --allow-empty -m "redeploy: Actualizar conexión con backend"
git push origin main
```

### Paso 3: Probar la Conexión

Abre la consola del navegador en `https://mundoreportes.vercel.app` y ejecuta:

```javascript
// Verificar que la URL del API es correcta
console.log(import.meta.env.VITE_API_URL);

// Probar el endpoint de login
fetch("https://mundoreportes.onrender.com/api/auth/login/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    email: "admin@mundoreporte.com",
    password: "Admin123!@#",
  }),
})
  .then((response) => {
    console.log("Status:", response.status);
    return response.json();
  })
  .then((data) => console.log("Response:", data))
  .catch((error) => console.error("Error:", error));
```

Si funciona, deberías ver:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": { ... }
}
```

---

## 🔍 ALTERNATIVA: Usar Connection Pooler de Supabase

**MEJOR OPCIÓN** para deployment:

1. Ve a tu proyecto en Supabase
2. **Database** → **Connection Pooling**
3. Copia la "Transaction" connection string
4. Úsala como `DATABASE_URL` en Render

Ejemplo:

```
DATABASE_URL=postgresql://postgres.zmcqlwkkspjflzrugxam:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Ventajas**:

- ✅ Mejor manejo de conexiones
- ✅ Menos problemas con IPv6
- ✅ Pooling automático
- ✅ Más estable en producción

---

## 🐛 Si Persisten los Errores

### Error: "connection timeout"

```bash
# En Render, agrega esta variable:
DATABASE_CONN_MAX_AGE=0
```

### Error: "SSL required"

```bash
# Asegúrate que DATABASE_URL incluya:
?sslmode=require
```

### Error: "too many connections"

```bash
# Usa el pooler de Supabase (ver arriba)
# O limita las conexiones en settings.py:
CONN_MAX_AGE=0
```

### Error: CORS en login

```bash
# Verifica en Render que CORS_ALLOWED_ORIGINS incluye:
https://mundoreportes.vercel.app
```

---

## ✅ Checklist Final

Antes de declarar el deployment exitoso, verifica:

### Backend (Render):

- [ ] Variables de entorno configuradas
- [ ] Deployment sin errores de migración
- [ ] Logs muestran "Your service is live 🎉"
- [ ] https://mundoreportes.onrender.com/api/auth/login/ responde (aunque sea 405 GET)
- [ ] No hay errores de "Network is unreachable"

### Frontend (Vercel):

- [ ] VITE_API_URL apunta a Render
- [ ] Página carga sin errores
- [ ] Formulario de login aparece
- [ ] Al hacer login, se conecta al backend

### Conexión completa:

- [ ] Puedes hacer login desde el frontend desplegado
- [ ] Los datos se guardan en Supabase
- [ ] El dashboard carga correctamente

---

## 📊 Resumen de Archivos Modificados

```
✅ backend/start.sh              - Eliminado crear_usuario_prueba
✅ backend/config/settings.py    - Mejorada configuración de DB
✅ backend/.env                  - Actualizado DATABASE_URL
📝 RENDER_CONFIG.md              - Documentación detallada
📝 SOLUCION_DESPLIEGUE.md        - Esta guía paso a paso
```

---

## 🆘 Soporte Adicional

Si después de seguir todos los pasos aún hay problemas:

1. **Verifica que Supabase esté activo**:
   - Ve a tu dashboard de Supabase
   - Verifica que el proyecto no esté pausado
   - Prueba la conexión desde "SQL Editor"

2. **Verifica los logs completos de Render**:
   - Busca cualquier error específico
   - Especialmente en la sección de migraciones

3. **Prueba la conexión manualmente**:

   ```bash
   # Desde tu computadora local
   psql "postgresql://postgres:9nG??J@7e9nb$@u@db.zmcqlwkkspjflzrugxam.supabase.co:5432/postgres"
   ```

4. **Contacta soporte**:
   - Render: https://render.com/docs/support
   - Supabase: https://supabase.com/support
