# Patrones de formularios

## Schema como fuente de verdad

```ts
// features/accounts/model/account.schema.ts
import { z } from 'zod'   // Zod 4; Valibot o ArkType son equivalentes

export const AccountSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.email('Introduce un email válido, por ejemplo nombre@empresa.com'),
  phone: z.string().regex(/^\+?[0-9 ]{7,15}$/, 'Introduce un teléfono de 7 a 15 dígitos').optional(),
  password: z.string().min(12, 'Mínimo 12 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, { error: 'Debes aceptar los términos' }),
}).refine((v) => v.password === v.confirmPassword, {
  path: ['confirmPassword'],          // el error aparece en el campo correcto
  message: 'Las contraseñas no coinciden',
})

export type AccountForm = z.infer<typeof AccountSchema>
```

- Mensajes en el schema, escritos para el usuario final.
- Transformaciones (`trim`, conversión de números y fechas) en el schema, no en el componente.
- Muchas librerías aceptan cualquier validador compatible con **Standard Schema** (Zod, Valibot, ArkType), lo que facilita cambiar de validador.
- Si el backend expone su schema (monorepo, paquete compartido) o un contrato OpenAPI, deriva el schema del formulario de ahí y añade solo reglas de UX (confirmar contraseña, términos).

## Cuándo validar

| Momento | Comportamiento |
| :--- | :--- |
| Mientras escribe, antes de tocar el campo | No mostrar errores (no castigar al usuario por empezar a escribir). |
| Al salir del campo (`blur`) la primera vez | Validar y mostrar el error si lo hay. |
| Después de un error | Revalidar en cada cambio para que el error desaparezca en cuanto se corrige. |
| Al enviar | Validar todo, mostrar todos los errores y mover el foco al primer campo con error. |
| Validación asíncrona (¿el usuario ya existe?) | Con debounce (300–500 ms), cancelando la petición anterior, con indicador de "comprobando…". |

Las librerías lo configuran: React Hook Form `mode: 'onTouched'`; VeeValidate valida en blur y cambio por defecto; Angular `updateOn: 'blur'` por control si hace falta.

## Ciclo de envío

```ts
async function onSubmit(values: AccountForm) {
  // 1. la librería ya validó; si hay errores, no llega aquí
  // 2. isSubmitting = true (lo gestiona la librería) → botón deshabilitado + indicador
  try {
    await createAccount.mutateAsync(values)          // → data-fetching
    // 4. éxito: feedback + reset o redirección
    toast.success('Cuenta creada')
    router.push('/accounts')
  } catch (e) {
    // 3. error: mapear al formulario, NO perder los valores
    if (e instanceof AppError && e.code === 'VALIDATION' && e.fieldErrors) {
      for (const [field, messages] of Object.entries(e.fieldErrors)) {
        setFieldError(field, messages[0])
      }
      focusFirstError()
    } else {
      setFormError(e instanceof AppError && e.code === 'NETWORK'
        ? 'No hay conexión. Tus datos siguen aquí; inténtalo de nuevo.'
        : 'No se pudo guardar. Inténtalo de nuevo en unos segundos.')
    }
  }
}
```

### Prevenir el doble envío

- Deshabilitar el botón **y** ignorar envíos mientras `isSubmitting` es verdadero (Enter en un input también envía).
- El estado de carga no debe cambiar el tamaño del botón (spinner dentro del ancho existente).
- Para operaciones críticas (pagos, pedidos, transferencias), además: **clave de idempotencia** generada al montar el formulario y enviada en la cabecera `Idempotency-Key`; el backend descarta duplicados aunque lleguen dos peticiones.
  ```ts
  const idempotencyKey = crypto.randomUUID()   // una por intento lógico de envío, no por clic
  ```
- No reintentar automáticamente un POST fallido (→ `data-fetching`).

### Errores del servidor

- 400/422 con errores por campo → `setFieldError` en cada campo.
- Errores no asociables a un campo (regla de negocio, conflicto 409) → mensaje en la parte superior del formulario, con `role="alert"`.
- 500 o red → mensaje genérico con reintento; los valores se mantienen.
- Nunca un `alert()` ni un toast genérico como único feedback de un error de validación.

### Tras el éxito

- Formularios de creación que se quedan en la página: `reset()` a los valores iniciales.
- Formularios de edición: `reset(nuevosValores)` para que el estado "sucio" vuelva a cero.
- Invalidar la caché afectada (→ `data-fetching`).

## Cambios sin guardar

- Marca el formulario como sucio (`isDirty`) y avisa antes de salir:
  - Navegación interna: guard del router (`onBeforeRouteLeave`, `useBlocker`, `CanDeactivate`).
  - Cierre o recarga de la pestaña: `beforeunload` (solo mientras `isDirty`, y retirando el listener después).
