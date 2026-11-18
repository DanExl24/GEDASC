# Patrones de tooling

## Base reproducible

```jsonc
// package.json
{
  "packageManager": "pnpm@9.15.0",        // Corepack usa exactamente esta versión
  "engines": { "node": ">=22 <23" },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit -p tsconfig.app.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

```text
.nvmrc          → 22
.npmrc          → engine-strict=true   (falla si la versión de Node no cumple engines)
```

- Elige **un** gestor (npm, pnpm, yarn o bun) y borra los lockfiles de los demás.
- El lockfile se versiona siempre. En CI: `npm ci`, `pnpm install --frozen-lockfile`, `yarn install --immutable`.
- Versión de Node LTS; la misma en local (`.nvmrc`/`.node-version`), en CI y en el entorno de build del despliegue.
- Monorepo: workspaces del gestor + Turborepo o Nx para ejecutar tareas solo en paquetes afectados y cachearlas.

## Variables de entorno

### Validadas al arrancar

```ts
// shared/config/env.ts
import { z } from 'zod'

const EnvSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_FEATURE_NEW_CHECKOUT: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
})

export const env = EnvSchema.parse(import.meta.env)   // error claro al arrancar si falta algo
```

- Un único módulo `env` tipado; nadie lee `import.meta.env`/`process.env` directamente en el resto del código.
- `.env.example` versionado con todas las variables (sin valores secretos); `.env*.local` en `.gitignore`.
- **Prefijos públicos** (`VITE_`, `NEXT_PUBLIC_`, `NUXT_PUBLIC_`): todo lo que llevan acaba en el bundle (→ `security`).

### Configuración en tiempo de ejecución

Las variables de build obligan a compilar una vez por entorno. Para promover el **mismo artefacto** de staging a producción:

```ts
// el servidor/CDN sirve /config.json distinto por entorno
const RuntimeConfigSchema = z.object({ apiUrl: z.url(), sentryDsn: z.string().optional() })

export async function loadConfig() {
  const res = await fetch('/config.json', { cache: 'no-store' })
  return RuntimeConfigSchema.parse(await res.json())
}
// main.ts: const config = await loadConfig(); app.provide(ConfigKey, config); app.mount('#app')
```

Alternativas: inyectar `window.__CONFIG__` en `index.html` al desplegar, o `runtimeConfig` en meta-frameworks con servidor.

## Lint y formato

```js
// eslint.config.js (flat config)
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'coverage', '**/*.gen.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,          // reglas que usan información de tipos
  { languageOptions: { parserOptions: { projectService: true } } },
  // + plugin del framework, de accesibilidad, de hooks y de límites de módulos (→ architecture)
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  prettier,                                            // desactiva reglas de estilo que chocan con Prettier
)
```

- **ESLint** para errores de código; **Prettier** (o **Biome**, que hace ambas cosas y es mucho más rápido) para formato. No uses reglas de estilo de ESLint junto a Prettier.
- Lint sin avisos acumulados: si una regla no se va a cumplir, se desactiva; si se cumple, es `error`.
- Reglas con información de tipos (`recommendedTypeChecked`) detectan promesas sin `await` y usos inseguros de `any`, pero hacen el lint más lento: actívalas en CI si en local molestan.

## Git hooks

```jsonc
// package.json
"simple-git-hooks": { "pre-commit": "pnpm lint-staged" },
"lint-staged": {
  "*.{ts,tsx,vue}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

- Solo archivos cambiados; el hook debe tardar segundos. Type-check completo y tests, en CI.
- Husky o simple-git-hooks; commitlint solo si el equipo usa Conventional Commits.
- Los hooks se pueden saltar: no sustituyen al CI.

## Pipeline de CI

```yaml
# .github/workflows/ci.yml (esquema)
jobs:
  quality:
    steps:
      - checkout
      - setup-node (node-version-file: .nvmrc, cache: pnpm)
      - pnpm install --frozen-lockfile
      - pnpm lint            # en paralelo con typecheck si el runner lo permite
      - pnpm typecheck
      - pnpm format:check
      - pnpm test -- --coverage
      - pnpm build
      - size-limit / análisis del bundle (→ performance)
  e2e:
    needs: quality
    steps: [build, playwright test contra el build o el preview]
  preview:
    steps: [desplegar preview por PR y comentar la URL]
```

- **Falla rápido:** lint y tipos antes que tests y build.
- **Caché** de dependencias (y de Turborepo/Nx en monorepos).
- **Sin pasos "continue-on-error"** silenciosos en checks que deberían bloquear.
- Previews por PR (Vercel, Netlify, Cloudflare Pages o propio) para revisar UI y ejecutar E2E/Lighthouse contra ellas.
- Auditoría de dependencias y actualización automatizada con Renovate/Dependabot, agrupando actualizaciones menores (→ `security`).

## Build y source maps

- Target moderno (`es2020`/`es2022`) según los navegadores soportados (`browserslist`).
- Source maps `hidden` en producción: se generan y se suben a la herramienta de errores, pero el bundle no los referencia y no se publican (→ `observability`, `security`).
- Inyecta la versión de release (commit SHA o versión del paquete) como constante de build: `define: { __APP_VERSION__: JSON.stringify(process.env.GIT_SHA) }`.

## Desarrollo local

- Proxy del dev server hacia la API para evitar CORS en local (`server.proxy` en Vite, `proxy.conf.json` en Angular, `rewrites` en Next).
- MSW en modo navegador para trabajar sin backend o con escenarios concretos (handlers compartidos con los tests → `testing`).
- HMR lento o recargas completas: suele indicar dependencias circulares o módulos con efectos secundarios al importarse (→ `architecture`).

## Despliegue estático

- **Fallback de SPA:** rutas desconocidas sirven `index.html` (con la consecuencia de soft 404 → `rendering-and-seo`).
- **Caché:** assets con hash `immutable` un año; `index.html` sin caché (`no-cache`) (→ `performance`).
- **Cabeceras de seguridad** en la configuración del host (→ `security`).
- Mantener los assets del despliegue anterior un tiempo reduce los errores de chunks perdidos (→ `observability`).

## Editor

- `.editorconfig` (indentación, fin de línea, charset).
- `.vscode/extensions.json` con las extensiones recomendadas (ESLint, Prettier/Biome, la del framework) y `.vscode/settings.json` con formato al guardar.
- Fin de línea consistente (`.gitattributes` con `* text=auto eol=lf`) para evitar diffs fantasma entre Windows y Unix.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Lockfile ignorado o varios lockfiles | Builds distintos en cada máquina | Un gestor, lockfile congelado en CI |
| Node sin fijar | "En mi máquina funciona" | `.nvmrc` + `engines` + misma versión en CI |
| `process.env.X` disperso y sin validar | Errores en producción por variables ausentes | Módulo `env` validado |
| Un build por entorno sin necesidad | Lo probado en staging no es lo desplegado | Configuración en runtime |
| ESLint y Prettier peleándose | Cambios de formato infinitos | `eslint-config-prettier` o Biome |
| Cientos de warnings de lint | Nadie los mira | Error o desactivada |
| Hook pre-commit que ejecuta todos los tests | Se saltan los hooks | Solo archivos cambiados; tests en CI |
| CI sin type-check | Errores de tipos en producción | `typecheck` bloqueante |
| Source maps publicados | Código fuente legible | `hidden` + subida a la herramienta |
| Finales de línea mezclados | Diffs enormes sin cambios reales | `.gitattributes` + `.editorconfig` |
