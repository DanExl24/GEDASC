# Formularios — notas Vue

## VeeValidate + Zod

```vue
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { AccountSchema } from '../model/account.schema'

const { handleSubmit, defineField, errors, isSubmitting, setErrors, resetForm, meta } = useForm({
  validationSchema: toTypedSchema(AccountSchema),
  initialValues: { name: '', email: '' },
})

const [name, nameAttrs] = defineField('name', { validateOnModelUpdate: false })   // valida en blur la primera vez
const [email, emailAttrs] = defineField('email')

const onSubmit = handleSubmit(async (values) => {        // solo se ejecuta si el schema es válido
  try {
    await createAccount.mutateAsync(values)
    resetForm()
  } catch (e) {
    if (e instanceof AppError && e.fieldErrors) {
      setErrors(Object.fromEntries(Object.entries(e.fieldErrors).map(([k, v]) => [k, v[0]])))
    } else {
      formError.value = 'No se pudo guardar. Inténtalo de nuevo.'
    }
  }
})
</script>

<template>
  <form novalidate @submit="onSubmit">
    <label for="name">Nombre</label>
    <input id="name" v-model="name" v-bind="nameAttrs" autocomplete="name"
           :aria-invalid="!!errors.name" aria-describedby="name-error" />
    <p v-if="errors.name" id="name-error" role="alert">{{ errors.name }}</p>
    <!-- … -->
    <button type="submit" :disabled="isSubmitting">Guardar</button>
  </form>
</template>
```

- `isSubmitting` permanece en `true` mientras dura la promesa del handler (por eso usa `mutateAsync` y `await`, no `mutate`). Deshabilitar el botón de submit con `isSubmitting` bloquea también el envío con Enter, porque el navegador no hace envío implícito si el botón por defecto está deshabilitado.
- `meta.value.dirty` para el aviso de cambios sin guardar.
- Alternativas: **FormKit** (formularios con esquema y componentes incluidos), **TanStack Form** (Vue adapter).

## Listas dinámicas

```ts
const { fields, push, remove } = useFieldArray<Item>('items')
```

```vue
<div v-for="(field, idx) in fields" :key="field.key">   <!-- field.key, no idx -->
  <input v-model="field.value.name" :name="`items[${idx}].name`" />
  <button type="button" @click="remove(idx)">Quitar</button>
</div>
```

## Cambios sin guardar

```ts
onBeforeRouteLeave(() => {
  if (meta.value.dirty && !isSubmitting.value) {
    return window.confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')
  }
})

useEventListener(window, 'beforeunload', (e) => {   // VueUse; o add/remove manual
  if (meta.value.dirty) e.preventDefault()
})
```

## Detalles de `v-model`

- `v-model.trim` y `v-model.number` son cómodos, pero si usas un schema, haz las transformaciones en el schema para tener una sola fuente.
- `v-model.lazy` actualiza en `change` en vez de `input` (útil en campos con validación cara).
- Componentes de input propios: usa `defineModel()` y reenvía `attrs` (`id`, `aria-*`, `name`) al `<input>` real, no al wrapper.

## Formularios sin librería

Aceptable solo para formularios de 1–3 campos. Mínimo: `reactive` con los valores, validación con `Schema.safeParse(values)` en el submit, `isSubmitting` con guard al inicio del handler y mapeo de errores del servidor.
