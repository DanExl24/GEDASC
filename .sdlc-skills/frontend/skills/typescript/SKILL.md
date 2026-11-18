---
name: typescript
description: Configura, escribe y audita TypeScript en proyectos frontend (Vue, React, Angular). Cubre tsconfig estricto, eliminación de any, tipado de contratos de API (DTOs, generación desde OpenAPI, validación en runtime con Zod/Valibot), uniones discriminadas, type guards, genéricos, tipado de props/eventos y tipos compartidos con el backend. Úsala al endurecer el tipado, tipar una API, migrar JS a TS o revisar la calidad de los tipos. No la uses para la estructura de carpetas (architecture) ni para la lógica del cliente HTTP (data-fetching).
---

# TypeScript en frontend

El objetivo no es "que compile", sino que **el compilador detecte los errores antes que el usuario**: contratos de API fiables, estados imposibles irrepresentables y cero agujeros (`any`) por donde se cuelan los bugs.

## Cuándo usarla

- Endurecer un proyecto con tipado laxo (`strict: false`, `any` por todas partes).
- Tipar la comunicación con el backend (DTOs, respuestas, errores).
- Diseñar tipos para un modelo de dominio o un componente genérico.
- Migrar un proyecto JavaScript a TypeScript.
- Revisar la calidad del tipado en una PR o módulo.

**No es para:** dónde viven los tipos dentro del proyecto → `architecture` · cómo se hacen las peticiones → `data-fetching` · schemas de formularios → `forms` (comparte técnicas con esta skill).

## Paso 0: contexto (ambos modos)

1. Lee `tsconfig*.json` (y los `extends`) y anota el nivel de estrictez real.
2. Detecta el stack en `package.json` y carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
3. Mide la situación: número de `any` explícitos, `@ts-ignore`/`@ts-expect-error`, `as unknown as`, y si el type-check corre en CI (`tsc --noEmit`, `vue-tsc`, `ng build`).

## Modo Construir

1. **Configuración.** Parte de la base estricta de [patterns.md § tsconfig](references/patterns.md#tsconfig-recomendado). En un proyecto existente, activa las flags de una en una y corrige por módulos; no actives todo de golpe con 2.000 errores.
2. **Contratos de API.** Elige la fuente de verdad en este orden de preferencia:
   1. Tipos generados desde el contrato del backend (OpenAPI → `openapi-typescript`/`orval`; tRPC; GraphQL codegen).
   2. Schemas de runtime (Zod, Valibot) de los que se **infieren** los tipos.
   3. Interfaces escritas a mano (solo si no hay otra opción, y documentando de dónde salen).
3. **Valida en la frontera.** Los datos externos (API, `localStorage`, query params, `postMessage`) entran como `unknown` y se validan antes de usarse. Ver [patterns.md § Validación en runtime](references/patterns.md#validación-en-runtime).
4. **Modela estados con uniones discriminadas** en vez de varios booleanos (`isLoading`, `isError`, `data?`).
5. **Tipa los componentes** (props, eventos, slots/children) según la referencia del stack.
6. Ejecuta el type-check y entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Delimita el alcance y ejecuta el type-check si es posible para conocer el punto de partida.
2. Inventaria los agujeros: `any`, `as` forzados, `!` (non-null assertion), `@ts-ignore`, `Function`, `object`, `{}`.
3. Revisa la frontera con el backend: ¿los tipos de las respuestas vienen de una fuente fiable o son suposiciones?
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-TS`.

## Principios

1. **`strict: true` no es negociable** en código nuevo.
2. **`unknown` en vez de `any`.** `any` desactiva el compilador; `unknown` obliga a comprobar.
3. **Los datos externos no son del tipo que dices hasta que los validas.** Un `as User` sobre una respuesta HTTP es una mentira al compilador.
4. **Una sola fuente de verdad por contrato.** Si el tipo se puede generar o inferir, no se escribe a mano por duplicado.
5. **Haz irrepresentables los estados imposibles** (uniones discriminadas, tipos literales, `never` en el `default` del `switch`).
6. **Deja que TypeScript infiera** lo local; anota explícitamente las fronteras (parámetros públicos, retornos de funciones exportadas, props).
7. **Cada `as`, `!` o `@ts-expect-error` necesita una razón.** Si no puedes justificarlo en un comentario, es un bug latente.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `data-fetching`: dónde se aplica la validación de respuestas dentro del cliente HTTP.
- `forms`: schemas de formulario como fuente de tipos.
- `architecture`: ubicación de tipos compartidos y alias de rutas.
- `tooling`: type-check bloqueante en CI y reglas de ESLint con información de tipos.
