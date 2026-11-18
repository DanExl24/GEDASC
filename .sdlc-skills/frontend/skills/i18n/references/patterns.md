# Patrones de internacionalización

## Estructura de traducciones

```text
src/locales/
├── es/
│   ├── common.json        # botones genéricos, errores comunes, navegación
│   ├── orders.json        # namespace por feature
│   └── auth.json
├── en/
│   └── …
└── ar/
    └── …
```

- **Namespaces por feature**, cargados con la feature (encaja con `architecture`).
- **Claves semánticas** que describen el propósito, no el texto: `orders.list.empty.title`, no `no_hay_pedidos` (si el texto cambia, la clave sigue siendo válida).
- Un idioma fuente (normalmente el del equipo) completo; el resto, gestionado por el TMS.
- Carga diferida: solo el idioma activo (y el de fallback) se descarga.

## Nunca concatenar

```ts
// ❌ el orden y la concordancia cambian entre idiomas
t('orders.youHave') + ' ' + count + ' ' + t('orders.pending')

// ✅ frase completa con placeholders
t('orders.pendingSummary', { count })
// es: "Tienes {count, plural, one {# pedido pendiente} other {# pedidos pendientes}}"
// en: "You have {count, plural, one {# pending order} other {# pending orders}}"
```

Tampoco construyas frases con fragmentos de HTML separados: usa interpolación de componentes de la librería (`<i18n-t>`, `<Trans>`, `i18n` de Angular con elementos).

## ICU MessageFormat

```text
Plural:
{count, plural, =0 {No hay mensajes} one {# mensaje nuevo} other {# mensajes nuevos}}

Selección (p. ej., género gramatical o tipo):
{gender, select, female {Ella ha comentado} male {Él ha comentado} other {Han comentado}}

Ordinal:
{position, selectordinal, one {#.º} other {#.º}}   (en inglés: one {#st} two {#nd} few {#rd} other {#th})
```

- Las categorías de plural dependen del idioma (`zero`, `one`, `two`, `few`, `many`, `other`): el polaco, el árabe o el ruso necesitan más que `one/other`. Los traductores las completan; el código solo pasa el número.
- `=0` para un texto especial cuando no hay elementos.

## Formatos con Intl

```ts
const locale = i18n.locale   // 'es-ES', 'es-MX', 'en-US'…

new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: userTimeZone }).format(date)
new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR' }).format(1234.5)     // 1234,50 € / €1,234.50
new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(0.256)
new Intl.NumberFormat(locale, { style: 'unit', unit: 'kilometer' }).format(12)
new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day')                // "ayer"
new Intl.ListFormat(locale, { type: 'conjunction' }).format(['rojo', 'verde', 'azul'])    // "rojo, verde y azul"
new Intl.Collator(locale, { sensitivity: 'base' }).compare(a, b)                          // ordenar y comparar sin acentos
```

- Cachea los formateadores (crearlos en cada render es caro en listas largas).
- **Moneda:** el código de moneda viene de los datos (el pedido está en EUR), no del idioma de la interfaz. Un usuario en inglés puede ver un precio en euros.
- **Locale vs idioma:** `es-ES` y `es-MX` comparten traducciones (o casi) pero no formatos (separadores, moneda por defecto, formato de fecha).

## Fechas y zonas horarias

- El backend guarda y envía **UTC en ISO 8601**; el frontend muestra en la zona horaria del usuario (preferencia guardada o `Intl.DateTimeFormat().resolvedOptions().timeZone`).
- Fechas sin hora (cumpleaños, vencimientos) son **fechas de calendario**, no instantes: no las conviertas a `Date` con zona o se desplazarán un día. Trátalas como `YYYY-MM-DD` (la API Temporal, `PlainDate`, lo resuelve donde esté disponible).
- Para operaciones con fechas, `date-fns` / `date-fns-tz`, `dayjs` con plugins, `luxon` o Temporal (con polyfill); evita `moment`.

## Detección y persistencia del idioma

