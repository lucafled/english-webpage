# Nexo · Clases de inglés

Esta publicación convierte el contenido de la carpeta `plataforma-ingles` en una experiencia web estática navegable.

## Qué incluye

- Landing pública inspirada en `src/app/page.tsx`.
- Horarios disponibles inspirados en `src/app/calendario/page.tsx` y `CalendarioPublico`.
- Flujos visuales de inicio de sesión y primer acceso.
- Vista de alumno con próxima clase y agenda.
- Panel de administración con agenda, calendario editable de demostración y alta de alumnos.
- Mapa del proyecto original, sus rutas y las tablas de Supabase definidas en `supabase/schema.sql`.

## Nota de publicación

La carpeta original es una aplicación Next.js con rutas de servidor, NextAuth y Supabase. GitHub Pages solo sirve archivos estáticos, así que esta edición conserva la interfaz y los flujos principales como demo navegable, sin fingir que el login o la base de datos están conectados. Para activar esas funciones de servidor, la aplicación original necesita desplegarse en un entorno Node compatible.

## Archivos publicados

- `index.html` — estructura de la aplicación estática.
- `styles.css` — diseño responsive y tokens visuales del proyecto.
- `app.js` — navegación, datos de demostración e interacciones locales.