- Formularios largos (> ~10 campos o con texto libre extenso): borrador en `localStorage`/IndexedDB con debounce, recuperable, borrado al enviar con éxito. No guardes datos sensibles en el borrador.

## Listas dinámicas (field arrays)

```text
❌ key = index   → al borrar la fila 2, la fila 3 hereda su estado (valores, errores, foco)
✅ key = id estable generado al añadir la fila (las librerías lo proporcionan: field.id, field.key)
```

- Validación de la lista completa en el schema (`z.array(ItemSchema).min(1, 'Añade al menos un elemento')`).
- Al añadir una fila, mueve el foco a su primer campo; al borrarla, a un elemento razonable (fila anterior o botón de añadir).

## Wizards (multi-paso)

- Un schema por paso; el schema completo es la unión de todos.
- Valida el paso actual antes de avanzar; permite volver atrás sin perder datos.
- Estado del wizard: en una sola instancia del formulario si todo está en una ruta; en un store o en la URL si cada paso es una ruta distinta (→ `state-management`).
- Indicador de progreso ("Paso 2 de 4") y resumen antes de confirmar.
- Envío final único; no crees registros a medias en cada paso salvo que el backend esté diseñado para borradores.

## Validación asíncrona

```ts
// la comprobación de disponibilidad: debounce + cancelación + no bloquear el resto del formulario
email: z.email().refine(async (email) => !(await api.emailExists(email)), 'Este email ya está registrado')
```

- Limítala a los campos que la necesitan; no revalides en servidor en cada pulsación de todo el formulario.
- El backend vuelve a comprobarlo al enviar (condición de carrera entre comprobar y enviar).

## Subida de archivos

- Validación en cliente de tipo (`accept` + comprobación del MIME) y tamaño **antes** de subir; el servidor vuelve a validar.
- Progreso de subida y opción de cancelar (`AbortController`).
- Archivos grandes: subida directa a almacenamiento con URL firmada, o por partes.
- Vista previa con `URL.createObjectURL` y `URL.revokeObjectURL` al terminar (si no, fuga de memoria).

## Semántica y accesibilidad mínima

```html
<form novalidate @submit.prevent="onSubmit">          <!-- novalidate: la validación la gestiona la app -->
  <label for="email">Email</label>
  <input
    id="email" name="email" type="email" autocomplete="email" inputmode="email"
    aria-invalid="true" aria-describedby="email-error"
  />
  <p id="email-error" role="alert">Introduce un email válido, por ejemplo nombre@empresa.com</p>

  <fieldset>
    <legend>Método de contacto</legend>
    <!-- radios agrupados -->
  </fieldset>

  <button type="submit" :disabled="isSubmitting">Crear cuenta</button>
</form>
```

- `<label>` visible para cada campo; el placeholder no sustituye a la etiqueta.
- `autocomplete` correcto (`email`, `name`, `tel`, `street-address`, `current-password`, `new-password`, `one-time-code`…).
- `type` e `inputmode` adecuados para el teclado móvil (`tel`, `email`, `numeric`, `decimal`).
- No bloquees pegar en campos de contraseña o email.
- Marca los campos obligatorios en el texto o con un indicador explicado, no solo con color.
- Al enviar con errores, foco al primer campo inválido.

## Números, fechas y moneda

- Los inputs devuelven strings: conviértelos en el schema (`z.coerce.number()` o transformaciones explícitas) y maneja la cadena vacía.
- Formatos locales (`1.234,56` vs `1,234.56`): parsea según el locale del usuario; envía al backend en formato canónico (número, ISO 8601).
- Dinero: no uses `float` para cálculos; envía céntimos (enteros) o strings decimales según el contrato.

## Anti-patrones

| Anti-patrón | Consecuencia | Corrección |
| :--- | :--- | :--- |
| Validación con `if/else` dispersos | Reglas inconsistentes y difíciles de mantener | Schema declarativo |
| Botón de enviar siempre activo durante el envío | Registros o cobros duplicados | Bloqueo por `isSubmitting` + idempotencia |
| Errores del servidor en un `alert` o toast genérico | El usuario no sabe qué campo corregir | Mapear a campos |
| Reset de valores al fallar el envío | El usuario pierde lo escrito | Mantener los valores |
| `key` = índice en listas dinámicas | Valores y errores en la fila equivocada | Id estable |
| Errores mostrados mientras se escribe por primera vez | Formulario hostil | Validar en blur, revalidar en cambio |
| Placeholder como única etiqueta | Inaccesible, desaparece al escribir | `<label>` visible |
| Sin aviso de cambios sin guardar en formularios largos | Pérdida de trabajo | Guard del router + `beforeunload` |
| Validación solo en cliente | Datos inválidos llegan a la BD desde otros clientes | Validar también en backend |
