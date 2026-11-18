# Patrones de enrutado

## Definición de rutas

```text
/                          → layout público
  /login
  /precios
/app                       → layout privado (requiere sesión)
  /app/pedidos             → lista (filtros en query params)
  /app/pedidos/:id         → detalle
  /app/pedidos/:id/editar  → edición (aviso de cambios sin guardar)
  /app/admin/**            → requiere rol admin
/403                       → sin permiso
/:pathMatch(.*)*  |  *     → 404
```

- **Rutas con nombre** o helpers tipados (`routes.orderDetail(id)`) en lugar de construir strings a mano en cada enlace.
- **Metadatos por ruta**: título, si requiere sesión, roles, breadcrumbs. Tipados (ver referencia del stack).
- **Layouts anidados** para compartir header/sidebar sin re-montarlos al navegar.
- **Parámetros de ruta** (`:id`) para identificar el recurso; **query params** para el estado de la vista (filtros, página, orden, pestaña).
- History mode (URLs limpias) con el servidor configurado para servir la app en rutas profundas.

## Lazy loading y prefetch

- Cada ruta (o grupo de rutas de una feature) se carga bajo demanda.
- Prefetch del código (y si es posible, de los datos) al pasar el ratón por un enlace, cuando el enlace entra en el viewport o en idle. Sin abusar: prefetch de todo anula el code splitting.
- Muestra un indicador de navegación (barra de progreso) si la carga de la ruta puede tardar.

## Guards: autenticación y roles

### Resolver la sesión antes de renderizar

```ts
// arranque de la app (pseudo-código común)
await auth.restoreSession()   // lee la cookie / refresca el token una vez
app.mount('#app')             // el router decide con la sesión ya conocida
```

O, en el guard, esperar a la promesa de sesión antes de decidir. Si el guard decide con `user === null` porque la sesión aún no se ha cargado, redirige a login a usuarios autenticados o muestra un instante la página protegida.

### Guard de sesión con retorno seguro

```ts
function requireAuth(to: Location) {
  if (auth.isAuthenticated) return true
  return { name: 'login', query: { redirect: to.fullPath } }
}

// en el login, tras autenticar:
const target = safeRedirect(route.query.redirect)
router.replace(target)

function safeRedirect(value: unknown, fallback = '/app'): string {
  if (typeof value !== 'string' || !value.startsWith('/')) return fallback
  try {
    // el parser de URL normaliza "//evil.com", "/\evil.com" y tabuladores/saltos de línea igual que el navegador
    const url = new URL(value, window.location.origin)
    return url.origin === window.location.origin ? url.pathname + url.search + url.hash : fallback
  } catch {
    return fallback
  }
}
```

Comprobar solo el prefijo (`startsWith('/') && !startsWith('//')`) no basta: `/\evil.com` o `/<TAB>/evil.com` se normalizan a otro dominio. Compara el origen tras parsear.

Sin esta validación, `/login?redirect=https://sitio-malicioso.com` convierte el login en un **open redirect** (phishing creíble con el dominio real).

### Roles

```ts
function requireRole(role: Role) {
  return () => auth.user?.roles.includes(role) ? true : { name: 'forbidden' }
}
```

- Distingue **no autenticado** (→ login) de **sin permiso** (→ 403 con explicación), no mandes a login a alguien que ya ha iniciado sesión.
- Ocultar enlaces y rutas por rol **no protege nada**: el backend debe rechazar la petición. Si el backend no lo hace, es un hallazgo de seguridad crítico (→ `security`, dominio backend).

## Estado en la URL

```ts
// parseo con validación y valores por defecto (Zod como ejemplo)
const OrderFiltersSchema = z.object({
  q: z.string().trim().max(100).catch(''),
  status: z.enum(['all', 'pending', 'paid', 'cancelled']).catch('all'),
  page: z.coerce.number().int().min(1).catch(1),
  sort: z.enum(['date', '-date', 'total', '-total']).catch('-date'),
})

const filters = computed(() => OrderFiltersSchema.parse(route.query))   // nunca lanza: .catch pone el valor por defecto
```

