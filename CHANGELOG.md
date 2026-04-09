# Changelog

## [1.1.0] - 2026-04-09

### Features Agregadas

#### Backend
- **Nuevos Modelos**:
  - `GastoAutomatico`: Gastos predefinidos reutilizables con categoría, descripción, valor y estado
  - `GastoDeducible`: Categorización especial de deducibles (transferencia/ahorro/ingreso) con OneToOneField

- **Nuevos ViewSets**:
  - `GastoAutomaticoViewSet`: Endpoints para gestionar gastos automáticos (lectura para todos, escritura para operario+admin)
  - `GastoDeducibleViewSet`: Endpoints para gestionar deducibles (lectura para todos, escritura solo admin)

- **Mejoras en Validación**:
  - Detección de reportes duplicados por fecha con código de error específico `REPORTE_EXISTE`
  - Respuesta HTTP 409 CONFLICT para conflictos de datos

#### Frontend
- **Nuevas Páginas**:
  - `Automatico.jsx`: Panel para gestionar gastos automáticos
  - `Deducibles.jsx`: Panel para marcar categorías como deducibles

- **Nuevas Funcionalidades**:
  - **Paginación**: Implementada en todas las tablas principales (Reportes, Productos, Categorias, AdminUsuarios) con componente reutilizable `Pagination.jsx`
  - **Filtros por Mes**: En página de Reportes con opciones de mes actual, todos o rango personalizado
  - **Integración de Gastos Automáticos**: Botones para insertar gastos predefinidos en NuevoReporte
  - **Exportación a PDF**:
    - `exportarReportePDF()`: Exporta detalle de reportes como PDF en formato factura
    - `exportarEstadisticasPDF()`: Exporta gráficos y estadísticas como PDF en horizontal

- **Mejoras UI/UX**:
  - Animaciones y efectos hover mejorados en todos los botones
  - Paleta de colores expandida en gráficos (8 colores variados en lugar de solo oliva)
  - Estilos mejorados para:
    - Sección de filtros en Reportes
    - Componentes de gastos automáticos
    - Cards de estadísticas
    - Botones responsivos

- **Nuevos Servicios**:
  - `gastosService.js`: Servicio para obtener gastos automáticos y deducibles

### Security
- **Profile Editing**: `fecha_ingreso` marcada como read-only en `PerfilUsuarioSerializer` para evitar que usuarios modifiquen fechas administrativas

### Dependencies
- Agregadas `jspdf@^4.2.1` y `html2canvas@^1.4.1` para exportación a PDF

### Bug Fixes
- Mensaje de error claro cuando se intenta crear un reporte con fecha duplicada
- Reseteo correcto de paginación al cargar nuevos datos
- Manejo mejorado de errores en formularios

### Technical Improvements
- Componentes modulares y reutilizables
- Mejor organización de servicios API
- Estilos CSS organizados por sección
- Variables CSS para paleta de colores consistente
- Transiciones suaves con `--transition-*` variables

### Responsive Design
- Media queries mejoradas para tablets (768px) y móviles (480px)
- Buttons responsivos en secciones de filtros y gastos automáticos
- Mejor distribución de grillas en pantallas pequeñas

## Notas
- El build frontend genera warning sobre chunk size (1055 KB) debido a jsPDF y html2canvas. Esto es normal y no afecta la funcionalidad
- Todos los commits incluyen prefijos convencionales (feat:, style:, fix:, etc.)
- Código sin emojis, profesional y de alta calidad
