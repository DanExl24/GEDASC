# Accesibilidad — notas Angular

## Lint

`@angular-eslint/template` con las reglas de accesibilidad activadas (configuración `accessibility`): `alt-text`, `click-events-have-key-events`, `interactive-supports-focus`, `label-has-associated-control`, `role-has-required-aria`, `valid-aria`, `elements-content`…

## Angular CDK a11y

- `cdkTrapFocus` (con `cdkTrapFocusAutoCapture`) para confinar el foco en overlays propios.
- `FocusMonitor` para distinguir foco por teclado o por ratón.
- `LiveAnnouncer` para regiones live:
  ```ts
  private announcer = inject(LiveAnnouncer)
  this.announcer.announce('Pedido guardado', 'polite')
  ```
- `ListKeyManager` / `FocusKeyManager` / `ActiveDescendantKeyManager` para navegación con flechas en listas, menús y combobox propios.
- CDK `Dialog` y `Overlay`: gestionan foco inicial, `Escape` y restauración del foco.

## Atributos ARIA

- Binding de atributo: `[attr.aria-expanded]="open()"`, `[attr.aria-describedby]="hasError() ? errorId : null"` (`null` elimina el atributo).
- `[aria-expanded]` sin `attr.` también funciona en versiones recientes para atributos ARIA, pero `[attr.…]` es explícito y universal.
- IDs únicos: genera un id por instancia (un contador de módulo: `id = 'field-' + ++nextId`) para `for`/`aria-labelledby`.

## Cambio de ruta

```ts
// app.config.ts
provideRouter(routes, withComponentInputBinding())
// rutas con title: { path: 'orders', title: 'Pedidos', … }  → el Router actualiza document.title
```

Para el foco, escucha `NavigationEnd` en el layout y enfoca el `h1` del contenido principal (con `afterNextRender` para que exista en el DOM).

## Angular Material

Componentes con buena base de accesibilidad, pero requieren configuración por uso: `aria-label` en `mat-icon-button`, `<mat-label>` en cada `mat-form-field`, `mat-error` para los mensajes (se asocian automáticamente), etiquetas en `mat-slide-toggle` y `mat-checkbox`.

## Errores comunes

- `(click)` en `div`/`span` sin rol, `tabindex` ni `(keydown.enter)`.
- Overlays propios sin `cdkTrapFocus` ni restauración del foco.
- `mat-icon-button` sin `aria-label`.
- Validaciones que solo cambian el color del campo.
