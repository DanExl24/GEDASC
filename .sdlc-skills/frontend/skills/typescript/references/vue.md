# TypeScript — notas Vue

## Type-check

- Usa **`vue-tsc --noEmit`** (no `tsc`): entiende los SFC y comprueba también las plantillas.
- En VS Code, la extensión oficial "Vue - Official" (Volar) ofrece el tipado de plantillas.

## Props y emits (`<script setup>`)

```vue
<script setup lang="ts">
interface Props {
  orderId: string
  status?: 'draft' | 'paid' | 'cancelled'
  items: OrderItem[]
}
const { orderId, status = 'draft', items } = defineProps<Props>()
// Vue 3.5+: la desestructuración de defineProps es reactiva y admite valores por defecto.
// En versiones anteriores usa withDefaults(defineProps<Props>(), { status: 'draft' }).

const emit = defineEmits<{
  select: [id: string]
  'update:status': [status: Props['status']]
}>()
</script>
```

- `defineModel<string>()` para `v-model` tipado (Vue 3.4+).
- Slots tipados: `defineSlots<{ default(props: { item: OrderItem }): any; empty(): any }>()`.

## Componentes genéricos

```vue
<script setup lang="ts" generic="T extends { id: string }">
defineProps<{ rows: T[]; columns: Array<{ key: keyof T; label: string }> }>()
defineEmits<{ select: [row: T] }>()
</script>
```

## Refs y plantilla

- `ref<User | null>(null)` cuando el valor inicial no permite inferir el tipo.
- Refs de plantilla: `useTemplateRef<HTMLInputElement>('input')` (Vue 3.5+) o `ref<HTMLInputElement | null>(null)`.
- Refs de componentes: `ref<InstanceType<typeof MyModal> | null>(null)`.
- `provide`/`inject` tipados con `InjectionKey<T>`:
  ```ts
  export const ThemeKey: InjectionKey<Ref<'light' | 'dark'>> = Symbol('theme')
  const theme = inject(ThemeKey)   // Ref<'light' | 'dark'> | undefined
  ```

## Pinia

- Los setup stores (`defineStore('x', () => { … })`) infieren todo el tipado sin anotaciones.
- Tipa explícitamente el estado inicial cuando empieza vacío: `const items = ref<Order[]>([])`.

## Errores comunes

- `defineProps()` sin genérico (runtime declaration) en un proyecto TS: se pierden los tipos complejos.
- Eventos con `emit('select', row as any)` por no haber tipado `defineEmits`.
- `$refs` sin tipar usados como `any`.
