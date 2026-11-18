# Checklist de auditoría — testing de frontend

Severidad orientativa entre corchetes ([severity.md](../../../standards/severity.md)). La severidad de un hueco de tests depende del riesgo del comportamiento que no protege.

## 1. Estrategia e infraestructura

- [ ] Hay tests automáticos de frontend y corren en CI bloqueando el merge. **[HIGH]** si no hay ninguno en una app con flujos críticos.
- [ ] Type-check y lint (incluido el de accesibilidad) en CI. **[MEDIUM]** (→ `typescript`, `accessibility`).
- [ ] El grueso de los tests son de componente/integración, no snapshots ni tests de implementación. **[MEDIUM]**
- [ ] La suite se ejecuta en un tiempo razonable (minutos, no decenas de minutos) y en paralelo. **[LOW–MEDIUM]**

## 2. Calidad de los tests

- [ ] Consultas por rol, etiqueta o texto; sin selectores por clase CSS ni estructura del DOM. **[MEDIUM]**
- [ ] Interacciones con `user-event`, esperadas con `await`. **[LOW–MEDIUM]**
- [ ] Los tests no comprueban estado interno, métodos privados ni props de hijos. **[MEDIUM]**
- [ ] Cada test tiene aserciones significativas sobre el resultado; sin tests vacíos ni `expect(true)`. **[HIGH]** si enmascaran comportamiento crítico sin cubrir.
- [ ] Sin snapshots enormes del DOM aceptados sin revisión. **[LOW–MEDIUM]**
- [ ] Un comportamiento por test, con nombres que lo describen. **[LOW]**

## 3. Red y dependencias

- [ ] La red se simula con MSW (o equivalente en la frontera), no mockeando axios/fetch ni las funciones de API. **[MEDIUM]**
- [ ] Peticiones no previstas hacen fallar el test (`onUnhandledRequest: 'error'`). **[LOW]**
- [ ] Los hijos reales se renderizan (sin shallow rendering generalizado). **[MEDIUM]**

## 4. Cobertura de comportamiento

- [ ] Formularios principales: validación, envío, errores del servidor por campo, doble envío. **[HIGH]** si un formulario crítico (pago, alta) no tiene tests.
- [ ] Vistas con datos: estados de carga, vacío, error (con reintento) y éxito. **[MEDIUM]**
- [ ] Permisos y guards: redirecciones, 403, elementos ocultos por rol. **[MEDIUM]**
- [ ] Cálculos y formateos que ve el usuario (importes, fechas, totales) con casos límite. **[MEDIUM–HIGH]**
- [ ] Componentes base con sus variantes y estados (Storybook o tests). **[LOW–MEDIUM]**
- [ ] Accesibilidad básica con axe en componentes clave. **[LOW–MEDIUM]**

## 5. Estabilidad

- [ ] Sin esperas fijas (`sleep`, `setTimeout` en tests). **[MEDIUM]**
- [ ] Estado aislado por test (QueryClient con `retry: false`, store, router, almacenamiento, handlers). **[MEDIUM]**
- [ ] Fecha, zona horaria y aleatorios controlados. **[MEDIUM]**
- [ ] Sin tests intermitentes conocidos ignorados o con reintentos automáticos que los ocultan. **[MEDIUM–HIGH]**

## 6. Regresión visual (si aplica)

- [ ] Componentes base y pantallas críticas con capturas de referencia. **[INFO–LOW]**
- [ ] Capturas estabilizadas (fuentes, animaciones, datos, viewport). **[LOW]**

## Cómo inspeccionar rápido

- Selectores frágiles: buscar `container.querySelector`, `.find('.`, `By.css(`, `wrapper.vm.`, `componentInstance.` en tests.
- Mocks de red: `vi.mock('axios')`, `jest.mock('axios')`, `vi.spyOn(global, 'fetch')`, mocks de módulos `api/`.
- Esperas: `sleep(`, `setTimeout(` y `new Promise((r) => setTimeout` en archivos de test.
- Snapshots: tamaño de los archivos `__snapshots__/`.
- Tests vacíos: `it(` / `test(` sin `expect`; `expect(true)`.
- Intermitencia: ejecutar la suite varias veces (`vitest --repeat 5` en sospechosos) y en orden aleatorio (`--sequence.shuffle`).
