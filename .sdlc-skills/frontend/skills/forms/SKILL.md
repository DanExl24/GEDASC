---
name: forms
description: Diseña, construye y audita formularios en frontend (Vue/VeeValidate, React Hook Form/TanStack Form, Angular Reactive Forms). Cubre schemas de validación (Zod/Valibot) como fuente de verdad, momento de validación, ciclo de envío y prevención de doble submit, idempotencia, mapeo de errores del servidor (400/422) a campos, cambios sin guardar, listas dinámicas, wizards multi-paso, validación asíncrona, subida de archivos y semántica accesible. Úsala al crear o revisar cualquier formulario o flujo de captura de datos. No la uses para el cliente HTTP en sí (data-fetching) ni para el estilo visual de los inputs.
---

# Formularios

Un formulario bien hecho no deja enviar datos inválidos, no envía dos veces, explica cada error junto al campo que lo causa y no pierde lo que el usuario escribió.

## Cuándo usarla

- Crear un formulario nuevo (login, alta, edición, filtros complejos, checkout).
- Revisar formularios con validación manual dispersa, envíos duplicados o errores genéricos.
- Formularios multi-paso, con listas dinámicas de campos, subida de archivos o validación contra el servidor.

**No es para:** la petición HTTP, caché e invalidación tras guardar → `data-fetching` · tipos generales del proyecto → `typescript` · aspecto visual de inputs y botones → `design-system` · accesibilidad en profundidad → `accessibility` (esta skill cubre lo mínimo imprescindible de formularios).

## Paso 0: contexto (ambos modos)

1. Detecta en `package.json` la librería de formularios (VeeValidate, FormKit, React Hook Form, TanStack Form, Formik, Angular Forms) y de schemas (Zod, Valibot, Yup, ArkType).
2. Carga [vue.md](references/vue.md), [react.md](references/react.md) o [angular.md](references/angular.md).
3. Mira cómo devuelve el backend los errores de validación (formato del 400/422) para mapearlos a campos.
4. Si existe, reutiliza el schema del backend (monorepo, paquete compartido, OpenAPI) en lugar de duplicarlo.

## Modo Construir

1. **Schema primero.** Define el schema (Zod/Valibot) y deriva de él el tipo de los valores. Ver [patterns.md § Schema](references/patterns.md#schema-como-fuente-de-verdad).
2. **Usa la librería del proyecto**; si no hay ninguna y el formulario no es trivial, propón la estándar del stack (VeeValidate, React Hook Form, Reactive Forms).
3. **Estructura semántica:** `<form>` con `submit` (Enter funciona), `<label>` asociado a cada campo, `type`/`inputmode`/`autocomplete` correctos, errores vinculados con `aria-describedby`. Ver [patterns.md § Semántica](references/patterns.md#semántica-y-accesibilidad-mínima).
4. **Momento de validación:** al perder el foco la primera vez y en cada cambio a partir del primer error; todo al enviar. Ver [patterns.md § Cuándo validar](references/patterns.md#cuándo-validar).
5. **Ciclo de envío completo:** bloquear el doble envío, estado de carga visible, errores del servidor mapeados a campos, foco al primer error, reset o redirección tras el éxito. Ver [patterns.md § Envío](references/patterns.md#ciclo-de-envío).
6. **Protege el trabajo del usuario** en formularios largos: aviso de cambios sin guardar y, si procede, borrador.
7. Listas dinámicas, wizards, validación asíncrona o archivos según [patterns.md](references/patterns.md).
8. Entrega según [output-formats.md § Construir](../../standards/output-formats.md#modo-construir).

## Modo Auditar

1. Inventaria los formularios del alcance y la librería que usa cada uno.
2. Para cada formulario: ¿de dónde sale la validación?, ¿qué pasa con doble clic en enviar?, ¿qué ve el usuario ante un 422, un 500 o sin red?
3. Si puedes ejecutar la app, prueba el envío con doble clic, con la red lenta y con errores del servidor.
4. Recorre [checklist.md](references/checklist.md).
5. Clasifica con [severity.md](../../standards/severity.md) y entrega según [output-formats.md § Auditar](../../standards/output-formats.md#modo-auditar) con código `FE-FORM`.

## Principios

1. **El schema es la fuente de verdad** de validación y tipos. Nada de `if/else` de validación repartidos por el componente.
2. **La validación del cliente es para la UX; la del servidor es la que protege.** Siempre se valida en el backend; el frontend no sustituye esa validación, la adelanta.
3. **Un envío, una operación.** El botón se bloquea mientras hay un envío en curso, y las operaciones críticas (pagos, pedidos) llevan clave de idempotencia.
4. **Cada error junto a su campo**, con un mensaje que dice cómo arreglarlo ("Introduce un email con @", no "Campo inválido").
5. **No perder lo que el usuario escribió:** ni por un error del servidor, ni por navegar sin querer, ni por un re-render.
6. **Usa la plataforma:** `<form>`, `<label>`, `type="email"`, `autocomplete`, `inputmode`. Los gestores de contraseñas y el autocompletado del navegador deben funcionar.
7. **Claves estables en listas dinámicas**, nunca el índice.

## Referencias

| Archivo | Cuándo cargarlo |
| :--- | :--- |
| [patterns.md](references/patterns.md) | Modo Construir; en Auditar para escribir las correcciones. |
| [checklist.md](references/checklist.md) | Modo Auditar. |
| [vue.md](references/vue.md) · [react.md](references/react.md) · [angular.md](references/angular.md) | Según el stack. |

## Skills relacionadas

- `data-fetching`: la mutación HTTP, la normalización del error 422 en `AppError` y la invalidación de la caché tras guardar.
- `typescript`: schemas como fuente de tipos.
- `state-management`: estado de wizards que abarcan varias rutas y borradores persistidos.
- `accessibility`: verificación de etiquetas, errores asociados y anuncios con lector de pantalla.
- `design-system`: estados visuales de inputs (focus, error, disabled) en los componentes base.
- `ux-review`: orden, agrupación y longitud del formulario desde la experiencia del usuario.
- `testing`: tests de validación, envío, errores del servidor y doble envío.
- `security`: subida de archivos y por qué la validación del cliente no protege.
- `i18n`: mensajes de validación traducidos y formatos de entrada según el locale.
