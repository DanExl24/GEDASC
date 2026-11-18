# Design system — notas Vue

## Componente base con variantes

```vue
<!-- shared/ui/button/BaseButton.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { buttonVariants, type ButtonVariants } from './button.variants'
import { cn } from '@/shared/lib/cn'

const props = withDefaults(defineProps<{
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  class?: string
}>(), { type: 'button' })

const classes = computed(() => cn(buttonVariants({ variant: props.variant, size: props.size }), 'relative', props.class))
</script>

<template>
  <button :type="type" :class="classes" :disabled="disabled || loading" :aria-busy="loading || undefined">
    <span :class="{ invisible: loading }" class="inline-flex items-center gap-2"><slot /></span>
    <span v-if="loading" class="absolute" aria-hidden="true"><!-- spinner --></span>
  </button>
</template>
```

- `type="button"` por defecto: un `<button>` sin tipo dentro de un formulario lo envía.
- `disabled` se declara como prop porque el componente lo combina con `loading`; un atributo heredado sin declarar se fusionaría con el binding y podría pisarlo.
- Los atributos no declarados como props (`id`, `aria-*`, `@click`) caen automáticamente en el elemento raíz. Si el raíz no es el elemento nativo (por ejemplo, un wrapper), usa `defineOptions({ inheritAttrs: false })` y `v-bind="$attrs"` en el elemento correcto.

## Componentes polimórficos

Para un botón que a veces es enlace: prop `as` con `<component :is="as">`, o usa el patrón `asChild` de las librerías headless.

## Librerías headless

- **Reka UI** (antes Radix Vue) o **Headless UI**: comportamiento y accesibilidad de componentes compuestos (dialog, menu, combobox, tabs) sin estilos. Encaja con tokens propios; es la base de **shadcn-vue**.
- Con PrimeVue, Vuetify o Element Plus: personaliza mediante su sistema de temas (design tokens / presets) y evita sobrescribir con CSS profundo (`:deep()`) por todas partes.

## Estilos

- `<style scoped>` para estilos propios del componente; tokens siempre como `var(--…)`.
- Evita `:deep()` salvo para integrar librerías de terceros, y documenta por qué.
- `v-bind()` en CSS para valores dinámicos (`color: v-bind(color)`) solo cuando el valor viene de props; los valores del sistema deben ser tokens.

## Catálogo

Storybook (`@storybook/vue3-vite`) o **Histoire** para documentar variantes y estados.