- **Valida y normaliza**: un `?page=abc` o `?status=<script>` no debe romper la vista ni llegar sin filtrar a la API.
- **Omite los valores por defecto** de la URL para que sea corta y canónica.
- **`replace` en vez de `push`** mientras el usuario teclea en un buscador o ajusta un slider (no llenar el historial); `push` para cambios discretos (cambiar de página, aplicar un filtro).
- **Debounce** de la escritura en la URL para búsquedas en vivo.
- Al cambiar un filtro, vuelve a la página 1.
- Arrays: formato consistente (`?tag=a&tag=b` o `?tags=a,b`), el mismo en toda la app.
- **Nunca datos sensibles en la URL** (tokens, emails, DNI): quedan en el historial, en logs de servidores y en la cabecera `Referer`.

## Carga de datos por ruta

- Preferible: el router o la librería de datos inicia la carga **al navegar**, no el componente al montarse (evita la cascada "descargar código → montar → pedir datos").
- Mecanismos: loaders (React Router, TanStack Router, Remix), resolvers (Angular), `useAsyncData` (Nuxt), prefetch de TanStack Query en el guard/loader.
- Peticiones independientes de una ruta en paralelo.
- Estados de carga a nivel de ruta (skeleton) y errores a nivel de ruta (error boundary).

## Errores y rutas especiales

- **404:** ruta comodín al final con una página útil (buscador, enlaces principales). En SSR, código 404 real (→ `rendering-and-seo`).
- **Recurso inexistente** (`/pedidos/999` que no existe): el loader/resolver detecta el 404 de la API y muestra "no encontrado", no un error genérico ni una pantalla vacía.
- **403:** página de "no tienes acceso" con explicación y a quién pedirlo.
- **Error boundary por ruta:** un fallo en una sección no tumba toda la app; ofrece reintentar.
- **Chunk load error** tras un despliegue (el usuario tiene la versión vieja y el chunk ya no existe): captura el error de carga de la ruta y recarga la página una vez.

## Navegación accesible y scroll

- Título de documento por ruta.
- Foco al `h1` del contenido o anuncio de la nueva página (→ `accessibility`).
- `aria-current="page"` en el enlace activo de la navegación.
- Scroll: al inicio en navegación nueva; posición restaurada al volver atrás; anclas (`#seccion`) respetadas, con compensación del header fijo.

## Cambios sin guardar

Guard de salida que pregunta solo si el formulario está sucio y no se está enviando (→ `forms`), más `beforeunload` para cierre o recarga de la pestaña.

## Modales con URL

Si un modal o panel debe poder compartirse o sobrevivir a una recarga (detalle de un elemento sobre una lista), represéntalo en la URL (query param o ruta anidada / ruta paralela) en lugar de solo en estado local.

## Redirecciones

- URLs antiguas → nuevas con redirección en el router (y 301 en servidor si son públicas).
- Rutas índice que redirigen a una subruta por defecto (`/app` → `/app/pedidos`) con `replace` para no ensuciar el historial.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Guard que decide antes de cargar la sesión | Parpadeo de contenido o logout falso | Resolver sesión primero |
| `redirect` del login sin validar | Open redirect | Solo rutas internas |
| Guards como única protección | Datos accesibles llamando a la API | Autorización en backend |
| Filtros solo en estado local | No se comparten, se pierden al recargar | Query params validados |
| `push` en cada tecla del buscador | Historial inservible | `replace` + debounce |
| `query.page` usado sin parsear | NaN, errores, peticiones raras | Schema con valores por defecto |
| Strings de URL repetidos | Enlaces rotos al cambiar una ruta | Rutas con nombre o helpers |
| Todas las rutas importadas estáticamente | Bundle inicial enorme | Lazy loading |
| Sin ruta 404 | Pantalla en blanco | Catch-all |
| Tokens o datos personales en la URL | Fugas en logs y Referer | Fuera de la URL |
