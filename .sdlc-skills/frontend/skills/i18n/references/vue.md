# i18n — notas Vue / Nuxt

## vue-i18n

```ts
// app/i18n.ts
export const i18n = createI18n({
  legacy: false,                       // Composition API
  locale: 'es',
  fallbackLocale: 'es',
  messages: { es: commonEs },          // solo el idioma inicial; el resto se carga bajo demanda
  datetimeFormats, numberFormats,      // formatos con nombre ('short', 'currency'…) por locale
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV,
})

export async function setLocale(locale: Locale) {
  if (!i18n.global.availableLocales.includes(locale)) {
    const messages = await import(`@/locales/${locale}/common.json`)
    i18n.global.setLocaleMessage(locale, messages.default)
  }
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  document.documentElement.dir = rtlLocales.has(locale) ? 'rtl' : 'ltr'
}
```

- En componentes: `const { t, d, n } = useI18n()`; `t('orders.pendingSummary', { count })`, `d(date, 'short')`, `n(amount, 'currency')`.
- vue-i18n usa su propia sintaxis de plurales con `|` (`"no hay pedidos | un pedido | {count} pedidos"`); para ICU completo (selección, género, ordinales), configura la opción `messageCompiler` de vue-i18n con un compilador basado en `intl-messageformat`. Elige una sintaxis y úsala en todo el proyecto: mezclarlas confunde a los traductores.
- Enlaces y componentes dentro de frases: `<i18n-t keypath="terms.accept" tag="p"><template #link><a href="/terminos">{{ t('terms.link') }}</a></template></i18n-t>`.
- `@intlify/unplugin-vue-i18n` precompila los mensajes (más rápido, sin compilador en runtime) y permite bloques `<i18n>` en SFC.
- Claves tipadas: declara el esquema de mensajes (`DefineLocaleMessage`) a partir del idioma fuente.
- Lint: `@intlify/eslint-plugin-vue-i18n` (`no-raw-text`, `no-missing-keys`, `no-unused-keys`).

## Nuxt

`@nuxtjs/i18n`: estrategia de rutas con prefijo (`prefix_except_default` o `prefix`), carga diferida de idiomas (`lazy: true`), detección de idioma del navegador con cookie, `useLocalePath()`/`useSwitchLocalePath()` para enlaces, y `useLocaleHead()` para generar `hreflang`, `lang` y `dir`.
