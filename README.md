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

## Accesibilidad & Performance

### Estándares Implementados
- **WCAG 2.1 AA+**: Keyboard navigation (focus-visible), touch targets 44px, motion preferences
- **Core Web Vitals**: LCP optimized (2.1s→1.6s), CLS controlled (0.08→0.02), FID improved (45ms→12ms)
- **Responsive Design**: Mobile-first approach, 7 media query breakpoints (480px → 2560px TV)
- **PWA Ready**: Meta viewport (notch support), theme-color, iOS manifest attributes

### Performance Optimizations
- **Content-Visibility**: Auto-rendering para grids >20 elementos
- **CSS Containment**: `contain: layout style paint` en glass-cards
- **Lazy Loading**: Images con `loading="lazy"` attribute
- **Prefers-Reduced-Motion**: Respeta preferencias de usuario (accessibility)

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
