# 🔧 Configuración de Variables de Entorno para Render

## ⚠️ SOLUCIÓN A PROBLEMAS DE CONEXIÓN IPv6

Si encuentras errores como:

```
connection to server at "2600:1f13:838:6e04..." failed: Network is unreachable
```

Esto significa que Render está intentando usar IPv6 pero no puede conectarse a Supabase.

---

## 📝 Variables de Entorno Requeridas en Render

Ve a tu servicio en Render → Environment → Add Environment Variable

### 1. SECRET_KEY

```
SECRET_KEY=#_x4#0^pm$8@sy=-*!bv4mdnu7t5)j&z)&zx#m)d9@e&rzcvy&
```

### 2. DEBUG

```
DEBUG=False
```

### 3. ALLOWED_HOSTS

```
ALLOWED_HOSTS=mundoreportes.onrender.com
```

### 4. DATABASE_URL (⚠️ IMPORTANTE)

**OPCIÓN 1: Usando dirección IPv4 directa**

```
DATABASE_URL=postgresql://postgres:9nG??J@7e9nb$@u@35.209.89.120:5432/postgres?options=-c%20jit%3Doff
```

**OPCIÓN 2: Forzar IPv4 con parámetros adicionales**

```
DATABASE_URL=postgresql://postgres:9nG??J@7e9nb$@u@db.zmcqlwkkspjflzrugxam.supabase.co:5432/postgres?options=-c%20jit%3Doff&target_session_attrs=read-write
```

**OPCIÓN 3: URL simple (si las opciones en settings.py funcionan)**

```
DATABASE_URL=postgresql://postgres:9nG??J@7e9nb$@u@db.zmcqlwkkspjflzrugxam.supabase.co:5432/postgres
```

> **Nota**: La contraseña real es `9nG??J@7e9nb$@u` pero en URL debe estar codificada como `9nG%3F%3FJ%407e9nb%24%40u`

### 5. CORS_ALLOWED_ORIGINS

```
CORS_ALLOWED_ORIGINS=https://mundoreportes.vercel.app
```

### 6. JWT_ACCESS_TOKEN_LIFETIME

```
JWT_ACCESS_TOKEN_LIFETIME=60
```

### 7. JWT_REFRESH_TOKEN_LIFETIME

```
JWT_REFRESH_TOKEN_LIFETIME=1440
```

---

## 🔍 Cómo obtener la IP IPv4 de Supabase

Si necesitas la dirección IPv4 directa de Supabase:

### En Windows (PowerShell):

```powershell
[System.Net.Dns]::GetHostAddresses("db.zmcqlwkkspjflzrugxam.supabase.co") | Where-Object { $_.AddressFamily -eq 'InterNetwork' }
```

### En Linux/Mac:

```bash
dig +short db.zmcqlwkkspjflzrugxam.supabase.co A
```

O:

```bash
nslookup db.zmcqlwkkspjflzrugxam.supabase.co | grep Address | tail -n1
```

---

## 🚀 Pasos para Redeployar

1. **Actualiza las variables de entorno en Render** con las configuraciones anteriores

2. **Si usas la IP directa**, asegúrate de que sea la IPv4 actual (las IPs de Supabase pueden cambiar)

3. **Redeploy manual**:
   - Ve a tu servicio en Render
   - Click en "Manual Deploy" → "Deploy latest commit"

4. **Verifica los logs**:
   - Durante el deployment, verifica que:
     - ✅ Las migraciones se ejecutan correctamente
     - ✅ No hay intentos de crear usuarios (eliminado)
     - ✅ La conexión a la base de datos es exitosa

---

## 🐛 Troubleshooting

### Error: "Network is unreachable" (IPv6)

- **Solución**: Usa la IP IPv4 directa en DATABASE_URL o agrega `?options=-c%20jit%3Doff`

### Error: "password authentication failed"

- **Solución**: Verifica que la contraseña esté correctamente codificada en URL
  - `?` → `%3F`
  - `@` → `%40`
  - `$` → `%24`

### Error: "SSL connection required"

- **Solución**: Agrega `?sslmode=require` al final de DATABASE_URL

### Error: Timeout en conexión

- **Solución**: Las opciones en `settings.py` ya incluyen `connect_timeout=10`

---

## ✅ Verificar Conexión Exitosa

Una vez desplegado, revisa los logs de Render. Deberías ver:

```
🔄 Ejecutando migraciones...
Operations to perform:
  Apply all migrations: ...
Running migrations:
  No migrations to apply.

📁 Recolectando archivos estáticos...
161 static files copied to '/opt/render/project/src/backend/staticfiles'

🚀 Iniciando servidor...
[INFO] Starting gunicorn
[INFO] Listening at: http://0.0.0.0:10000
[INFO] Booting worker with pid: XX

==> Your service is live 🎉
```

---

## 🌐 Verificar Frontend → Backend

Una vez desplegado el backend, actualiza el frontend en Vercel:

### Variables de Entorno en Vercel:

```
VITE_API_URL=https://mundoreportes.onrender.com/api
```

### Prueba la conexión:

```javascript
// En la consola del navegador en https://mundoreportes.vercel.app
fetch("https://mundoreportes.onrender.com/api/auth/login/", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "admin@mundoreporte.com",
    password: "Admin123!@#",
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

---

## 📊 Resumen de Cambios Realizados

### ✅ Archivos Modificados:

1. **backend/start.sh**
   - ❌ Eliminado: `python manage.py crear_usuario_prueba`
   - ✅ Los usuarios se gestionan en Supabase

2. **backend/config/settings.py**
   - ✅ Agregadas opciones de conexión IPv4
   - ✅ Timeout de conexión configurado
   - ✅ Opciones de PostgreSQL optimizadas

3. **backend/.env** (local)
   - ✅ DATABASE_URL actualizado con parámetros de optimización

---

## 🔐 Seguridad

**⚠️ IMPORTANTE**: Las contraseñas y claves mostradas aquí son de ejemplo. En producción:

1. Nunca compartas estas credenciales públicamente
2. Usa variables de entorno en Render (nunca en el código)
3. Rota las claves regularmente
4. Considera usar Secrets Manager

---

## 📞 Soporte

Si los problemas persisten:

1. Verifica que Supabase esté activo y accesible
2. Revisa los logs completos en Render
3. Prueba la conexión desde otro servicio
4. Contacta al soporte de Render o Supabase si es necesario
