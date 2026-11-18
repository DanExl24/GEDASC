# Tooling — notas Angular

## Angular CLI

- `ng new` con standalone, SSR opcional y estilos; el builder `application` (esbuild + Vite en desarrollo) es el estándar en versiones recientes. Proyectos antiguos con el builder de webpack (`browser`) pueden migrar con `ng update`.
- **`ng update`** para actualizar Angular y dependencias con migraciones automáticas; actualiza versión a versión mayor, no saltes varias de golpe.
- Lint: `ng add @angular-eslint/schematics` (ESLint con reglas de TypeScript y de plantillas, incluidas las de accesibilidad). TSLint está obsoleto.
- Formato: Prettier (con `prettier-plugin-organize-imports` si se quiere) o Biome.
- Type-check: `ng build` compila con comprobación de tipos y de plantillas (`strictTemplates`); en CI, el build es el paso de type-check.
- Tests: el builder de `test` configurado en `angular.json` (Vitest en versiones recientes; Karma está obsoleto) (→ `testing`).

## Entornos

- `environment.ts` + `fileReplacements` por configuración: valores **de build**, todos públicos (→ `security`).
- Para un mismo artefacto en varios entornos, carga `config.json` en runtime con `provideAppInitializer()` (o `APP_INITIALIZER` en versiones anteriores) antes de arrancar:
  ```ts
  provideAppInitializer(async () => {
    const config = inject(AppConfigService)
    await config.load()                     // fetch('/config.json') + validación
  })
  ```

## Build

- `budgets` en `angular.json` para el tamaño del bundle (→ `performance`).
- `sourceMap: { scripts: true, hidden: true }` en producción (→ `observability`).
- `outputHashing: 'all'` para assets con hash cacheables como `immutable`.
- Proxy de desarrollo: `proxy.conf.json` referenciado en la configuración de `serve`.
