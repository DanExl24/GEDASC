# TypeScript — notas Angular

## Configuración del compilador de Angular

```jsonc
// tsconfig.json
{
  "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true },
  "angularCompilerOptions": {
    "strictTemplates": true,                 // comprueba tipos en las plantillas
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "extendedDiagnostics": { "defaultCategory": "error" }
  }
}
```

`strictTemplates` es el equivalente a `vue-tsc` para plantillas: sin él, los errores de las plantillas pasan desapercibidos.

## Inputs y outputs con signals

```ts
@Component({ selector: 'app-order-row', … })
export class OrderRowComponent {
  order = input.required<Order>()
  variant = input<'compact' | 'full'>('full')
  selected = output<OrderId>()
  status = model<OrderStatus>('draft')   // two-way binding tipado
}
```

- Prefiere `input()`/`output()`/`model()` frente a `@Input()`/`@Output()` en código nuevo.
- Transformaciones tipadas: `disabled = input(false, { transform: booleanAttribute })`.

## HttpClient tipado

```ts
getOrder(id: OrderId) {
  return this.http.get<OrderDto>(`/api/orders/${id}`)   // el genérico NO valida: es una promesa al compilador
}
```

El genérico de `HttpClient` no comprueba nada en runtime. Para endpoints críticos, valida con un schema en el servicio (`map((r) => OrderSchema.parse(r))`).

## Formularios tipados

- Reactive Forms están tipados desde Angular 14: `new FormControl<string>('', { nonNullable: true })`.
- Evita `UntypedFormGroup`/`UntypedFormControl` en código nuevo (solo existen para migración).
- Usa `FormBuilder.nonNullable` para que `reset()` no deje valores `null` inesperados.

## Inyección

- `inject(Service)` infiere el tipo; para valores no-clase usa `InjectionToken<T>`:
  ```ts
  export const API_URL = new InjectionToken<string>('API_URL')
  ```

## Errores comunes

- `strictTemplates` desactivado: errores de tipos en plantillas invisibles.
- `$any(...)` en plantillas para silenciar errores.
- Formularios `Untyped*` en código nuevo.
- Interfaces DTO escritas a mano que divergen del backend sin que nadie lo note.
