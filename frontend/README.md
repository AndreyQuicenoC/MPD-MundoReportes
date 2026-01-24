# Frontend - Mundo Reporte

Frontend React para el sistema de reporte diario de ventas.

## 🛠️ Tecnologías

- **React 18**: Librería de interfaz de usuario
- **Vite**: Build tool y dev server
- **React Router**: Enrutamiento
- **Axios**: Cliente HTTP
- **React Hook Form**: Manejo de formularios
- **Chart.js**: Gráficos y visualizaciones
- **React Hot Toast**: Notificaciones

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend
```

## 💻 Desarrollo

```bash
# Ejecutar servidor de desarrollo
npm run dev

# El frontend estará disponible en http://localhost:3000
```

## 🏗️ Build

```bash
# Crear build de producción
npm run build

# Vista previa del build
npm run preview
```

## 🧪 Linting y Formato

```bash
# Verificar linting
npm run lint

# Corregir problemas de linting
npm run lint:fix

# Formatear código
npm run format
```

## 📁 Estructura

```
src/
├── components/       # Componentes reutilizables
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   └── PrivateRoute.jsx
├── context/          # Contextos de React
│   └── AuthContext.jsx
├── pages/            # Páginas principales
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Reportes.jsx
│   ├── NuevoReporte.jsx
│   ├── Estadisticas.jsx
│   ├── Productos.jsx
│   └── Categorias.jsx
├── services/         # Servicios de API
│   ├── api.js
│   ├── authService.js
│   ├── reportesService.js
│   └── estadisticasService.js
├── styles/           # Estilos globales
│   └── global.css
├── App.jsx           # Componente principal
└── main.jsx          # Punto de entrada
```

## 🎨 Diseño

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

## 🔒 Autenticación

El frontend usa JWT (JSON Web Tokens) para autenticación:

1. Login: obtiene access_token y refresh_token
2. Los tokens se guardan en localStorage
3. El access_token se envía en cada petición
4. Si el access_token expira, se usa el refresh_token para obtener uno nuevo
5. Si el refresh_token expira, se redirige al login

## 📱 Responsive

El diseño es completamente responsive y funciona en:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Móvil (< 768px)

## 🌐 Variables de Entorno

```env
VITE_API_URL=http://localhost:8000/api
```

## 📝 Convenciones

- Componentes en PascalCase
- Archivos JSX para componentes
- CSS modules o archivos CSS separados
- Hooks personalizados con prefijo "use"
- Servicios en camelCase

## 🔗 Integración con Backend

El frontend se comunica con el backend Django a través de la API REST:

- Base URL: configurada en `VITE_API_URL`
- Autenticación: JWT en header Authorization
- Formato: JSON
- Manejo de errores: centralizado en axios interceptors
