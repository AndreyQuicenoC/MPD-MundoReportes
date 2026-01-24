# Documentación Técnica para Desarrolladores - Mundo Reporte v1.1.0

## Índice
1. [Arquitectura del Sistema](#arquitectura)
2. [Tecnologías Utilizadas](#tecnologias)
3. [Estructura del Proyecto](#estructura)
4. [Configuración del Entorno](#configuracion)
5. [API REST](#api)
6. [Base de Datos](#base-de-datos)
7. [Frontend](#frontend)
8. [Despliegue](#despliegue)

## Arquitectura del Sistema {#arquitectura}

### Arquitectura General
El sistema Mundo Reporte utiliza una arquitectura **Cliente-Servidor** con separación clara entre frontend y backend:

- **Frontend**: React + Vite (SPA)
- **Backend**: Django REST Framework
- **Base de Datos**: PostgreSQL (Supabase)
- **Autenticación**: JWT (JSON Web Tokens)

### Patrón de Diseño
- **MVC Adaptado**: Model-View-Controller en el backend
- **Component-Based**: Arquitectura de componentes en React
- **Service Layer**: Capa de servicios para lógica de negocio

## Tecnologías Utilizadas {#tecnologias}

### Backend
```
Django==5.0.1
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
psycopg[binary]>=3.1.0
django-cors-headers==4.3.1
django-filter==23.5
python-decouple==3.8
```

### Frontend
```
React 18.2.0
Vite 5.0.8
React Router 6.21.3
Axios 1.6.5
Chart.js 4.4.1
React Hot Toast 2.4.1
```

## Estructura del Proyecto {#estructura}

```
MPD-MundoReportes/
├── backend/
│   ├── apps/
│   │   ├── estadisticas/    # Módulo de análisis y métricas
│   │   ├── gastos/          # Gestión de gastos y categorías
│   │   ├── productos/       # CRUD de productos
│   │   ├── reportes/        # Reportes diarios
│   │   └── usuarios/        # Autenticación y permisos
│   ├── config/              # Configuración Django
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/           # Páginas/Vistas
│   │   ├── services/        # Servicios API
│   │   ├── context/         # Context API (AuthContext)
│   │   └── utils/           # Utilidades y helpers
│   └── index.html
└── docs/
    ├── guidelines/          # Directrices del proyecto
    └── DOCUMENTACION_TECNICA.md
```

## Configuración del Entorno {#configuracion}

### Backend

1. **Crear entorno virtual**:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

2. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

3. **Configurar variables de entorno** (`.env`):
```env
SECRET_KEY=tu-clave-secreta-django
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

4. **Migrar base de datos**:
```bash
python manage.py migrate
```

5. **Crear superusuario**:
```bash
python manage.py createsuperuser
```

6. **Ejecutar servidor**:
```bash
python manage.py runserver
```

### Frontend

1. **Instalar dependencias**:
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno** (`.env`):
```env
VITE_API_URL=http://localhost:8000/api
```

3. **Ejecutar en desarrollo**:
```bash
npm run dev
```

4. **Build de producción**:
```bash
npm run build
```

## API REST {#api}

### Autenticación
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña"
}

Response:
{
  "access": "token_jwt",
  "refresh": "refresh_token",
  "usuario": {
    "id": 1,
    "email": "usuario@example.com",
    "nombre": "Usuario",
    "rol": "usuario"
  }
}
```

### Endpoints Principales

#### Reportes
- `GET /api/reportes/` - Listar reportes
- `POST /api/reportes/crear/` - Crear reporte
- `GET /api/reportes/{id}/` - Detalle de reporte
- `PUT /api/reportes/{id}/` - Actualizar reporte
- `DELETE /api/reportes/{id}/` - Eliminar reporte

#### Estadísticas
- `GET /api/estadisticas/dashboard/` - Dashboard principal
- `GET /api/estadisticas/ventas/` - Estadísticas de ventas
- `GET /api/estadisticas/productos/mas-vendidos/` - Top productos
- `GET /api/estadisticas/ventas/mensuales/` - Ventas por mes

#### Productos
- `GET /api/productos/` - Listar productos
- `POST /api/productos/crear/` - Crear producto
- `PUT /api/productos/{id}/` - Actualizar producto
- `DELETE /api/productos/{id}/` - Eliminar producto

#### Categorías
- `GET /api/gastos/categorias/` - Listar categorías
- `POST /api/gastos/categorias/crear/` - Crear categoría
- `PUT /api/gastos/categorias/{id}/` - Actualizar categoría
- `DELETE /api/gastos/categorias/{id}/` - Eliminar categoría

## Base de Datos {#base-de-datos}

### Modelos Principales

#### Usuario
```python
class Usuario(AbstractBaseUser):
    email = EmailField(unique=True)
    nombre = CharField(max_length=100)
    cedula = CharField(max_length=20, unique=True)
    rol = CharField(choices=[('admin', 'Administrador'), 
                             ('usuario', 'Operario')])
    edad = PositiveIntegerField()
    fecha_ingreso = DateField()
    fecha_fin = DateField(null=True, blank=True)
    is_active = BooleanField(default=True)
```

#### ReporteDiario
```python
class ReporteDiario(Model):
    fecha = DateField()
    base_inicial = DecimalField(max_digits=12, decimal_places=2)
    venta_total = DecimalField(max_digits=12, decimal_places=2)
    total_gastos = DecimalField(max_digits=12, decimal_places=2)
    entrega = DecimalField(max_digits=12, decimal_places=2)
    base_siguiente = DecimalField(max_digits=12, decimal_places=2)
    observacion = TextField(blank=True)
    usuario = ForeignKey(Usuario)
```

#### Producto
```python
class Producto(Model):
    nombre = CharField(max_length=100, unique=True)
    precio = DecimalField(max_digits=10, decimal_places=2)
    descripcion = TextField(blank=True)
    activo = BooleanField(default=True)
```

## Frontend {#frontend}

### Estructura de Componentes

#### AuthContext
Maneja el estado global de autenticación:
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  // ...
};
```

#### Servicios API
```javascript
// reportesService.js
export const reportesService = {
  getReportes: () => apiClient.get('/reportes/'),
  getReporte: (id) => apiClient.get(`/reportes/${id}/`),
  createReporte: (data) => apiClient.post('/reportes/crear/', data),
  updateReporte: (id, data) => apiClient.put(`/reportes/${id}/`, data),
  deleteReporte: (id) => apiClient.delete(`/reportes/${id}/`),
};
```

### Rutas Protegidas
```javascript
<Route path="/" element={
  <PrivateRoute>
    <Layout />
  </PrivateRoute>
}>
  <Route path="reportes" element={
    <RoleRoute allowedRoles={['usuario']}>
      <Reportes />
    </RoleRoute>
  } />
</Route>
```

## Despliegue {#despliegue}

### Backend (Railway/Render/Heroku)
1. Configurar variables de entorno
2. `python manage.py collectstatic`
3. `python manage.py migrate`
4. Configurar WSGI server (Gunicorn)

### Frontend (Vercel/Netlify)
1. `npm run build`
2. Configurar variables de entorno
3. Deploy carpeta `dist/`

### Base de Datos (Supabase)
- PostgreSQL gestionado
- Backups automáticos
- Connection pooling

## Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: descripción'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## Licencia
Propietario - Mundo Reporte © 2026
