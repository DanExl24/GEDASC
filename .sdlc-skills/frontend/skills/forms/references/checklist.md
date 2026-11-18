# Checklist de auditoría — formularios

Severidad orientativa entre corchetes; ajústala según impacto real ([severity.md](../../../standards/severity.md)).

## 1. Validación

- [ ] Cada formulario valida con un schema declarativo (Zod, Valibot, Yup…) o con los validadores de la librería, no con `if/else` dispersos. **[MEDIUM]**
- [ ] El tipo de los valores se deriva del schema (no hay tipo y schema escritos por separado). **[LOW]**
- [ ] Los mensajes de error son específicos y dicen cómo corregir. **[LOW–MEDIUM]**
- [ ] Las validaciones cruzadas (confirmar contraseña, rango de fechas) muestran el error en el campo correcto. **[LOW]**
- [ ] El momento de validación no castiga al usuario (sin errores mientras escribe por primera vez). **[LOW]**
- [ ] La validación asíncrona tiene debounce y cancela la petición anterior. **[MEDIUM]**
- [ ] Existe validación equivalente en el backend (si se puede comprobar). **[HIGH]** si solo se valida en cliente datos que afectan a negocio → escalar a backend.

## 2. Envío

- [ ] El envío no se puede disparar dos veces (botón bloqueado **y** guard por `isSubmitting`, incluido Enter). **[HIGH]**; **[CRITICAL]** si crea cobros, pedidos o registros duplicados.
- [ ] Las operaciones críticas usan clave de idempotencia. **[HIGH]** en pagos y pedidos.
- [ ] Hay indicador de carga durante el envío sin deformar el botón. **[LOW]**
- [ ] Tras el éxito se resetea el formulario o se redirige, y se invalida la caché afectada. **[MEDIUM]**
- [ ] Los POST fallidos no se reintentan automáticamente. **[HIGH]** si pueden duplicar operaciones.

## 3. Errores del servidor

- [ ] Los errores 400/422 por campo se muestran junto a cada campo. **[MEDIUM]**
- [ ] Los errores generales (409, reglas de negocio, 500, red) se muestran en el formulario con opción de reintentar. **[MEDIUM]**
- [ ] Los valores introducidos se conservan cuando el envío falla. **[HIGH]**
- [ ] Los errores no se tragan (`catch` vacío o solo `console.log`). **[HIGH]** si el usuario cree que se guardó.
- [ ] Tras un envío con errores, el foco va al primer campo inválido. **[LOW–MEDIUM]**

## 4. Estructura y semántica

- [ ] Se usa `<form>` con evento `submit` (Enter funciona) y botón `type="submit"`. **[LOW–MEDIUM]**
- [ ] Cada campo tiene un `<label>` visible y asociado (`for`/`id` o envolvente). **[MEDIUM]**
- [ ] Los errores están vinculados al campo (`aria-describedby`, `aria-invalid`). **[MEDIUM]**
- [ ] Grupos de radios/checkboxes en `<fieldset>` con `<legend>`. **[LOW]**
- [ ] `type`, `inputmode` y `autocomplete` son correctos. **[LOW]**; **[MEDIUM]** si rompen gestores de contraseñas o el autocompletado en login/checkout.
- [ ] No se bloquea pegar en contraseñas ni emails. **[LOW–MEDIUM]**

## 5. Formularios complejos

- [ ] Las listas dinámicas usan claves estables, no el índice. **[MEDIUM]**
- [ ] Los wizards validan cada paso, permiten volver sin perder datos y hacen un único envío final. **[MEDIUM]**
- [ ] Los formularios largos avisan de cambios sin guardar (router + `beforeunload`). **[MEDIUM]**
- [ ] Los borradores persistidos no guardan datos sensibles y se borran tras el envío. **[MEDIUM]**
- [ ] Las subidas de archivos validan tipo y tamaño antes de subir, muestran progreso y se pueden cancelar. **[MEDIUM]**
- [ ] Las vistas previas liberan los object URLs (`revokeObjectURL`). **[LOW]**
- [ ] Números, fechas y moneda se parsean según el locale y se envían en formato canónico. **[MEDIUM]**; **[HIGH]** si hay importes mal interpretados.

## Cómo inspeccionar rápido

- Validación manual: buscar `if (!` seguido de asignaciones de error dentro de handlers de submit.
- Doble envío: localizar el botón de submit y comprobar si se deshabilita con el estado de envío y si el handler comprueba ese estado.
- Errores 422: buscar `422`, `fieldErrors`, `setError`, `setFieldError`, `setErrors`; su ausencia junto a llamadas de creación/edición es sospechosa.
- Claves por índice: `:key="index"`, `key={index}`, `key={i}`, `track $index`.
- Etiquetas: inputs sin `<label>` asociado o con solo `placeholder`.
- Prueba manual (si se puede ejecutar la app): DevTools → Network → "Slow 3G" y doble clic en enviar.
