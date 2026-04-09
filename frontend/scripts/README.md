# Scripts de Frontend

Este directorio contiene scripts útiles para el desarrollo del frontend.

## Información General

El frontend es una aplicación React con Vite. Los scripts están definidos en `package.json`:

```bash
npm run dev         # Modo desarrollo
npm run build       # Compilación para producción
npm run preview     # Vista previa de build
npm run lint        # Verificar código
npm run lint:fix    # Corregir código automáticamente
npm run format      # Formatear código
npm run test        # Ejecutar tests
npm run test:watch  # Tests en modo watch
```

## Desarrollo

### Iniciar servidor de desarrollo

```bash
cd frontend
npm install  # Primera vez
npm run dev
```

El servidor estará en http://localhost:5173

### Compilar para producción

```bash
npm run build
```

Los archivos compilados estarán en `build/`

### Linting y formateo

```bash
npm run lint        # Verificar problemas
npm run lint:fix    # Corregir automáticamente
npm run format      # Formatear con Prettier
```

## Estructura de Carpetas

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/          # Páginas (componentes de ruta)
│   ├── services/       # Servicios API
│   ├── utils/          # Funciones utilitarias
│   ├── App.jsx         # Componente principal
│   ├── App.css         # Estilos globales
│   └── main.jsx        # Punto de entrada
├── public/             # Assets estáticos
├── scripts/            # Scripts de utilidad (este directorio)
├── package.json        # Dependencias
├── vite.config.js      # Configuración de Vite
└── index.html          # HTML base
```

## Dependencias Principales

- React 18 - Framework UI
- Vite - Build tool
- React Router - Routing
- Axios - HTTP client
- Chart.js - Gráficos
- jsPDF & html2canvas - Exportación a PDF
- react-hot-toast - Notificaciones
- react-hook-form - Gestión de formularios

## Puerto del Desarrollo

El servidor de desarrollo se ejecuta en puerto **5173** por defecto.

Si necesitas cambiar el puerto, edita `vite. config.js`:

```javascript
server: {
  port: 5173,  // Cambiar aquí
}
```
