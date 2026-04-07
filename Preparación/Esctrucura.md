# Panel de Finanzas Personales -- Arquitectura del Producto

Este documento define la **estructura, secciones y funcionalidad** de la aplicación del panel financiero.  
Su propósito es guiar el **diseño de UI, wireframes y desarrollo**.

------------------------------------------------------------------------

# Estructura de Navegación Principal

La aplicación contiene cuatro secciones principales:

- Dashboard  
- Historial  
- Recibos  
- Insights

Cada sección tiene un rol específico en el flujo de gestión financiera.

------------------------------------------------------------------------

# 1. Dashboard

**Propósito:**  
Proporcionar una vista rápida de la situación financiera del usuario para el mes actual.

## Elementos principales

### Acciones rápidas

- Añadir ingreso  
- Añadir gasto  
- Añadir recordatorio de pago

### Resumen de gasto mensual

- Gráfico circular de gastos  
- Monto total de gasto mensual  
- Categorías de gasto

Ejemplo de categorías: - Vivienda - Supermercado - Transporte - Entretenimiento - Servicios - Suscripciones - Otros

### Pagos próximos

Muestra pagos programados con su estado.

Estados: - Pendiente - Completado - Vencido

Funciones: - Lista de verificación para marcar pagos como completados - Indicadores de fecha de vencimiento - Resaltar pagos vencidos

### Calendario

Muestra: - Mes actual - Indicadores para pagos programados

Interacciones: - Al hacer clic en un día se resaltan los pagos relacionados.

### Consejo inteligente de ahorro

Sugerencia automatizada basada en el comportamiento de gasto.

Ejemplo:  
> "Gastaste 15% más en restaurantes este mes comparado con el mes pasado."

------------------------------------------------------------------------

# 2. Historial

**Propósito:**  
Mostrar el **historial completo de transacciones**.

## Lista de transacciones

Cada transacción incluye:

- Fecha  
- Tipo (Ingreso / Gasto)  
- Categoría  
- Monto  
- Descripción  
- Método de pago

## Filtros

Los usuarios pueden filtrar transacciones por:

- Rango de fechas  
- Categoría  
- Tipo de transacción  
- Monto

## Búsqueda

Buscar transacciones usando palabras clave.

Ejemplo: Buscar nombres de comercios o descripciones.

## Acciones

Los usuarios pueden:

- Editar una transacción  
- Eliminar una transacción  
- Ver un recibo adjunto

------------------------------------------------------------------------

# 3. Recibos

**Propósito:**  
Almacenar y gestionar recibos de pago y comprobantes de compra.

## Galería de recibos

Los recibos se muestran como tarjetas que contienen:

- Vista previa de la imagen  
- Fecha  
- Monto  
- Nombre del comercio  
- Categoría

## Tipos de archivo compatibles

- JPG  
- PNG  
- PDF

## Funciones

- Subir recibo  
- Escanear recibo (captura con cámara)  
- Adjuntar recibo a una transacción  
- Descargar recibo

------------------------------------------------------------------------

# 4. Insights

**Propósito:**  
Proveer análisis e ideas financieras.

## Gráficos financieros

### Gastos por categoría

Gráfico de pastel que muestra la distribución de los gastos.

### Tendencia de gasto mensual

Gráfico de líneas que muestra el gasto a lo largo del tiempo.

### Ingresos vs Gastos

Gráfico de barras comparando ingresos y gastos.

## Métricas

- Gasto mensual promedio  
- Categoría de gasto más grande  
- Tasa de ahorro  
- Cambios en la tendencia de gasto

------------------------------------------------------------------------

# Recordatorios de Pago

Los recordatorios de pago se gestionan principalmente en el **Dashboard**.

## Estados del recordatorio

- Pendiente  
- Completado  
- Vencido

## Funciones de recordatorio

- Casilla de verificación para completar  
- Integración con calendario  
- Alertas visuales de vencimiento

------------------------------------------------------------------------

# Métodos de Pago

Las transacciones pueden incluir diferentes métodos de pago.

Ejemplos:

- Efectivo  
- Tarjeta de crédito  
- Tarjeta de débito  
- Transferencia bancaria

------------------------------------------------------------------------

# Funciones opcionales futuras (Fase 2)

Estas funciones no son obligatorias para el MVP pero pueden añadirse más adelante.

## Seguimiento de presupuesto

Establecer límites de gasto por categoría.

Ejemplo:

Groceries Limit: \$400  
Gastado: \$320  
Restante: \$80

Sección sugerida: Insights

------------------------------------------------------------------------

## Seguimiento de suscripciones

Detectar y gestionar gastos recurrentes.

Ejemplos:

- Netflix  
- Spotify  
- Membresía de gimnasio

Sección sugerida: Insights

------------------------------------------------------------------------

## Exportación de datos

Permitir exportar datos de transacciones para contabilidad.

Formatos:

- CSV  
- PDF

Sección sugerida: Historial

------------------------------------------------------------------------

# Estructura final del producto

Dashboard - Gráfico de gasto mensual - Pagos próximos - Calendario - Acciones rápidas - Consejos inteligentes de ahorro

Historial - Todas las transacciones - Filtros - Búsqueda - Editar / Eliminar

Recibos - Recibos subidos - Funcionalidad de subida - Adjuntos a transacciones

Insights - Análisis financiero - Gráficos - Tendencias de gasto - Métricas financieras

------------------------------------------------------------------------

# Wireframes recomendados

Para diseñar la UI del producto de forma eficiente, crea los siguientes wireframes:

1. Dashboard  
2. Historial  
3. Recibos  
4. Insights  
5. Modal Añadir Transacción  
6. Modal Añadir Recordatorio de Pago

Estas **seis pantallas definen el MVP central del producto**.