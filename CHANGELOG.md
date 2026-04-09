# Changelog

Todos los cambios significativos de este proyecto se documentan en este archivo.

---

## [1.2.0] - 2026-04-09

### Nuevas Mejoras UI/UX

#### Interfaz de Usuario
- Dashboard de Reportes: Agregada paginación de 10 items/página con navegación intuitiva
- Vista Previa Rápida: Icono ojo en tabla de reportes abre overlay con datos esenciales del reporte
- Productos: Rediseño de tabla a grid de cards con paginación
- Categorías: Rediseño de tabla a grid de cards con paginación
- Automatico & Deducibles: Confirmación de patrón overlay consistente

#### Formularios y Entrada de Datos
- NuevoReporte: Campos numéricos cambiados de `type="number"` a `type="text"` para entrada más cómoda (sin spinners)
- Productos: Botones +/- agregados para cambiar cantidad con click (ya existían en UI, mejorados)
- Productos: Campo de cantidad ahora totalmente editable (puede escribirse valor directamente)
- Validación numérica mejorada con filtrado de caracteres

#### Modales y Overlays
- Productos: Modal  convertido a overlay (formulario dentro de la página con fade-in)
- Categorías: Modal conve rtido a overlay (formulario dentro de la página)
- Vista Previa Reporte: Nuevo modal con botones "Cancelar" y "Ver al Detalle"
- Transiciones suaves con CSS animations (fade-in, slide-up)

### Cambios Técnicos

#### Frontend
- **Reportes.jsx**: Integración de `ModalVistaPreviaReporte` component
- **NuevoReporte.jsx**: Cambio de inputs numéricos, botones +/-, validación mejorada
- **Productos.jsx**: Reescritura de tabla a cards, estado con `mostrarForm`, overlay pattern
- **Categorias.jsx**: Reescritura de tabla a cards, estado con `mostrarForm`, overlay pattern
- **ModalVistaPreviaReporte.jsx**: Nuevo componente (80 líneas) con animaciones
- **CSS mejorado**: Variables consistentes, responsive design, transiciones

#### Mejora de UX
- Reducción de spinners incómodos en campos numéricos
- Interfaz visual consistente: cards vs tablas en todas partes
- Botones con iconos (✎, ✕, 👁️) en lugar de solo texto
- Mejor feedback visual con hover effects y badges

### Sincronización de Datos

- **Supabase**: Todos los 994 registros reales sincronizados y verificados
- **Datos Base**: 7 usuarios, 90 reportes, 249 ventas, 577 gastos, 4 automáticos, 29 productos
- **Sin datos sintéticos**: Sistema carga solo datos reales de la base de datos

### Documentación

- Creado `SUPABASE_SYNC_REPORT.md` con detalles de sincronización
- Backup de datos: `docs/backups/backup_datos_reales_20260409_084337.json`

---

## [1.1.0] - 2026-03-25

### Features Agregadas

#### Backend

- **Nuevos Modelos**:
  - `GastoAutomatico`: Gastos predefinidos reutilizables
  - `GastoDeducible`: Categorización de gastos deducibles

- **Nuevos ViewSets**:
  - `GastoAutomaticoViewSet`: CRUD de gastos automáticos
  - `GastoDeducibleViewSet`: CRUD de deducibles

- **Mejoras de Validación**:
  - Detección de reportes duplicados con error `REPORTE_EXISTE`

#### Frontend

- **Nuevas Páginas**:
  - `Automatico.jsx`: Panel de gastos automáticos con form-card overlay
  - `Deducibles.jsx`: Panel para marcar categorías como deducibles

- **Nuevas Funcionalidades**:
  - Paginación en Reportes, Productos, Categorias, AdminUsuarios
  - Filtros por mes en página de Reportes
  - Integración de gastos automáticos en NuevoReporte
  - Exportación a PDF (reportes y estadísticas)

- **Mejoras UI/UX**:
  - Animaciones mejoradas
  - Paleta de colores expandida (8 colores en gráficos)
  - Estilos de filtros, cards, botones responsivos

- **Nuevos Servicios**:
  - `gastosService.js`: Obtener automáticos y deducibles

### Security

- `fecha_ingreso` marcada como read-only en perfil de usuario

### Dependencies

- `jspdf@^4.2.1` y `html2canvas@^1.4.1` para PDF

### Bug Fixes

- Mensaje de error claro para reportes duplicados
- Reseteo de paginación al cargar datos
- Manejo mejorado de errores en formularios

### Technical Improvements

- Componentes modulares y reutilizables
- Organización de servicios API
- Estilos CSS por sección
- Variables CSS consistentes
- Transiciones suaves

### Responsive Design

- Media queries para tablets y móviles
- Buttons responsivos
- Distribución de grillas adaptativa

---

## Convenciones de Versioning

- **MAJOR**: Cambios incompatibles (breaking changes)
- **MINOR**: Nuevas funcionalidades (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

Formato: `[versión] - YYYY-MM-DD`

---

**Última actualización**: 2026-04-09
