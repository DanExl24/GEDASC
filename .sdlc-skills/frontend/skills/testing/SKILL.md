---
name: testing
description: Escribe y audita tests de frontend (Vue, React, Angular) con Vitest/Jest, Testing Library, MSW, Storybook y Playwright. Cubre qué probar en cada nivel (lógica, componentes, integración, regresión visual), consultas por rol accesible, user-event, mock de red con MSW en lugar de mockear el cliente HTTP, tests de formularios, stores, hooks/composables y guards, tests asíncronos sin esperas fijas, causas de tests intermitentes, datos de prueba y cobertura útil. Úsala al añadir tests a componentes o features, al revisar una suite frágil o lenta, o al definir la estrategia de testing del frontend. No la uses para suites E2E completas, contratos y carga (dominio QA) ni para pruebas de accesibilidad en detalle (accessibility).
---

# Testing de frontend

Un buen test de frontend **prueba lo que hace el usuario y lo que ve**, no cómo está implementado el componente por dentro. Si se refactoriza el componente sin cambiar su comportamiento, los tests deben seguir pasando; si se rompe el comportamiento, deben fallar.

## Cuándo usarla

- Añadir tests a un componente, formulario, store, hook/composable o feature.
- Definir la estrategia de testing del frontend (qué probar, con qué herramienta, en qué nivel).
- Suites frágiles que se rompen con cada refactor, tests intermitentes, tests lentos.
- Montar MSW, Storybook con tests o regresión visual.

**No es para:** suites E2E de flujos completos, contratos con el backend, pruebas de carga o DAST → dominio QA (`domains/05_qa_testing_engineering/`) · auditoría de accesibilidad → `accessibility` (esta skill integra axe en los tests).

## Paso 0: contexto (ambos modos)

1. Detecta el runner (Vitest, Jest, Karma/Jasmine, runner del Angular CLI), Testing Library, MSW, Storybook, Playwright/Cypress y la configuración (`vitest.config`, `setupTests`, entorno `jsdom`/`happy-dom`/navegador). Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
2. Ejecuta la suite si es posible y anota: cuántos tests, cuánto tardan, cuáles fallan o son intermitentes.
3. Mira cómo se resuelven hoy las dependencias en tests (mocks del cliente HTTP, stores reales o mockeados, router).

## Modo Construir

1. **Elige el nivel** con la [tabla de niveles](references/patterns.md#qué-probar-en-cada-nivel): lógica pura → unitario; componente o feature → test de componente con Testing Library; flujo crítico completo → E2E (QA).
2. **Prueba comportamiento:** renderiza, interactúa como el usuario (`user-event`), comprueba lo que ve (consultas por rol y texto).
3. **Red con MSW**, no mocks del cliente HTTP: los handlers se reutilizan en tests, Storybook y desarrollo.
4. **Cubre los estados:** carga, vacío, error, éxito; y los casos límite del dominio (valores frontera, permisos).
5. **Formularios:** validación, envío, errores del servidor por campo, doble envío. **Stores y hooks:** a través de su API pública.
6. **Aislamiento:** cada test crea su estado (QueryClient, store, router) y lo limpia; sin dependencia del orden.
7. Ejecuta la suite y entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Ejecuta la suite y mide tiempos e intermitencias (repetir con `--repeat`/`--retry=0` los sospechosos).
2. Muestrea tests de cada tipo y busca acoplamiento a la implementación, mocks excesivos, esperas fijas, snapshots gigantes, tests sin aserciones reales.
3. Identifica qué comportamiento crítico no tiene tests (formularios principales, permisos, cálculos mostrados).
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-TEST`.

## Principios

1. **Cuanto más se parece el test a cómo se usa la app, más confianza da.**
2. **Consulta como un usuario:** por rol y nombre accesible, por etiqueta, por texto. `data-testid` como último recurso; clases CSS e IDs internos, nunca.
3. **Mockea en la frontera de red (MSW)**, no los módulos internos.
4. **Sin esperas fijas:** se espera a una condición (`findBy…`, `waitFor`, aserciones con reintento).
5. **Cada test es independiente** y deja el entorno como lo encontró.
6. **Un test que nunca puede fallar no sirve:** cada test tiene aserciones sobre el resultado, y se ha visto fallar al romper el código.
7. **La cobertura es un indicador, no un objetivo:** importa qué comportamiento está protegido, no el porcentaje.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Siempre en modo Construir; en Auditar para las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `accessibility`: axe en tests de componentes y consultas por rol (si no se puede consultar por rol, probablemente hay un problema de accesibilidad).
- `forms`, `data-fetching`, `state-management`, `routing`: qué comportamientos de cada capa merecen test.
- `design-system`: historias de Storybook por variante y estado, base para la regresión visual.
- `performance`: presupuestos de rendimiento en CI junto a los tests.
- `tooling`: ejecución de la suite en CI, caché y paralelización.
