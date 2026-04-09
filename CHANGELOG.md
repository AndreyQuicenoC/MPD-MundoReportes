# Changelog

Todos los cambios significativos de este proyecto se documentan en este archivo.

---

## [1.2.1] - 2026-04-09

### Correcciones Críticas

#### Backend
- **Serializers**: Agregado campo `fecha` al `ActualizarReporteDiarioSerializer` para permitir edición de fechas en reportes
- **Validación de Fecha**: Implementada validación que previene duplicados pero permite actualizar la fecha del mismo reporte
- **Endpoint Deducibles**: Nuevo endpoint `/estadisticas/deducibles/` para calcular gastos deducibles correctamente
- **Cálculo de Deducibles**: Implementado método `deducibles_por_tipo()` que suma valores reales de gastos por tipo (ingreso/ahorro/transferencia)

#### Frontend
- **Edición de Reportes**: Ahora permite cambiar la fecha al editar un reporte existente con validación mejorada
- **Cálculo de Deducibles**: Integración de nuevo endpoint para cálculos precisos en lugar de simulación
- **Formulario NuevoReporte**: Estandarización de tamaños de inputs en gastos (descripción, valor, categoría) - todos en flex-1 (iguales)

### Nuevas Características

#### Login Mejorado
- **Indicador de Servidor**: Contador visual (0-60 segundos) que muestra tiempo de espera al cargar servidor
- **Mensajería Amigable**: Mensaje "El servidor se está activando..." vs "Le está tomando más de lo esperado"
- **Contacto de Soporte**: Si supera 60 segundos, se instruye al usuario contactar soporte
- **Diseño Minimalista**: Ocupa poco espacio, claro y profesional, aparece después de 3 segundos de carga

#### PDF Exportación - Extrema Calidad Visual
- **Títulosde Secciones**: Agregado "Reporte de Estadísticas" con fecha de generación
- **Descripciones de Gráficos**: Cada gráfico tiene una breve descripción explicando su propósito:
  - "Distribución de gastos acumulados por categoría"
  - "Ranking completo de productos ordenados por cantidad vendida"
  - "Análisis temporal de ventas por mes"
  - "Comparativa de cambios porcentuales mes a mes"
- **Márgenes Profesionales**: Sección superior (pdf-header-section) e inferior (pdf-footer-section) para distribución visual
- **Tarjetas de Métricas**: Diseño mejorado con bordes izquierdos (border-left) para mayor claridad
- **Gráficos Optimizados**: Ajuste de alturas máximas, distribución uniforme, mejor utilización de espacio
- **Tabla Visual Clara**: Diseño de 2 columnas para stat-cards, ideal para página vertical A4
- **Orientación**: PDF en orientación portrait (vertical) para mejor encaje en hoja estándar

### Cambios Técnicos

#### Backend
- **estadisticas/services.py**: Agregado import de `GastoDeducible`
- **estadisticas/views.py**: Nueva clase `DeduciblesView` con endpoint GET
- **estadisticas/urls.py**: Nuevo path para deducibles endpoint
- **reportes/serializers.py**: Campo `fecha` opcional con validación personalizada en `ActualizarReporteDiarioSerializer`
- **reportes/views.py**: Contexto pasado a serializer con reporte_id para validación de duplicados

#### Frontend
- **Login.jsx**: Implementado contador de tiempo con useEffect, manejo de timeout (60s)
- **Login.css**: Nuevos estilos: @keyframes spin, .servidor-espera, .espera-spinner, .espera-mensaje
- **Estadisticas.jsx**: Agregadas secciones pdf-header-section y pdf-footer-section para márgenes
- **Estadisticas.jsx**: Nuevos componentes pdf-section-header y pdf-description en cada gráfico
- **Estadisticas.css**: @media print completo rediseñado para tabla visual, descripciones, márgenes
- **NuevoReporte.jsx**: Cambio de flex-2 a flex-1 en primer input de gastos
- **pdf.js**: Cambio orientación exportación estadísticas de landscape a portrait
- **estadisticasService.js**: Método `getDeducibles(params)` para consultar endpoint deducibles

#### Estructura de Proyecto
- **Organización**: Movido `verificar-despliegue.ps1` a carpeta `scripts/` para mejor organización

### Mejoras UX/UI

- **Inputs estandarizados**: Forma uniforme y consistente en formularios
- **Login profesional**: Pantalla de carga con información clara y amigable
- **PDF de Calidad Premium**: Reporte visualmente atractivo y bien estructurado, ideal para presentaciones

### Testing

- Validación de edición de reportes con cambio de fecha
- Verificación de cálculo correcto de deducibles en período personalizado
- Confirmación de PDF export en portrait con márgenes adecuados
- Prueba de descuento correcto de gastos deducibles en "Gasto Ajustado"

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
