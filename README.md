# Mundo Reporte

Sistema web de reporte diario de ventas y gastos para almacén de pinturas.

## 📋 Descripción

Mundo Reporte es un sistema diseñado para reemplazar el uso manual de hojas de cálculo (Excel) en el registro y análisis de ventas y gastos diarios de un almacén de pinturas. El sistema permite:

- ✅ Registro diario de base, ventas, gastos, entregas y base del día siguiente
- ✅ Registro de cantidades vendidas por producto
- ✅ Clasificación de gastos por categorías reutilizables
- ✅ **Gastos automáticos predefinidos para inserción rápida**
- ✅ **Marcado de categorías como deducibles (transferencia/ahorro/ingreso)**
- ✅ Generación de estadísticas confiables por periodos
- ✅ **Filtrado de reportes por mes o rango personalizado**
- ✅ **Paginación en todas las tablas principales**
- ✅ **Exportación de reportes y estadísticas en PDF**
- ✅ Acceso seguro mediante autenticación

## 🎯 Usuario Objetivo

Sistema diseñado especialmente para adultos mayores y usuarios no técnicos, priorizando:

- Claridad y simplicidad en la interfaz
- Facilidad de uso
- Formularios intuitivos
- Feedback inmediato

## 🛠️ Tecnologías

### Backend

- **Django 5.0+**: Framework web principal
- **Django REST Framework**: API REST
- **PostgreSQL**: Base de datos
- **Gunicorn**: Servidor WSGI para producción

### Frontend

- **React 18+**: Librería de interfaz de usuario
- **JavaScript/TypeScript**: Lenguaje de programación
- **Axios**: Cliente HTTP
- **Chart.js**: Gráficos y visualizaciones

### Herramientas de Calidad

- **Black**: Formateador de código Python
- **Flake8**: Linter Python
- **ESLint**: Linter JavaScript/TypeScript
- **Prettier**: Formateador de código frontend
- **Pytest**: Testing backend
- **Jest**: Testing frontend

## 🏗️ Arquitectura

El proyecto sigue una arquitectura cliente-servidor desacoplada:

```
┌─────────────────┐         HTTP/JSON          ┌──────────────────┐
│                 │ ◄────────────────────────► │                  │
│  React Frontend │                            │  Django Backend  │
│                 │                            │                  │
└─────────────────┘                            └────────┬─────────┘
                                                        │
                                                        ▼
                                                 ┌──────────────┐
                                                 │  PostgreSQL  │
                                                 └──────────────┘
```

### Capas del Backend

1. **Capa de presentación**: Django REST Framework (API)
2. **Capa de aplicación**: Orquestación de casos de uso
3. **Capa de dominio**: Servicios con lógica de negocio
4. **Capa de persistencia**: Modelos Django y base de datos

## 📁 Estructura del Proyecto

```
MPD-MundoReportes/
├── backend/                    # Aplicación Django
│   ├── config/                 # Configuración del proyecto
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/                   # Aplicaciones Django
│   │   ├── usuarios/           # Gestión de usuarios
│   │   ├── reportes/           # Reportes diarios
│   │   ├── gastos/             # Gastos y categorías
│   │   ├── productos/          # Productos del catálogo
│   │   └── estadisticas/       # Métricas y análisis
│   ├── requirements.txt        # Dependencias Python
│   └── manage.py
├── frontend/                   # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/              # Vistas principales
│   │   ├── services/           # Servicios API
│   │   ├── hooks/              # Custom hooks
│   │   └── styles/             # Estilos globales
│   ├── package.json
│   └── README.md
├── docs/                       # Documentación
│   └── guidelines/             # Lineamientos del proyecto
├── .github/                    # GitHub Actions (CI/CD)
│   └── workflows/
├── .gitignore
└── README.md
```

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend (Django)

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor de desarrollo
python manage.py runserver
```

El backend estará disponible en `http://localhost:8000`

### Frontend (React)

```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend

# Ejecutar servidor de desarrollo con Vite
npm run dev

# Compilar para producción
npm run build

# Preview de la compilación
npm run preview
```

El frontend estará disponible en `http://localhost:5173` (desarrollo) o `http://localhost:4173` (preview)

## 🧪 Testing

### Backend

```bash
cd backend
pytest
pytest --cov=apps  # Con cobertura
```

### Frontend

```bash
cd frontend
npm test
npm test -- --coverage  # Con cobertura
```

## 🔍 Calidad de Código

### Backend

```bash
# Formatear código
black .

# Verificar linting
flake8
```

### Frontend

```bash
# Formatear código
npm run format

# Verificar linting
npm run lint
```

## 🎨 Identidad Visual

### Color Principal

- **Verde Oliva**: `#9B933B`
- Uso: Navbar, botones primarios, elementos de identidad

### Colores Complementarios

- Blanco: `#FFFFFF`
- Gris claro: `#F5F5F5`
- Gris oscuro: `#333333`
- Verde oscuro: `#6F6A2A` (hover)
- Rojo suave: `#C94A4A` (errores)
- Amarillo suave: `#E0C65A` (advertencias)

