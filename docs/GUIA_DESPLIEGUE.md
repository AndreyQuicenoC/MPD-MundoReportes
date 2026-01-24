# 🚀 Guía de Despliegue - Mundo Reporte v1.1.0

Guía rápida para desplegar el sistema en producción.

---

## 📋 Pre-requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL (Supabase configurado)
- Cuenta de hosting (Render, Railway, Vercel, etc.)

---

## 🔧 Configuración de Variables de Entorno

### Backend (.env)

Crea el archivo `backend/.env` con:

```env
# Django
SECRET_KEY=tu-clave-secreta-generada-aqui
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com

# Database (Supabase)
DATABASE_URL=postgresql://postgres.REFERENCIA:PASSWORD@HOST:5432/postgres

# CORS (si frontend y backend están en dominios separados)
CORS_ALLOWED_ORIGINS=https://tu-frontend.com
```

**Generar SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Frontend (.env)

Crea el archivo `frontend/.env` con:

```env
VITE_API_URL=https://tu-backend.com/api
```

---

## 📦 Despliegue del Backend (Django)

### 1. Instalar dependencias
```bash
cd backend
pip install -r requirements.txt
```

### 2. Ejecutar migraciones
```bash
python manage.py migrate
```

### 3. Crear superusuario (opcional)
```bash
python manage.py createsuperuser
```

### 4. Colectar archivos estáticos
```bash
python manage.py collectstatic --noinput
```

### 5. Iniciar servidor de producción
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

**Archivo `Procfile` para Heroku/Render:**
```
web: gunicorn config.wsgi:application
release: python manage.py migrate
```

---

## 🎨 Despliegue del Frontend (React)

### 1. Instalar dependencias
```bash
cd frontend
npm install
```

### 2. Compilar para producción
```bash
npm run build
```

### 3. Servir archivos estáticos
Los archivos compilados estarán en `frontend/build/`.

**Para Vercel/Netlify:** Configurar:
- Build command: `npm run build`
- Output directory: `build`
- Node version: `18.x`

**Para servidor propio (con Nginx):**
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /ruta/a/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🔍 Verificación Post-Despliegue

### Backend
```bash
curl https://tu-backend.com/api/health/
```

### Frontend
Abre en navegador: `https://tu-dominio.com`

### Checklist:
- [ ] Login funciona correctamente
- [ ] Se pueden crear/editar reportes
- [ ] Dashboard muestra datos del mes actual
- [ ] Gráficos en Estadísticas cargan correctamente
- [ ] Manual de usuario es accesible desde el menú

---

## 🐳 Docker (Opcional)

Si prefieres usar Docker, el proyecto está listo con:

### Backend
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Frontend
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```bash
docker-compose up -d
```

---

## 🆘 Solución de Problemas

### Error de conexión a base de datos
- Verifica que `DATABASE_URL` tenga el formato correcto
- Confirma que las credenciales de Supabase sean válidas

### CORS errors en el frontend
- Agrega el dominio del frontend a `CORS_ALLOWED_ORIGINS` en backend
- Verifica que `VITE_API_URL` apunte al backend correcto

### Archivos estáticos no cargan
- Ejecuta `python manage.py collectstatic` nuevamente
- Verifica configuración de WhiteNoise en `settings.py`

### Build del frontend falla
- Limpia cache: `rm -rf node_modules package-lock.json && npm install`
- Verifica versión de Node.js: `node --version` (debe ser 18+)

---

## 📝 Comandos Rápidos

**Despliegue completo desde cero:**

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn config.wsgi:application

# Frontend (en otra terminal)
cd frontend
npm install
npm run build
# Luego servir carpeta build/
```

---

## 🔐 Seguridad en Producción

- ✅ `DEBUG=False` en producción
- ✅ Usar `SECRET_KEY` único y aleatorio
- ✅ `ALLOWED_HOSTS` con dominios específicos
- ✅ HTTPS habilitado
- ✅ Variables de entorno no expuestas en repositorio
- ✅ Backups automáticos de base de datos configurados

---

**Versión:** 1.1.0  
**Fecha:** Enero 2026  
**Contacto:** soporte@mundoreporte.com