Prioridad habitual:
1. Idioma en la URL (`/en/precios`) — obligatorio en páginas públicas indexables.
2. Preferencia guardada del usuario (perfil en el backend, o cookie/`localStorage`).
3. `Accept-Language` (en servidor) o `navigator.languages` (en cliente), negociado contra los idiomas soportados.
4. Idioma por defecto.

- Cadena de fallback: `es-MX` → `es` → idioma por defecto, para claves que falten.
- Al cambiar de idioma: actualizar `<html lang="…" dir="…">`, la URL si lleva prefijo, la preferencia guardada, y recargar datos localizados del backend si los hay.
- No redirijas automáticamente por IP sin dejar elegir; respeta la elección explícita.

## RTL

```css
/* ❌ físico */
.card { margin-left: 1rem; padding-right: 2rem; text-align: left; border-left: 2px solid; }

/* ✅ lógico: se invierte solo con dir="rtl" */
.card { margin-inline-start: 1rem; padding-inline-end: 2rem; text-align: start; border-inline-start: 2px solid; }
```

- Tailwind: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`, `text-start`, y variantes `rtl:`/`ltr:` para casos especiales.
- `<html dir="rtl">` según el idioma.
- Iconos direccionales (flechas, "atrás", progreso) se espejan; logos, números, iconos no direccionales (reloj, búsqueda) no.
- Contenido mixto (nombres latinos en texto árabe): `<bdi>` o `dir="auto"` en datos de usuarios.

## Expansión de texto

- El alemán, finés o ruso pueden ocupar un 30–40% más que el inglés; los textos cortos (botones) pueden duplicarse.
- Sin anchos fijos en botones, pestañas, celdas ni badges; prueba con el idioma más largo.
- **Pseudo-localización** (por ejemplo, `[Ĝüàŕðàŕ çàɱƀîöš ~~~~]`): detecta textos sin traducir (no aparecen transformados), cortes por longitud y caracteres no soportados, sin esperar a los traductores.

## Contenido del backend

- Mensajes de error y validación: el backend devuelve **códigos** (`EMAIL_TAKEN`) y el frontend los traduce; o el backend localiza según `Accept-Language`. Elige uno y sé consistente.
- Contenido editorial (productos, categorías): localizado en el backend/CMS y pedido con el idioma activo.
- Emails y PDFs generados en servidor: en el idioma preferido guardado del usuario.

## Flujo de traducción

- Extracción automática de claves desde el código (herramientas de cada librería) o claves escritas a mano con tipado.
- **Claves tipadas** (generadas desde el idioma fuente): una clave inexistente es un error de compilación.
- CI: fallar si faltan claves en el idioma fuente; avisar de claves sin traducir en otros idiomas y de claves sin uso.
- TMS (Crowdin, Lokalise, Phrase, Tolgee) sincronizado con el repositorio; contexto para traductores (descripciones, capturas).
- Lint contra literales en plantillas (reglas de `eslint-plugin-vue-i18n`, `eslint-plugin-i18next`, o de Angular).

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Textos literales en plantillas | Imposible traducir sin tocar código | Claves |
| Concatenar traducciones | Frases agramaticales en otros idiomas | Frase completa con placeholders |
| `count === 1 ? 'item' : 'items'` | Plurales incorrectos en muchos idiomas | ICU plural |
| `toLocaleDateString()` sin locale ni zona, o formatos manuales | Formatos inconsistentes, fechas desplazadas | `Intl` con locale y zona explícitos |
| Moneda derivada del idioma | Precios en la moneda equivocada | Moneda de los datos |
| `margin-left`, `left:`, `text-align: left` | RTL roto | Propiedades lógicas |
| Botones con ancho fijo | Textos cortados en otros idiomas | Ancho por contenido |
| Todos los idiomas en el bundle inicial | JS innecesario | Carga diferida |
| `<html lang>` fijo | Lectores de pantalla y buscadores con idioma equivocado | Actualizarlo al cambiar de idioma |
| Ordenar con `a < b` | Orden incorrecto con acentos y otros alfabetos | `Intl.Collator` |
