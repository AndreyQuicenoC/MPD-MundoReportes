# Instalación del Frontend

## Requisitos
- Node.js 18+
- npm 9+

## Pasos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env` en la raíz del frontend:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 4. Build para producción
```bash
npm run build
```

Los archivos compilados estarán en `dist/`

### 5. Preview de producción
```bash
npm run preview
```

## Scripts disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run preview` - Preview del build de producción
- `npm run lint` - Ejecuta ESLint
- `npm run format` - Formatea código con Prettier
- `npm test` - Ejecuta tests con Vitest

## Estructura

```
src/
├── components/      # Componentes reutilizables
├── context/         # Contextos de React
├── pages/           # Páginas/Rutas
├── services/        # Servicios API
├── styles/          # Estilos globales
├── utils/           # Utilidades
└── main.jsx         # Punto de entrada
```

## Tecnologías

- React 18
- React Router 6
- Vite 5
- Axios
- Chart.js
- React Hook Form
- React Hot Toast

## Desarrollo

El proyecto usa:
- ESLint para linting
- Prettier para formateo
- Vitest para testing
- CSS Modules para estilos

Color principal: **Verde Oliva #9B933B**
