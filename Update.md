# Update.md

## Estado validado del proyecto

Fecha de actualización: `2026-04-08`

El proyecto sigue siendo un front SPA en `HTML + CSS + JavaScript` sin backend ni base de datos. Este registro fue reorganizado con base en el código real, eliminando referencias antiguas y separando claramente lo implementado de lo que sigue pendiente.

## Resumen de lo que sí quedó implementado

### Base de la SPA

- Navegación SPA con vistas `Dashboard`, `History`, `Receipts` e `Insights`.
- Estado central con persistencia en `localStorage`.
- Sidebar derecho con perfil, recordatorios de pago, calendario e interruptor de idioma.
- Layout responsive con comportamiento de drawer para navegación lateral en pantallas pequeñas.

### Funcionalidad de vistas

- `Dashboard`: gráfico donut de gasto mensual y accesos rápidos para agregar ingresos y gastos.
- `History`: búsqueda, filtros por tipo/categoría/periodo/rango de fechas, orden por monto, paginación y exportación CSV/PDF.
- `Receipts`: búsqueda, filtros por rango y categoría, orden por monto, paginación, vista previa/descarga y modales mock de carga/escaneo.
- `Insights`: tarjetas de métricas, visualización comparativa, bloque de salud por categoría y exportación CSV/PDF.

### Perfil, categorías y datos locales

- Configuración básica de perfil y métodos de pago.
- Creación y eliminación de categorías de gasto personalizadas.
- Persistencia local de transacciones, recibos, recordatorios y preferencias de idioma.

## Correcciones y reorganización realizadas en esta pasada

### Correcciones funcionales

- Se corrigió la ruta rota del logo principal.
- Se normalizaron los nombres internos de vistas a inglés: `history` y `receipts`.
- Se ajustó el reinicio visual del selector de icono/color al crear categorías personalizadas.
- Se corrigió la exportación CSV de `Insights` para que el contenido exportado sea coherente con las columnas.
- Se completaron textos faltantes de i18n en paginación y etiquetas secundarias del modal de configuración.

### Reorganización de carpetas y archivos

- Los SVG del logo quedaron agrupados en `assets/logo/`.
- La documentación auxiliar se movió a `docs/preparacion/`.
- Las vistas quedaron nombradas de forma consistente en `js/views/history.js` y `js/views/receipts.js`.
- Se eliminaron los prototipos HTML legacy que ya no usa la SPA.

## Estructura actual resumida

```text
Front_SenseFin/
├── assets/
│   └── logo/
├── css/
├── docs/
│   └── preparacion/
├── js/
│   ├── components/
│   ├── data/
│   ├── state/
│   ├── utils/
│   └── views/
├── index.html
├── README.md
├── Update.md
└── MEJORAS.md
```

## Sugerencias reagrupadas por prioridad

### Prioridad alta

- Conectar los filtros de `Insights` a datos reales del estado para que no sean solo controles visuales.
- Permitir editar categorías personalizadas existentes y definir/actualizar su presupuesto mensual desde la UI.
- Añadir validaciones visibles y feedback de éxito/error en modales, guardados y exportaciones.

### Prioridad media

- Completar la internacionalización de todos los textos auxiliares que aún estén hardcodeados.
- Mejorar estados vacíos y mensajes cuando una exportación PDF sea bloqueada por el navegador.
- Mostrar información del archivo seleccionado al subir recibos y una previsualización básica del archivo cargado.

### Prioridad baja

- Refinar accesibilidad: foco visible, navegación por teclado y labels/atributos ARIA adicionales.
- Pulir la consistencia visual de formularios y paneles secundarios.
- Documentar mejor flujos y decisiones UI en `README.md` y `docs/preparacion/`.
