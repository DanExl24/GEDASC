# Formularios — notas React

## React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function AccountForm() {
  const {
    register, handleSubmit, setError, setFocus, reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AccountForm>({
    resolver: zodResolver(AccountSchema),
    mode: 'onTouched',                       // valida en blur, y en cada cambio tras el primer error
    defaultValues: { name: '', email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAccount.mutateAsync(values)
      reset()
    } catch (e) {
      if (e instanceof AppError && e.fieldErrors) {
        const entries = Object.entries(e.fieldErrors)
        entries.forEach(([field, msgs]) => setError(field as keyof AccountForm, { message: msgs[0] }))
        if (entries[0]) setFocus(entries[0][0] as keyof AccountForm)
      } else {
        setError('root.server', { message: 'No se pudo guardar. Inténtalo de nuevo.' })
      }
    }
  })

  return (
    <form noValidate onSubmit={onSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="email" {...register('email')}
             aria-invalid={!!errors.email} aria-describedby="email-error" />
      {errors.email && <p id="email-error" role="alert">{errors.email.message}</p>}

      {errors.root?.server && <p role="alert">{errors.root.server.message}</p>}
      <button type="submit" disabled={isSubmitting}>Crear cuenta</button>
    </form>
  )
}
```

- `handleSubmit` con una función asíncrona mantiene `isSubmitting` mientras dura la promesa; si el handler no devuelve la promesa (por ejemplo, `mutate` en lugar de `mutateAsync`), `isSubmitting` vuelve a `false` de inmediato y el doble envío es posible.
- `register` para inputs nativos; `Controller` para componentes controlados de librerías UI.
- `setFocus` y `shouldFocusError: true` (por defecto) para enfocar el primer error.

## Listas dinámicas

```tsx
const { fields, append, remove } = useFieldArray({ control, name: 'items' })

{fields.map((field, index) => (
  <div key={field.id}>   {/* field.id, nunca index */}
    <input {...register(`items.${index}.name`)} />
    <button type="button" onClick={() => remove(index)}>Quitar</button>
  </div>
))}
```

## Cambios sin guardar

- React Router: `useBlocker(isDirty && !isSubmitting)` y mostrar un diálogo de confirmación.
- `beforeunload` en un `useEffect` que dependa de `isDirty`, con cleanup.
- Next.js App Router no tiene un bloqueador de navegación nativo estable: intercepta los enlaces del propio formulario o usa `beforeunload` como mínimo.

## React 19: actions

```tsx
const [state, formAction, isPending] = useActionState(createAccountAction, initialState)

<form action={formAction}>
  …
  <SubmitButton />   {/* dentro usa useFormStatus().pending para deshabilitarse */}
</form>
```

- Encaja con Server Actions (Next.js) y mejora progresiva (el formulario funciona antes de hidratar).
- La validación con el schema se hace en la action (servidor) y los errores por campo vuelven en `state`. Para validación en cliente mientras se escribe, combina con React Hook Form o valida con el mismo schema en el cliente.
- `isPending` / `useFormStatus` evitan el doble envío mientras la action está en curso.

## Alternativas

- **TanStack Form**: tipado muy estricto, validación por campo con adaptadores Standard Schema.
- **Formik**: mantenimiento reducido; en proyectos nuevos, preferir React Hook Form o TanStack Form.

## Errores comunes

- Inputs controlados con `useState` por campo en formularios grandes: re-render de todo el formulario en cada tecla. React Hook Form usa inputs no controlados por defecto por esta razón.
- `key={index}` en filas dinámicas.
- `onClick` en el botón en vez de `onSubmit` en el formulario (Enter no envía; la validación nativa y los gestores de contraseñas se comportan peor).
