# Changelog

All significant changes to this project are documented in this file.

---

## [1.2.2] - 2026-04-13

### Bug Fixes

#### Build and Deployment
- **Fixed syntax error** in Reportes.jsx with duplicate function definitions
- **Fixed missing CSS closing brace** in Automatico.css
- **Corrected port configuration** in Vite (preview port: 5173 → 4173)
- **Fixed CSS selectors** for number input spinners in NuevoReporte.css
- **Removed unused imports and parameters** in pdf.js

#### Code Quality
- **Fixed zero-division guard** in RankingMeses calculations
- **Fixed bar width calculation** in RankingProductos component
- **Removed incorrect CSS import** in Categorias.jsx

### Refactoring

#### Frontend Structure
- **Reorganized pages directory** into semantic subdirectories:
  - `pages/common/` - Public pages (Login, Profile, Categories)
  - `pages/operator/` - Operator pages (Reports, Products, Statistics)
  - `pages/admin/` - Admin pages (User Management)
- **Created individual folders** for each page with co-located files (Page.jsx + Page.css)
- **Updated all import paths** throughout the application
- **Translated Spanish comments to English** for consistency

### Documentation

- **Updated README.md** with English content and version badges
- **Added version badges** for Python, Node.js, React, and Django
- **Cleaned up root directory** - removed duplicate documentation files
- **Streamlined documentation structure** - kept only README.md and CHANGELOG.md in root

### Version

- **Current Version**: v1.2.2
- **Node.js**: 18+
- **Python**: 3.10+
- **React**: 18+
- **Django**: 5.0+

---

## [1.2.1] - 2026-04-09

### Critical Fixes

#### Backend
- **Serializers**: Added `fecha` field to `ActualizarReporteDiarioSerializer` to allow date editing
- **Date Validation**: Implemented validation preventing duplicates while allowing same report updates
- **Deductibles Endpoint**: New `/estadisticas/deducibles/` endpoint for correct deductible expense calculation
- **Deductibles Calculation**: Implemented `deducibles_por_tipo()` method summing real expense values

#### Frontend
- **Report Editing**: Now allows changing date when editing existing report with improved validation
- **Deductibles Calculation**: Integration of new endpoint for precise calculations
- **NuevoReporte Form**: Standardized input sizes in expenses (description, value, category)

### New Features

#### Enhanced Login
- **Server Indicator**: Visual counter (0-60 seconds) showing wait time when loading server
- **Friendly Messaging**: "Server is activating..." vs "Taking longer than expected"
- **Support Contact**: If exceeds 60 seconds, instructs user to contact support
- **Minimalist Design**: Takes up little space, clear and professional

#### PDF Export - Extreme Visual Quality
- **Section Titles**: Added "Statistics Report" with generation date
- **Chart Descriptions**: Each chart has brief explanations of purpose
- **Professional Margins**: Top and bottom sections for visual distribution
- **Metric Cards**: Enhanced design with left borders for clarity
- **Optimized Charts**: Adjusted heights, uniform distribution
- **Clear Visual Table**: 2-column design for stat-cards
- **Portrait Orientation**: PDF in portrait mode for standard A4 paper fit

### Technical Changes

#### Backend
- **estadisticas/services.py**: Added `GastoDeducible` import
- **estadisticas/views.py**: New `DeduciblesView` class with GET endpoint
- **estadisticas/urls.py**: New path for deductibles endpoint
- **reportes/serializers.py**: Optional `fecha` field with custom validation
- **reportes/views.py**: Context passed to serializer with reporte_id

#### Frontend
- **Reportes.jsx**: Integrated new deductibles endpoint for accurate calculations
- **Estadisticas.jsx**: Updated to use statistics with filter parameters
- **Frontend Services**: New `estadisticasService.getDeductibles()` for deductible data
- **PDF Export**: Enhanced with proper styling and multiple page support

---

## [1.2.0] - 2026-04-08

### Major Features

#### Ranking and Product Charts
- **ProductosTodosVendidos Component**: Horizontal bar chart of all products sold
- **RankingProductos Component**: Top 5 most and least sold products
- **RankingMeses Component**: Month-to-month percentage change analysis
- **Product Ranking Page**: Dedicated page for product analytics
- **Advanced Filtering**: Date range filtering for historical analysis

#### Pagination System
- **Pagination Component**: Reusable pagination with page size control
- **Table Pagination**: Applied to Reports, Products, and Users pages
- **Smart Navigation**: Disabled buttons at limits, auto-reset on data load
- **10-Item Default**: Standard pagination size across all tables

#### Automatic and Deductible Expenses
- **GastoAutomatico Model**: Predefined expenses for quick insertion
- **GastoDeducible Model**: Category marking as deductible (income/savings/transfer)
- **Automatico Page**: Management interface for automatic expenses
- **Deducibles Page**: Management interface for deductible categories
- **Quick Insert**: Buttons to rapidly add automatic expenses to reports

### Improvements

#### Statistics Page
- **Filter by Date Range**: Custom period analysis
- **Enhanced Metrics**: Improved profit margin and expense ratio calculations
- **Better Visualizations**: Expanded color palette (8 colors)
- **PDF Preview**: Statistics preview before export

#### Report Management
- **Detailed Preview**: Complete report view before deletion
- **Confirmation Dialog**: Prevent accidental deletions
- **Edit Capability**: Can modify existing reports
- **Historical View**: Access all past reports with pagination

#### PDF Export
- **Smart Pagination**: Automatic page breaking
- **Responsive Layout**: Adapts to content size
- **Quality Export**: 3x scaling for crisp output
- **Chart Support**: Includes all chart types in PDF

---

## Previous Versions

See Git history for earlier versions.
