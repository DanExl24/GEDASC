# Checklist de auditoría — tooling

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)).

## 1. Reproducibilidad

- [ ] Un único gestor de paquetes declarado (`packageManager`) y un solo lockfile versionado. **[MEDIUM]**
- [ ] CI instala con lockfile congelado (`npm ci`, `--frozen-lockfile`, `--immutable`). **[MEDIUM]**
- [ ] Versión de Node fijada (`.nvmrc`/`.node-version` + `engines`) y la misma en CI y en el build de despliegue. **[MEDIUM]**
- [ ] Instalación limpia y arranque funcionan siguiendo el README. **[MEDIUM]**

## 2. Scripts

- [ ] Scripts estándar presentes: `dev`, `build`, `preview`, `lint`, `format`, `typecheck`, `test`. **[LOW]**
- [ ] Los scripts funcionan en Windows, macOS y Linux (sin dependencias de bash si el equipo es mixto). **[LOW]**

## 3. Entorno

- [ ] Variables de entorno validadas al arrancar en un módulo tipado. **[MEDIUM]**
- [ ] `.env.example` completo y versionado; archivos `.env` con secretos fuera del repositorio. **[HIGH]** si hay secretos versionados (→ `security`).
- [ ] Ningún secreto con prefijo público. **[CRITICAL]** (→ `security`).
- [ ] El mismo artefacto puede desplegarse en varios entornos (configuración en runtime), o hay una razón para no hacerlo. **[LOW–MEDIUM]**

## 4. Lint y formato

- [ ] ESLint configurado con TypeScript y el plugin del framework (y de hooks y accesibilidad). **[MEDIUM]**
- [ ] Formateador único (Prettier o Biome) sin conflicto con ESLint. **[LOW]**
- [ ] Lint sin cientos de warnings ignorados. **[LOW–MEDIUM]**
- [ ] Reglas de límites de módulos si la arquitectura las define (→ `architecture`). **[LOW]**
- [ ] Hooks de git rápidos sobre archivos cambiados (si existen). **[INFO–LOW]**

## 5. CI

- [ ] El CI corre en cada PR y bloquea el merge si falla. **[HIGH]** si no hay CI o no bloquea.
- [ ] Incluye lint, type-check, formato, tests y build. **[MEDIUM]** por cada paso ausente (**[HIGH]** si falta type-check o tests en un proyecto con flujos críticos).
- [ ] Ordenado para fallar rápido y con caché de dependencias. **[LOW]**
- [ ] Sin pasos de calidad marcados como "continue-on-error". **[MEDIUM]**
- [ ] Control de tamaño del bundle (→ `performance`). **[LOW]**
- [ ] Previews por PR para cambios de UI. **[INFO–LOW]**
- [ ] Actualización automatizada y auditoría de dependencias (→ `security`). **[MEDIUM]**

## 6. Build y despliegue

- [ ] Target de compilación acorde a los navegadores soportados. **[LOW]**
- [ ] Source maps `hidden` y subidos a la herramienta de errores; no publicados. **[LOW]**
- [ ] Versión de release inyectada en el build. **[LOW]**
- [ ] Fallback de SPA configurado en el host. **[HIGH]** si recargar en rutas profundas da 404.
- [ ] Cabeceras de caché: assets con hash `immutable`, HTML revalidado. **[MEDIUM]**

## 7. Editor y repo

- [ ] `.editorconfig` y `.gitattributes` (fin de línea consistente). **[LOW]**
- [ ] Extensiones y ajustes recomendados del editor versionados. **[INFO]**

## Cómo inspeccionar rápido

- Lockfiles: `ls package-lock.json pnpm-lock.yaml yarn.lock bun.lockb` (más de uno es un problema).
- Node: `.nvmrc`, `engines`, `node-version` en el workflow de CI.
- Entorno: buscar `process.env.` / `import.meta.env.` fuera del módulo de configuración; revisar `.gitignore` para `.env`.
- CI: workflows sin `typecheck` o con `continue-on-error: true`; instalación con `npm install` en lugar de `npm ci`.
- Source maps: `sourcemap: true` (no `hidden`) en la configuración de build; `.map` en el directorio publicado.
