# Design system — notas Angular

## Componente base con variantes (selector de atributo)

```ts
// shared/ui/button/button.component.ts
@Component({
  selector: 'button[appButton], a[appButton]',     // se aplica sobre el elemento nativo
  template: `
    <span class="inline-flex items-center gap-2" [class.invisible]="loading()"><ng-content /></span>
    @if (loading()) { <app-spinner class="absolute" aria-hidden="true" /> }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.disabled]': 'disabled() || loading() || null',   // un único dueño del atributo
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<ButtonVariants['variant']>('primary')
  size = input<ButtonVariants['size']>('md')
  loading = input(false, { transform: booleanAttribute })
  disabled = input(false, { transform: booleanAttribute })
  classes = computed(() => cn(buttonVariants({ variant: this.variant(), size: this.size() }), 'relative'))
}
```

```html
<button appButton variant="destructive" type="button" (click)="delete()">Eliminar</button>
```

- El selector de atributo mantiene el `<button>` nativo: semántica, foco, formularios y atributos funcionan sin reenviar nada.
- Bindings en `host` en lugar de `@HostBinding` en código nuevo.
- CVA funciona igual en Angular; también puedes usar clases CSS con `data-variant`.

## Encapsulación de estilos

- Por defecto `ViewEncapsulation.Emulated`. Los tokens como variables CSS atraviesan la encapsulación (heredan), así que se definen una vez en `styles.css` global.
- Evita `::ng-deep` (obsoleto); si hay que personalizar un componente de terceros, usa sus variables CSS o su API de temas.

## Angular Material y CDK

- **Angular Material**: tematiza con su sistema de tokens (Material 3, `mat.theme()` y variables `--mat-sys-*`). No sobrescribas clases internas `.mat-mdc-*`: cambian entre versiones.
- **Angular CDK** (sin estilos): `Overlay`, `Dialog`, `Menu`, `Listbox`, `A11y` para construir componentes propios con tokens propios y accesibilidad resuelta.
- Spartan UI / ng-primitives: alternativas headless al estilo shadcn.

## Tailwind en Angular

Funciona igual que en otros frameworks; incluye los `.html` y `.ts` de componentes en el escaneo de contenido (en v4 se detectan automáticamente desde el CSS de entrada).

## Catálogo

Storybook (`@storybook/angular`) con historias por variante y estado.
