# SenseFin — Panel de Finanzas Personales

Panel financiero single-page application (SPA) desarrollado con HTML, CSS y JavaScript vanilla. Sin frameworks ni dependencias externas.

## Vista previa

| Vista | Descripción |
|-------|-------------|
| **Dashboard** | Gráfico donut SVG de gastos mensuales (68% presupuesto), breakdown por categoría, botones Add Income/Expense |
| **History** | Tabla de transacciones con icons VISA/Apple Pay, badges por categoría, búsqueda en tiempo real, filtros, paginación |
| **Receipts** | Grid 4 columnas de recibos con badges tipo (JPG/PDF), botones Scan/Upload, filtros por categoría y fecha |
| **Insights** | Métricas clave, gráfico pie (Canvas), línea de tendencia mensual, barras Income vs Expenses |

## Estructura del proyecto

```
Front_SenseFin/
├── index.html              # Entrada principal (SPA)
├── css/
│   ├── variables.css       # Tokens: #1142d4 primary, #030712 bg, accent colors
│   ├── layout.css          # Flex 3-columns, sidebar toggle, scrollbars
│   └── components.css      # Glass-cards, buttons, badges, tables, modals
└── js/
   ├── app.js              # Router SPA, nav binding, sidebar toggle
   ├── data/
   │   └── mockData.js     # Transacciones, pagos, recibos, trends, user
   ├── views/
   │   ├── dashboard.js    # Dashboard (SVG donut)
   │   ├── historial.js    # History (tabla filtrable)
   │   ├── recibos.js      # Receipts (grid cards)
   │   └── insights.js     # Insights (canvas charts)
   └── components/
       ├── sidebar.js      # Sidebar: perfil, pagos, tip, calendario
       └── modal.js        # Modales: add income/expense/reminder
```

## Cómo ejecutar

**Requisito**: Servidor HTTP local (los módulos ES requieren protocolo HTTP).

```bash
# Opción 1: Node.js
npx serve . -l 8080

# Opción 2: Python
python -m http.server 8080

# Opción 3: VS Code Live Server extension
```

Ir a `http://localhost:8080`

## Tecnologías

| Tecnología | Uso |
|-----------|------|
| HTML5 | Estructura semántica |
| CSS3 Variables | Tokens de diseño, glassmorphism, Grid/Flexbox |
| JavaScript ES Modules | Router SPA, vistas dinámicas, sin bundler |
| SVG | Gráfico donut Dashboard |
| Canvas API | Gráficos pie/line/bar en Insights |
| Material Symbols Outlined | Iconografía (Google Fonts) |
| Inter | Tipografía (Google Fonts) |

## Layout

| Columna | Ancho | Contenido |
|---------|-------|-----------|
| Izquierda (256px) | Fija | Logo, navegación, calendario mini |
| Centro (flexible) | Cambia por vista | Dashboard / History / Receipts / Insights |
| Derecha (320px) | Toggle show/hide | Perfil usuario, pagos próximos, smart tip |

El sidebar derecho se oculta/muestra con el botón `▶` (chevron). Ambos sidebars persisten al cambiar de vista — solo el contenido central cambia.

## Paleta de colores

| Uso | Color |
|-----|-------|
| Background | `#030712` |
| Primary (blue) | `#1142d4` |
| Accent Blue | `#3b82f6` |
| Accent Green | `#10b981` |
| Accent Cyan | `#06b6d4` |
| Accent Purple | `#a855f7` |
| Accent Gold | `#f59e0b` |
| Accent Red | `#ef4444` |
| Glass-card bg | `rgba(15, 23, 42, 0.6)` |

## Funcionalidades

- **Router SPA** — Navegación sin recarga, solo cambia contenido central
- **Filtros en tiempo real** — Búsqueda, tipo, categoría en History
- **Modales** — Agregar ingresos, gastos, recordatorios de pago
- **Calendario interactivo** — Navegación por meses, indicadores de pagos
- **Toggle sidebar** — Colapsar/expandir sidebar derecho
- **Gráficos nativos** — SVG donut + Canvas API (sin librerías externas)
- **Glassmorphism** — Blur, glow effects, border transparentes
