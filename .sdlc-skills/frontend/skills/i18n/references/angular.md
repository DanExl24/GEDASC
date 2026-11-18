# i18n — notas Angular

## Opciones

| Enfoque | Características |
| :--- | :--- |
| **i18n integrado** (`@angular/localize`) | Marcado en plantillas (`i18n`), `$localize` en código, extracción con `ng extract-i18n` (XLIFF/JSON), ICU nativo. **Compila una versión de la app por idioma** (cambiar de idioma = cambiar de URL/build). Muy eficiente en runtime. |
| **Transloco** | Traducciones en runtime (cambio de idioma sin recargar), carga diferida por scope, plugins de mensajes ICU y de formatos. |
| **ngx-translate** | Runtime, muy extendida en proyectos antiguos; mantenimiento más irregular. |

## i18n integrado

```html
<h1 i18n="@@ordersTitle">Pedidos</h1>
<p i18n="@@pendingSummary">{count, plural, =0 {No hay pedidos pendientes} one {# pedido pendiente} other {# pedidos pendientes}}</p>
<button i18n-aria-label="@@closeDialog" aria-label="Cerrar diálogo">×</button>
```

```ts
const message = $localize`:@@orderSaved:Pedido guardado`
```

- IDs personalizados (`@@id`) estables para que los cambios de texto no rompan las traducciones.
- `angular.json` → `i18n.locales` y `localize: true` genera un build por idioma; el servidor sirve `/es/`, `/en/`… (encaja bien con SEO).
- `LOCALE_ID` determina los pipes `date`, `number`, `currency`, `percent`; registra los datos de locale necesarios.

## Pipes de formato

```html
{{ order.createdAt | date: 'medium' : userTimeZone }}
{{ order.total | currency: order.currency }}          <!-- moneda de los datos, no del idioma -->
{{ ratio | percent: '1.0-1' }}
```

## Transloco

- `TranslocoModule`/`provideTransloco` con `availableLangs`, `defaultLang`, `fallbackLang` y loader HTTP o de `import()` dinámico.
- Scopes por feature para cargar traducciones con la ruta lazy.
- `@jsverse/transloco-messageformat` para ICU; `@jsverse/transloco-locale` para formatos.
- Al cambiar de idioma, actualiza `document.documentElement.lang` y `dir` (con `inject(DOCUMENT)`).

## RTL

El CDK (`Directionality`, `dir` attribute) y Angular Material soportan RTL si el `dir` del documento o del contenedor es correcto; usa propiedades CSS lógicas en estilos propios.
