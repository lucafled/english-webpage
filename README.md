# Nexo · Clases de inglés

Sitio estático para GitHub Pages que convierte la idea de `plataforma-ingles` en una experiencia pública, clara y navegable.

## Qué incluye

- Portada pública con propuesta de valor, modalidades y próximas opciones.
- Catálogo de clases con búsqueda y filtros por nivel y modalidad.
- Flujo local de reserva: los horarios elegidos se guardan en `localStorage` para probar el recorrido.
- Espacio de alumno con próxima clase, progreso, agenda y vista de administración.
- Biblioteca de recursos con búsqueda y guías abiertas en un diálogo accesible.
- Acceso de demostración por rol y flujo visual de primer acceso.
- Mapa del proyecto original y explicación de las capacidades que requieren backend.

## Nota de publicación

GitHub Pages sirve archivos estáticos. Por eso login, Supabase, NextAuth, escritura de datos y enlaces reales de videollamada están claramente marcados como demo-only. La aplicación conectada original necesita un entorno Node compatible para activar esas funciones.

## Archivos publicados

- `index.html` — estructura semántica, navegación y metadatos SEO.
- `styles.css` — sistema visual responsive, estados de foco y soporte para `prefers-reduced-motion`.
- `app.js` — rutas hash, filtros, diálogo de recursos, roles demo y persistencia local.
