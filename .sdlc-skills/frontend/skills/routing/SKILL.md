---
name: routing
description: Diseña, implementa y audita el enrutado del frontend (Vue Router/Nuxt, React Router/TanStack Router/Next.js, Angular Router). Cubre definición y tipado de rutas, lazy loading y prefetch, guards de autenticación y roles (y por qué no son seguridad), redirección a login con URL de retorno segura, carga de datos por ruta, estado en la URL (filtros, paginación, pestañas) con validación, layouts anidados, 404 y páginas de error, scroll y foco al navegar, avisos de cambios sin guardar y redirecciones de URLs antiguas. Úsala al crear o reorganizar rutas, proteger secciones, sincronizar filtros con la URL o ante parpadeos de contenido protegido, enlaces que no se pueden compartir o el botón atrás que no funciona. No la uses para SEO y códigos HTTP del servidor (rendering-and-seo) ni para estructura de carpetas (architecture).
---

# Enrutado

La URL es la interfaz más estable de la aplicación: se comparte, se guarda en favoritos, se recarga y se usa con el botón atrás. Un buen enrutado hace que **todo estado que merezca un enlace esté en la URL**, que cada ruta cargue solo lo que necesita y que la navegación sea predecible para el usuario y para el lector de pantalla.

## Cuándo usarla

- Definir o reorganizar las rutas de una aplicación o feature.
- Proteger secciones por autenticación o rol.
- Sincronizar filtros, búsqueda, paginación u ordenación con la URL.
- Síntomas: se ve un instante el contenido protegido antes de redirigir al login; al recargar se pierde el filtro; el botón atrás no hace lo esperado; enlaces que no se pueden compartir; el scroll queda a mitad de página al navegar.

**No es para:** códigos HTTP, metadatos y SEO de cada página → `rendering-and-seo` · ubicación de los archivos de rutas por feature → `architecture` · lógica del formulario cuyo aviso de salida se configura aquí → `forms` · autorización real → backend.

## Paso 0: contexto (ambos modos)

1. Detecta el router (Vue Router, Nuxt file-based, React Router en modo declarativo/data/framework, TanStack Router, Next.js App Router, Angular Router) y su versión. Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Localiza la definición de rutas, los guards/middleware, cómo se resuelve la sesión al arrancar y cómo se cargan los datos de cada página.

## Modo Construir

1. **Mapa de rutas** con nombres, layouts anidados, rutas públicas/privadas y metadatos (título, roles, si requiere sesión). Ver [patterns.md § Definición](references/patterns.md#definición-de-rutas).
2. **Lazy loading por ruta** y prefetch razonable (hover, viewport o idle).
3. **Autenticación:** resolver la sesión **antes** de decidir qué renderizar; guard que redirige a login con `redirect` validado (sin open redirect). Ver [patterns.md § Guards](references/patterns.md#guards-autenticación-y-roles).
4. **Estado en la URL** para filtros, búsqueda, página, orden y pestañas, con parseo y validación (los query params son entrada del usuario). Ver [patterns.md § Estado en la URL](references/patterns.md#estado-en-la-url).
5. **Datos por ruta** en loaders/resolvers o con prefetch al navegar, sin cascadas.
6. **Errores:** ruta catch-all 404, error boundary por ruta, página de "sin permiso".
7. **Experiencia de navegación:** título por ruta, foco y anuncio al cambiar de página (→ `accessibility`), scroll al inicio o restaurado, aviso de cambios sin guardar donde haga falta.
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Inventaria las rutas, guards, middleware y el arranque de la sesión.
2. Prueba: recargar en rutas profundas, acceder sin sesión a rutas privadas, manipular el parámetro de retorno del login, compartir una URL con filtros, botón atrás tras filtrar.
3. Recorre [checklist.md](references/checklist.md).
4. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-ROUTE`.

## Principios

1. **Si el usuario querría compartirlo o volver a ello, va en la URL.**
2. **Los guards son experiencia de usuario, no seguridad.** Ocultan pantallas; la autorización real la hace el backend en cada petición.
3. **Nunca se muestra contenido protegido sin una sesión confirmada**, ni siquiera un instante.
4. **Todo lo que viene de la URL es entrada no confiable:** se parsea, se valida y tiene un valor por defecto.
5. **Cada ruta carga solo su código y sus datos**, en paralelo y sin cascadas.
6. **Rutas con nombre o helpers tipados**, no strings de URL repetidas por el código.
7. **La navegación se anuncia:** título, foco y scroll coherentes en cada cambio de ruta.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `security`: open redirects, autorización real en backend, datos sensibles en la URL.
- `state-management`: qué estado va en la URL y qué en stores.
- `data-fetching`: prefetch y caché de los datos de cada ruta.
- `accessibility`: foco y anuncio en cambios de ruta, `aria-current` en navegación.
- `rendering-and-seo`: 404 reales, redirecciones 301, history mode.
- `performance`: lazy loading y prefetch.
- `i18n`: prefijo de idioma en las rutas y cambio de idioma conservando la ruta.
- `observability`: error boundaries por ruta y errores de carga de chunks tras un despliegue.
