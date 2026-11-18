# Tooling — notas Vue / Nuxt

## Vue + Vite

- Proyecto base: `npm create vue@latest` (Vite, TypeScript, Vitest, Playwright, ESLint opcionales).
- Type-check con **`vue-tsc --noEmit`** (o `vue-tsc --build` con project references); `vite build` no comprueba tipos.
- ESLint: `eslint-plugin-vue` (`flat/recommended`), `@vue/eslint-config-typescript`, `@vue/eslint-config-prettier`; accesibilidad con `eslint-plugin-vuejs-accessibility`; i18n con `@intlify/eslint-plugin-vue-i18n`.
- Variables: `import.meta.env.VITE_*`; modos con `--mode staging` y archivos `.env.staging`; tipado en `env.d.ts` (`interface ImportMetaEnv`), además de la validación en runtime.
- `server.proxy` en `vite.config.ts` para la API en desarrollo.
- Vue DevTools (extensión o `vite-plugin-vue-devtools`).

## Nuxt

- `nuxi` para crear, analizar (`nuxi analyze`) y actualizar (`nuxi upgrade`).
- Type-check: `nuxi typecheck` (usa `vue-tsc`).
- ESLint: módulo `@nuxt/eslint`, que genera una flat config adaptada al proyecto (auto-imports incluidos).
- Configuración: `runtimeConfig` (secretos, solo servidor) y `runtimeConfig.public` (cliente), sobrescribibles con variables `NUXT_*` / `NUXT_PUBLIC_*` en tiempo de ejecución sin recompilar.
- Despliegue: presets de Nitro por proveedor (`node-server`, `vercel`, `netlify`, `cloudflare-pages`, `static` con `nuxi generate`).
