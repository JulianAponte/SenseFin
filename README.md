# SenseFin

SPA de finanzas personales construida solo en frontend con `HTML`, `CSS` y `JavaScript` vanilla.

## Estado actual

- Sin backend ni base de datos.
- Persistencia local mediante `localStorage`.
- Vistas disponibles: `Dashboard`, `History`, `Receipts` e `Insights`.
- Exportación disponible en `History` e `Insights`.

## Estructura

```text
Front_SenseFin/
├── assets/
│   └── logo/              # SVG del logo e isotipo
├── css/                   # Variables, layout y componentes
├── docs/
│   └── preparacion/       # Documentación auxiliar del proyecto
├── js/
│   ├── app.js             # Boot de la SPA y navegación
│   ├── i18n.js            # Diccionario ES/EN
│   ├── components/        # Sidebar, modales, date picker
│   ├── data/              # Mock inicial
│   ├── state/             # Estado global y persistencia
│   ├── utils/             # Exportadores y helpers
│   └── views/             # Dashboard, History, Receipts, Insights
├── index.html
├── README.md
├── Update.md
└── MEJORAS.md
```

## Ejecución local

Los módulos ES requieren servir el proyecto por HTTP.

```bash
npx serve . -l 8080
```

Luego abre `http://localhost:8080`.

## Funcionalidad principal

- Dashboard con resumen visual del gasto.
- Historial con filtros, paginación y exportación.
- Recibos con filtros, preview y flujo mock de carga/escaneo.
- Insights con métricas y exportación.
- Sidebar con perfil, calendario, recordatorios e idioma.
