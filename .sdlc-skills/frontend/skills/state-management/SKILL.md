---
name: state-management
description: Diseña, implementa y audita el estado de cliente y la reactividad en frontend (Vue/Pinia, React/Zustand/Redux Toolkit/Context, Angular/Signals/NgRx). Cubre clasificación del estado (local, global, servidor, URL, formulario), diseño de stores, estado derivado, inmutabilidad, persistencia, fugas de memoria por falta de cleanup, pérdida de reactividad, re-renders y bucles infinitos, y estado en SSR. Úsala al decidir dónde vive un dato, crear o revisar stores, o ante pestañas que consumen cada vez más memoria, componentes que no se actualizan o renders en bucle. No la uses para datos que vienen del servidor (data-fetching) ni para el estado de un formulario (forms).
---

# Estado y reactividad

La mayoría de los problemas de estado no vienen de elegir mal la librería, sino de **guardar el dato en el sitio equivocado**: datos del servidor copiados en un store, estado de un modal en el store global, valores derivados guardados en lugar de calculados.

## Cuándo usarla

- Decidir dónde debe vivir un dato o si hace falta un store.
- Crear, revisar o simplificar stores (Pinia, Zustand, Redux Toolkit, NgRx, servicios con signals).
- Síntomas: la memoria de la pestaña crece al navegar, componentes que no se actualizan, renders en bucle, toda la app se re-renderiza al teclear, estado que "se pierde" o que aparece de otra sesión.
- Persistir estado entre recargas.

**No es para:** datos del backend (caché, invalidación) → `data-fetching` · valores y validación de formularios → `forms` · estructura de carpetas de stores → `architecture`.

## Paso 0: contexto (ambos modos)

1. Detecta en `package.json` el framework y la librería de estado; carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Lista los stores existentes y qué contiene cada uno.
3. Comprueba si hay una librería de server state; si no la hay, gran parte del estado global probablemente sea caché de API (→ `data-fetching`).

## Modo Construir

1. **Clasifica cada dato** con la [tabla de tipos de estado](references/patterns.md#clasificar-el-estado). Solo lo que es estado de cliente compartido va a un store global.
2. **Empieza por lo local** y sube el estado solo cuando haga falta compartirlo (al ancestro común, a un provide/context, o a un store).
3. **Diseña el store mínimo:** estado fuente + derivados calculados + acciones con nombre de intención (`addItem`, no `setItems`).
4. **Cleanup obligatorio** para todo listener, timer, suscripción o conexión que se cree en un componente o store.
5. **Persistencia** solo de lo necesario, con versión y migración (ver [patterns.md § Persistencia](references/patterns.md#persistencia)).
6. En SSR, estado **por petición** (nunca singletons de módulo con datos de usuario).
7. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Inventaria el estado: stores globales, contextos/providers, servicios con estado, variables de módulo.
2. Clasifica cada pieza: ¿es servidor, URL, formulario, UI local o cliente compartido? Marca lo que está en el sitio equivocado.
3. Busca fugas: listeners, `setInterval`, `setTimeout` recurrentes, sockets, observables, `ResizeObserver`/`IntersectionObserver` sin cleanup.
4. Busca problemas de reactividad y renders según la referencia del stack.
5. Recorre [checklist.md](references/checklist.md).
6. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-STATE`.

## Principios

1. **Cada dato tiene un dueño y un solo lugar.** Duplicar estado es garantizar que se desincronice.
2. **El estado del servidor no va en stores de cliente** (→ `data-fetching`). **El estado compartible por enlace va en la URL** (filtros, pestaña activa, página).
3. **Lo derivado se calcula, no se guarda.** `total` es un `computed`/selector, no un campo que hay que acordarse de actualizar.
4. **Local por defecto, global por necesidad.** El estado de un modal, un input o un hover no va al store global.
5. **Las mutaciones tienen nombre e intención** y pasan por acciones; nadie modifica el store desde cualquier componente.
6. **Todo lo que se suscribe, se desuscribe.** Si un componente o store crea un recurso, también lo libera.
7. **No sincronices estado con efectos** (`watch`/`useEffect`/`effect` que copian un valor en otro). Casi siempre es un derivado mal modelado.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `data-fetching`: a dónde se mueve el estado de servidor que se saque de los stores.
- `forms`: estado de formularios y borradores.
- `typescript`: uniones discriminadas para modelar estados.
- `architecture`: stores por feature vs globales.
- `routing`: cómo llevar a la URL los filtros, la paginación y las pestañas, con validación.
- `rendering-and-seo`: estado por petición e hidratación en SSR.
