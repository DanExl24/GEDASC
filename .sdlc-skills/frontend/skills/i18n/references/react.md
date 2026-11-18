# i18n — notas React / Next.js

## Opciones

| Librería | Cuándo |
| :--- | :--- |
| **react-i18next** (i18next) | La más extendida; namespaces, carga diferida con backends, ICU mediante plugin (`i18next-icu`) o su propio formato de plurales. |
| **react-intl** (FormatJS) | ICU MessageFormat nativo y componentes de formato basados en `Intl`. |
| **next-intl** | Next.js App Router: Server Components, routing por idioma, ICU. |
| **Lingui** | Extracción automática de mensajes desde el código y catálogos compilados. |

## react-i18next

```tsx
const { t, i18n } = useTranslation('orders')

<p>{t('pendingSummary', { count })}</p>

<Trans i18nKey="terms.accept" components={{ link: <a href="/terminos" /> }} />
// "Acepto los <link>términos y condiciones</link>"
```

- i18next usa sufijos para plurales (`pendingSummary_one`, `pendingSummary_other`, `_few`, `_many` según el idioma) basados en `Intl.PluralRules`.
- Carga diferida: `i18next-http-backend` o `i18next-resources-to-backend` con `import()` dinámico por idioma y namespace.
- `i18n.on('languageChanged', (lng) => { document.documentElement.lang = lng; document.documentElement.dir = i18n.dir(lng) })`.
- Claves tipadas: declara `CustomTypeOptions` con los recursos del idioma fuente.
- Lint: `eslint-plugin-i18next` (`no-literal-string`).

## next-intl (App Router)

- Segmento `[locale]` en `app/` y middleware de next-intl para detección y redirección.
- `getTranslations()` en Server Components (sin coste de JS en el cliente para textos estáticos) y `useTranslations()` en componentes cliente.
- `useFormatter()` / `getFormatter()` para fechas, números y tiempo relativo con la zona horaria configurada.
- `generateMetadata` con traducciones y `alternates.languages` para `hreflang` (→ `rendering-and-seo`).

## Formatos

`Intl` directamente o los componentes de la librería (`<FormattedNumber>`, `<FormattedDate>` en react-intl). Memoiza los formateadores en listas largas (`useMemo` o caché por locale).
