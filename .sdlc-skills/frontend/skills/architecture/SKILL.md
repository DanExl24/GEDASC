---
name: architecture
description: Diseña, estructura y audita la arquitectura de aplicaciones frontend (Vue, React, Angular). Cubre organización de carpetas por features, límites y dependencias entre módulos, API pública de cada feature, dependencias circulares, monorepos, decisiones de stack y ADRs. Úsala al arrancar un proyecto frontend, reorganizar carpetas caóticas, definir reglas de importación o revisar si la estructura escala. No la uses para la capa HTTP (data-fetching), el tipado (typescript) ni el estado (state-management).
---

# Arquitectura frontend

Define y protege la forma del código: dónde vive cada cosa, quién puede importar a quién y cómo crece el proyecto sin convertirse en una carpeta `components/` con 200 archivos.

## Cuándo usarla

- Arrancar un proyecto o un módulo grande y decidir la estructura.
- La estructura actual es plana por tipo de archivo (`components/`, `views/`, `utils/` gigantes) y cuesta encontrar o cambiar cosas.
- Hay dependencias circulares, features que se importan entre sí o "utils" que lo importan todo.
- Hay que decidir monorepo vs repo único, o cómo partir una app grande.
- Hay que documentar una decisión de arquitectura (ADR).

**No es para:** cliente HTTP y caché → `data-fetching` · tipos y contratos → `typescript` · stores y reactividad → `state-management` · formularios → `forms`.

## Paso 0: contexto (ambos modos)

1. Lee `package.json` para detectar framework, versión, meta-framework (Next, Nuxt, Angular CLI, Vite) y herramientas (Nx, Turborepo, pnpm workspaces).
2. Carga la referencia del stack: [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md). Para otros stacks (Svelte, Solid…) aplica los principios de [patterns.md](references/patterns.md).
3. Recorre el árbol de `src/` (dos o tres niveles) y localiza las convenciones existentes antes de proponer otras.

## Modo Construir

Cuando el usuario pide crear una estructura, reorganizar carpetas o definir reglas.

1. **Entiende el dominio.** Identifica las capacidades de negocio (auth, catálogo, checkout, facturación…). Las features salen del dominio, no de los tipos de archivo.
2. **Elige el patrón** según el tamaño (ver [patterns.md § Elegir estructura](references/patterns.md#elegir-estructura)): por features para la mayoría; capas FSD solo si el equipo es grande y la app tiene muchas features que se cruzan.
3. **Define las reglas de dependencia** (dirección permitida entre capas y features) y **hazlas cumplir con herramienta** (eslint-plugin-boundaries, `import/no-restricted-paths`, dependency-cruiser o Nx). Una regla que solo está en un documento no se cumple.
4. **Define la API pública** de cada feature: qué exporta hacia fuera y qué es interno.
5. **Migra de forma incremental** si ya hay código: una feature por vez, con alias de rutas, sin dejar el proyecto roto entre pasos. Propón el orden de migración.
6. **Documenta** con un ADR corto ([plantilla](references/patterns.md#plantilla-adr)) las decisiones que no son obvias.
7. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

Cuando el usuario pide revisar o diagnosticar la estructura existente.

1. Delimita el alcance (app completa o un módulo).
2. Construye el mapa: features detectadas, capas, carpetas compartidas, tamaño aproximado de cada una.
3. Busca dependencias problemáticas: ciclos (`npx madge --circular src` o dependency-cruiser si están disponibles; si no, inspección de imports), features que importan internos de otras, `shared/` que importa de features.
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-ARCH`.
6. Si propones una reestructuración, incluye el **árbol objetivo** y el **plan de migración por pasos**.

## Principios

1. **Organiza por dominio, no por tipo de archivo.** Lo que cambia junto vive junto.
2. **Las dependencias fluyen en una sola dirección:** `app → features → shared`. `shared` nunca importa de una feature; una feature no importa los internos de otra.
3. **Cada feature tiene una API pública explícita.** Lo que no se exporta es privado y se puede cambiar sin miedo.
4. **`shared/` es para lo verdaderamente genérico.** Si solo lo usa una feature, vive en esa feature. Se promueve a `shared` cuando lo necesita una segunda.
5. **Las reglas se automatizan.** Lint de límites en CI, no en la memoria del equipo.
6. **La estructura sigue al tamaño.** No montes FSD, monorepo ni micro-frontends para una app de 15 pantallas.
7. **Las vistas o páginas componen; no contienen lógica de negocio ni llamadas HTTP directas.**

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para proponer la estructura objetivo. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack detectado. |

## Skills relacionadas

- `typescript`: alias de rutas, tipos compartidos entre features y con el backend.
- `data-fetching`: dónde viven los servicios de API dentro de cada feature.
- `state-management`: qué stores son de una feature y cuáles son globales.
- `routing`: rutas por feature, lazy loading y layouts.
- `rendering-and-seo`: decidir entre SPA y meta-framework (Next, Nuxt, Angular SSR) según el tipo de páginas.
- `tooling`: lint de límites en CI, monorepo y scripts estándar.
