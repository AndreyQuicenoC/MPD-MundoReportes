# Guía de Integración con Supabase - Datos Reales

## 📋 Estado Actual

El sistema ha sido limpiado de datos sintéticos. Ahora carga **SOLO datos reales** de Supabase.

### ✅ Cambios Realizados

1. **Eliminado comando de datos sintéticos**
   - ❌ Borrado: `backend/apps/usuarios/management/commands/crear_datos_prueba.py`
   - Razón: El sistema debe usar datos reales existentes en Supabase

2. **Corregido comando de usuario de prueba**
   - ✅ `crear_usuario_prueba.py` ahora usa campos correctos del modelo Usuario
   - Usa: `fecha_ingreso` y `fecha_fin` (no `fecha_inicio_acceso/fecha_fin_acceso`)

3. **Actualizada documentación**
   - ✅ Backend README: Indica que NO crear datos sintéticos
   - ✅ Memoria del proyecto: Documenta configuración Supabase

## 🚀 Pasos para Continuar

### 1. Verificar Conexión a Supabase

```bash
# En el backend (dentro del venv)
cd backend
python manage.py shell
```

```python
# En el shell de Django
from apps.usuarios.models import Usuario
from apps.reportes.models import ReporteDiario
from apps.gastos.models import GastoAutomatico, GastoDeducible

# Verificar que se cargan datos reales
print("Usuarios:", Usuario.objects.count())
print("Reportes:", ReporteDiario.objects.count())
print("Gastos automáticos:", GastoAutomatico.objects.count())
print("Gastos deducibles:", GastoDeducible.objects.count())
```

### 2. Ejecutar Migraciones (si es necesario)

Si las tablas nuevas no están sincronizadas:

```bash
python manage.py migrate
```

Esto sincronizará los modelos Django con las tablas de Supabase.

### 3. Verificar Endpoints de API

Con el servidor ejecutándose:

```bash
# Terminal 1: Iniciar servidor
cd backend
python manage.py runserver

# Terminal 2: Verificar endpoints
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/gastos/automaticos/
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/gastos/deducibles/
curl -H "Authorization: Bearer <TOKEN>" http://localhost:8000/api/reportes/
```

### 4. Verificar Frontend

```bash
# Terminal 3: Iniciar frontend
cd frontend
npm run dev
```

El frontend debería:
- ✅ Cargar usuarios desde la API
- ✅ Cargar reportes reales
- ✅ Cargar gastos automáticos y deducibles
- ✅ Mostrar estadísticas basadas en datos reales

## 📊 Estructura de Datos en Supabase

Las siguientes tablas están sincronizadas:

### Usuarios
- `usuarios_usuario` - Usuarios del sistema

### Reportes
- `reportes_reportediario` - Reportes diarios
- `reportes_ventaproducto` - Detalles de ventas

### Gastos
- `gastos_categoriagasto` - Categorías
- `gastos_gasto` - Gastos individuales
- `gastos_gastoautomatico` - Gastos predefinidos ⭐ NUEVO
- `gastos_gastodeducible` - Categorías deducibles ⭐ NUEVO

### Productos
- `productos_producto` - Catálogo de productos

## ⚠️ Importante

### NO ejecutar:
```bash
# ❌ NUNCA ejecutar esto
python manage.py crear_datos_prueba
```

Este comando fue eliminado porque creaba datos sintéticos.

### Sí ejecutar:
```bash
# ✅ Solo migraciones y el superusuario si es necesario
python manage.py migrate
python manage.py createsuperuser  # Django built-in para admin
```

## 🔍 Troubleshooting

### Error: "Relación 'gastos_gastoautomatico' no existe"

**Causa**: Las tablas nuevas no se sincronizaron

**Solución**:
```bash
python manage.py migrate
python manage.py migrate gastos  # Específicamente para la app de gastos
```

### Error: "No data returned from API"

**Verificar**:
1. ¿Está correcto el `DATABASE_URL` en `.env`?
2. ¿Existen datos en Supabase? (Ver paso 1 arriba)
3. ¿El usuario tiene permiso de lectura en las tablas?

### El frontend no muestra datos

**Verificar**:
1. Que el token JWT sea válido
2. Que el `CORS_ALLOWED_ORIGINS` en settings.py incluya la URL del frontend
3. Ver console del navegador para errores

## 📝 Notas

- Si necesitas crear datos manualmente, hacerlo directamente en Supabase
- El sistema now es "data-first": los datos existen primero, el código solo lee
- Para nuevos reportes/gastos, usar el UI del frontend (que crea datos reales)

---

**Última actualización**: 2026-04-09
**Versión**: 1.1.0 (Datos Reales)
