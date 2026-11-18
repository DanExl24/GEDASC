# Formularios — notas Angular

## Reactive Forms tipados

```ts
@Component({ … })
export class AccountFormComponent {
  private fb = inject(FormBuilder).nonNullable     // reset() vuelve a los valores iniciales, no a null
  private destroyRef = inject(DestroyRef)

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email], [this.emailAvailable()]],   // validador asíncrono
    items: this.fb.array<FormGroup<ItemControls>>([]),
  })

  submitting = signal(false)
  serverError = signal<string | null>(null)

  submit() {
    if (this.submitting()) return                    // guard contra doble envío (Enter incluido)
    if (this.form.invalid) {
      this.form.markAllAsTouched()
      focusFirstInvalid()
      return
    }
    this.submitting.set(true)
    this.accounts.create(this.form.getRawValue()).pipe(
      finalize(() => this.submitting.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: () => this.form.reset(),
      error: (e: AppError) => this.applyServerErrors(e),
    })
  }

  private applyServerErrors(e: AppError) {
    if (!e.fieldErrors) {
      this.serverError.set('No se pudo guardar. Inténtalo de nuevo.')
      return
    }
    for (const [field, messages] of Object.entries(e.fieldErrors)) {
      this.form.get(field)?.setErrors({ server: messages[0] })
    }
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="submit()" novalidate>
  <label for="email">Email</label>
  <input id="email" type="email" formControlName="email" autocomplete="email"
         [attr.aria-invalid]="form.controls.email.invalid && form.controls.email.touched"
         aria-describedby="email-error" />
  @if (form.controls.email.touched && form.controls.email.errors; as errs) {
    <p id="email-error" role="alert">{{ errs['server'] ?? 'Introduce un email válido' }}</p>
  }
  <button type="submit" [disabled]="submitting()">Guardar</button>
</form>
```

- `ngSubmit` + `type="submit"`: Enter funciona.
- `getRawValue()` incluye los controles deshabilitados; `value` no.
- Mensajes de error: centraliza el mapeo `errorKey → mensaje` en una función o pipe compartido, no en cada plantilla.
- Para usar schemas Zod/Valibot, envuélvelos en un `ValidatorFn` de grupo o usa una librería adaptadora; si no, los validadores de Angular son la fuente de verdad y el tipo sale del `FormGroup`.

## Validación asíncrona

```ts
emailAvailable(): AsyncValidatorFn {
  return (control) => timer(400).pipe(                         // debounce
    switchMap(() => this.api.emailExists(control.value)),      // switchMap cancela la anterior
    map((exists) => (exists ? { taken: true } : null)),
    catchError(() => of(null)),
  )
}
```

Combínalo con `updateOn: 'blur'` en el control si no quieres comprobar en cada pulsación.

## FormArray

```html
@for (group of form.controls.items.controls; track group) {   <!-- trackear la instancia del FormGroup, no $index -->
  <div [formGroup]="group"> … </div>
}
```

## Cambios sin guardar

```ts
export const unsavedChangesGuard: CanDeactivateFn<{ form: FormGroup }> = (component) =>
  !component.form.dirty || confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')
```

Y un `HostListener('window:beforeunload')` que llame a `preventDefault()` mientras `form.dirty`.

## Signal Forms

Angular está introduciendo formularios basados en signals (marcados como experimentales en las primeras versiones). Úsalos solo si el proyecto ya los adopta; los principios de esta skill (schema, envío único, errores por campo) aplican igual.

## Errores comunes

- `UntypedFormGroup` en código nuevo.
- Validar solo en el submit sin `markAllAsTouched()`: los errores no se ven.
- `subscribe` en el submit sin cancelación ni guard: doble envío con Enter.
- Template-driven forms (`ngModel`) para formularios complejos con validación cruzada: preferir Reactive Forms.
