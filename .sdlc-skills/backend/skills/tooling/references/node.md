# Tooling — notas Node.js / TypeScript

- **Runtime y gestor:** `.nvmrc`, `engines.node`, `packageManager: "pnpm@x.y.z"` con Corepack; `engine-strict=true` en `.npmrc`.
- **TypeScript:** `tsc --noEmit` en CI; build con `tsc`, `tsup` o `esbuild`; o ejecución directa de TypeScript con `tsx` en desarrollo (y el type-check aparte).
- **Lint/formato:** ESLint flat config con `typescript-eslint` (reglas con tipos como `no-floating-promises`, `no-misused-promises`) + Prettier, o Biome; `eslint-plugin-n` para APIs de Node.
- **Configuración:** módulo `config.ts` con Zod (o `envalid`, `@t3-oss/env-core`); `node --env-file=.env` (Node 20.6+) en desarrollo sin `dotenv`.
- **Desarrollo:** `tsx watch` o `node --watch`; NestJS `nest start --watch`.
- **Imagen:** `node:<lts>-slim` o distroless (`gcr.io/distroless/nodejs`), usuario `node`, `pnpm prune --prod` o `pnpm deploy` para copiar solo dependencias de producción en monorepos.
- **Monorepo:** pnpm workspaces + Turborepo/Nx para ejecutar tareas solo en paquetes afectados.