## 📊 Modelos Principales

### ReporteDiario

- Registro diario de ventas y gastos
- Cálculo automático de base siguiente
- Relación con gastos y productos vendidos

### Gasto

- Descripción, valor y categoría opcional
- Asociado a un reporte diario

### Producto

- Catálogo de productos con precio unitario
- Estado activo/inactivo

### VentaProducto

- Cantidad vendida por producto
- Asociada a reporte diario

### CategoriaGasto

- Categorías reutilizables para clasificar gastos
- Estado activo/inactivo

### GastoAutomatico

- Gastos predefinidos configurables por administrador
- Se pueden insertar rápidamente en reportes diarios
- Incluye descripción, valor y categoría opcional

### GastoDeducible

- Marcado especial de categorías como deducibles
- Tipos: transferencia, ahorro, ingreso
- Permite análisis separado de gastos deducibles

## ✨ Características Principales (v1.1.0+)

### Paginación Inteligente

- Todas las tablas (Reportes, Productos, Categorías, Usuarios) usan paginación de 10 items
- Navigation buttons con disabled state en límites
- Reseteo automático al cargar nuevos datos

### Filtrado Avanzado de Reportes

- **Filtro por mes actual**: Muestra solo reportes del mes actual
- **Filtro por rango**: Selecciona fecha inicio y fin personalizado
- **Sin filtro**: Muestra todos los reportes
- Aplicable tanto en cliente como en servidor

### Gastos Automáticos

- Panel de administración para crear gastos reutilizables
- Botones rápidos en formulario de reporte para insertar gastos predefinidos
- Propago automático de descripción, valor y categoría

### Exportación a PDF

- **Reportes**: Exporta detalles completos del reporte en formato factura (A4 vertical)
- **Estadísticas**: Exporta gráficos y métricas en formato horizontal (A4 landscape)
- Soporte automático para múltiples páginas

### Mejoras en Estadísticas

- Paleta de colores expandida (8 colores variados vs solo oliva)
- Gráficos con mejor contraste y legibilidad
- Filtros por rango de fechas

### Seguridad Mejorada

- Validación preventiva de reportes duplicados con mesaje claro
- Campos administrativos protegidos contra edición de usuarios
- Control de acceso por rol mejorado

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Validación de entradas en backend
- ✅ Protección CSRF
- ✅ CORS configurado correctamente
- ✅ Variables sensibles en entorno
- ✅ HTTPS obligatorio en producción

## 📈 Métricas y Estadísticas

El sistema genera métricas automáticas sobre:

- Ventas totales (diarias, mensuales, anuales)
- Gastos totales por periodo
- Gastos por categoría
- Productos más vendidos
- Rentabilidad básica (ventas - gastos)

## 🚢 Despliegue

### Recomendaciones

**Backend**: Railway o Render

- Configuración sencilla
- HTTPS automático
- PostgreSQL gestionado

**Frontend**: Vercel o Netlify

- Deploy automático desde Git
- CDN incluido
- Gratis para proyectos pequeños

### Variables de Entorno Requeridas

**Backend**:

- `SECRET_KEY`: Clave secreta Django
- `DATABASE_URL`: URL de conexión PostgreSQL
- `DEBUG`: False en producción
- `ALLOWED_HOSTS`: Dominios permitidos

**Frontend**:

- `REACT_APP_API_URL`: URL del backend

## 📝 Convenciones de Commits

Los commits siguen el formato:

```
tipo(ámbito): descripción breve

Descripción detallada si es necesaria
```

**Tipos**:

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato, sin cambios de código
- `refactor`: Refactorización
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

**Ejemplo**:

```
feat(reportes): agregar cálculo automático de base siguiente

Implementa la lógica de negocio para calcular automáticamente
la base del día siguiente usando la fórmula:
base_siguiente = base_inicial + venta - gastos - entrega
```

## 👥 Roles de Usuario

### Administrador

- Gestiona usuarios
- Crea y edita categorías de gastos
- Crea y edita productos con precio
- Consulta estadísticas globales

### Usuario Operativo

- Registra reportes diarios
- Consulta reportes históricos
- Exporta información

## 📖 Documentación Adicional

- [Lineamientos del Proyecto](docs/guidelines/)
- [Arquitectura](docs/guidelines/ARQUITECTURA.txt)
- [Seguridad](docs/guidelines/SEGURIDAD.txt)
- [Calidad de Código](docs/guidelines/CALIDADDECODIGO.txt)
- [UI/UX](docs/guidelines/CALIDADUIUX.txt)

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para el almacén de pinturas.

## 👨‍💻 Desarrollo

El proyecto se desarrolla siguiendo metodologías ágiles con ramas feature:

- `main`: Rama principal (producción)
- `feature/nombre`: Funcionalidades nuevas
- `fix/nombre`: Correcciones

Cada rama debe tener commits profesionales y descriptivos en español.

---

**Mundo Reporte** - Sistema de gestión diario para almacenes de pinturas
