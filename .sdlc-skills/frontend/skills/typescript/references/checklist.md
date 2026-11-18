# Checklist de auditoría — TypeScript

Severidad orientativa entre corchetes; ajústala según impacto real ([severity.md](../../../standards/severity.md)).

## 1. Configuración

- [ ] `strict: true` activo (o todas sus sub-flags). **[MEDIUM]** si está desactivado en código de producción.
- [ ] `noUncheckedIndexedAccess` activo. **[INFO–LOW]**
- [ ] `isolatedModules` / `verbatimModuleSyntax` coherentes con el bundler (Vite, esbuild, SWC).
- [ ] El type-check corre en CI y bloquea el merge (`tsc --noEmit`, `vue-tsc --noEmit`, `ng build`). **[MEDIUM]** si no corre: los errores de tipos llegan a producción.
- [ ] No hay `skipLibCheck: false` con errores ignorados, ni `exclude` que deje fuera carpetas de código real.

## 2. Agujeros de tipado

- [ ] Sin `any` explícito en código de aplicación. **[MEDIUM]** en contratos de API, stores o props; **[LOW]** en variables locales.
- [ ] Sin `any` implícito (parámetros sin tipo, `JSON.parse` usado directamente).
- [ ] `as` solo con justificación; ningún `as unknown as X`. **[MEDIUM]**
- [ ] Non-null assertions (`!`) solo donde el invariante está garantizado y comentado. **[LOW–MEDIUM]**
- [ ] `@ts-ignore` reemplazado por `@ts-expect-error` con comentario del motivo. **[LOW]**
- [ ] Sin `Function`, `Object`, `object` o `{}` como tipos. **[LOW]**

## 3. Frontera con el backend

- [ ] Los tipos de request/response provienen de una fuente fiable (OpenAPI generado, tRPC, schema compartido) o están documentados. **[MEDIUM]** si son suposiciones escritas a mano sin origen.
- [ ] Las respuestas críticas se validan en runtime en la capa API. **[MEDIUM]**; **[HIGH]** si datos mal formados ya han causado errores en producción.
- [ ] Las respuestas HTTP no se castean con `as` directamente en componentes. **[MEDIUM]**
- [ ] Fechas, decimales e IDs tienen un tipo coherente (no mezcla de `string`/`Date`/`number` según el archivo).
- [ ] Los errores de API tienen un tipo (`AppError` o similar), no `any` en `catch`.

## 4. Modelado

- [ ] Los estados asíncronos usan uniones discriminadas o el tipo de la librería (TanStack Query), no combinaciones de booleanos. **[LOW–MEDIUM]**
- [ ] Los `switch` sobre uniones son exhaustivos (`never` en `default`).
- [ ] Los literales y enums de dominio están tipados (`'admin' | 'editor'`) en vez de `string`.
- [ ] No hay tipos duplicados para el mismo concepto en varios archivos con diferencias sutiles. **[MEDIUM]**
- [ ] Datos externos (`localStorage`, query params, `postMessage`, `window` globals) se tratan como `unknown`.

## 5. Componentes

- [ ] Props, eventos y slots/children tipados (ver referencia del stack). **[MEDIUM]** si los componentes compartidos aceptan `any`.
- [ ] Componentes genéricos (tablas, selects) usan genéricos en lugar de `any`.
- [ ] Los handlers de eventos usan los tipos de evento del DOM/framework, no `any`.

## Cómo inspeccionar rápido

- Contar agujeros: buscar `: any`, `as any`, `<any>`, `as unknown as`, `@ts-ignore`, `@ts-expect-error`, `!.`/`!)` en `src/`.
- Ejecutar el type-check y contar errores: `npx tsc --noEmit -p tsconfig.app.json` (o `vue-tsc`/`ng build`).
- Buscar casts sobre respuestas: `as ` cerca de `.data`, `await res.json()` o `response`.
