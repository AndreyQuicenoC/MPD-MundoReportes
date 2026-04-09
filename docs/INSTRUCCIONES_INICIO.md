# 🚀 Instrucciones de Inicio - Mundo Reportes

## Solución al Problema de Ejecución

El error `ModuleNotFoundError: No module named 'decouple'` ocurre porque estás usando el Python **global** en vez del entorno **virtual** donde están instaladas las dependencias.

---

## ✅ Forma Correcta de Ejecutar (3 Opciones)

### **Opción 1: Scripts de Inicio (MÁS FÁCIL)** ⭐

#### Windows (CMD):

```cmd
# Backend
cd backend
run.bat

# Frontend (en otra terminal)
cd frontend
run.bat
```

#### Windows (PowerShell):

```powershell
# Backend
cd backend
.\run.ps1

# Frontend (en otra terminal)
cd frontend
npm run dev
```

---

### **Opción 2: Activar Entorno Virtual Manualmente**

#### Windows (CMD):

```cmd
cd backend
venv\Scripts\activate.bat
python manage.py runserver
```

#### Windows (PowerShell):

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

#### Linux/Mac:

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

---

### **Opción 3: Usar Ruta Completa del Python del Entorno Virtual**

```powershell
cd backend
.\venv\Scripts\python.exe manage.py runserver
```

---

## ❌ Por Qué NO Funciona con Solo `python manage.py runserver`

Cuando ejecutas `python manage.py runserver` sin activar el entorno virtual:

1. **Windows busca Python en este orden:**
   - Python en `C:\Users\lu\AppData\Roaming\Python\Python313\` (tu instalación global)
   - Python en `C:\Python313\` (instalación del sistema)
   - Python en el PATH

2. **El problema:**
   - El Python **global** NO tiene instaladas las dependencias del proyecto
   - Las dependencias están en `backend/venv/Lib/site-packages/`
   - Por eso falla con `ModuleNotFoundError: No module named 'decouple'`

3. **La solución:**
   - Activar el entorno virtual **antes** de ejecutar comandos
   - Esto modifica temporalmente el PATH para usar `backend/venv/Scripts/python.exe`
   - Ese Python SÍ tiene acceso a todas las dependencias instaladas

---

## 📋 Inicio Rápido Completo

### 1. Iniciar Backend

```cmd
cd backend
run.bat
```

✅ Servidor corriendo en: http://127.0.0.1:8000/

### 2. Iniciar Frontend (nueva terminal)

```cmd
cd frontend
run.bat
```

✅ Aplicación corriendo en: http://localhost:3001/

### 3. Iniciar Sesión

- Email: `andreyquic@gmail.com`
- Contraseña: `admin123`

---

## 🔧 Comandos Útiles

### Verificar que el entorno virtual está activo:

```cmd
# Deberías ver (venv) al inicio del prompt
(venv) C:\Users\lu\Downloads\MPD-MundoReportes\backend>
```

### Instalar nuevas dependencias:

```cmd
cd backend
venv\Scripts\activate.bat
pip install nombre-del-paquete
pip freeze > requirements.txt
```

### Aplicar migraciones:

```cmd
cd backend
venv\Scripts\activate.bat
python manage.py migrate
```

### Crear superusuario:

```cmd
cd backend
venv\Scripts\activate.bat
python manage.py createsuperuser
```

---

## 🐛 Troubleshooting

### Error: "No module named 'X'"

**Solución:** Activa el entorno virtual primero

```cmd
cd backend
venv\Scripts\activate.bat
```

### Error: "venv\Scripts\activate.bat no se encuentra"

**Solución:** Recrea el entorno virtual

```cmd
cd backend
python -m venv venv
venv\Scripts\activate.bat
pip install -r requirements.txt
```

### Error: PowerShell no permite ejecutar scripts

**Solución:** Ejecuta como administrador

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📝 Resumen

✅ **SIEMPRE** activa el entorno virtual antes de ejecutar comandos de Django
✅ Usa los scripts `run.bat` o `run.ps1` para inicio rápido
✅ El entorno virtual contiene TODAS las dependencias del proyecto
❌ NUNCA ejecutes `python manage.py runserver` sin activar el entorno virtual

**Ruta del Python correcto:** `backend\venv\Scripts\python.exe`
**Ruta del Python incorrecto:** `C:\Python313\python.exe`
