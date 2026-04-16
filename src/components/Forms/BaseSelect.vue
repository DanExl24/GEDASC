<template>
  <select
    v-model="model"
    :class="[struct, selectClass]"
    :disabled="disabled"
  >
    <!-- placeholder -->
    <option disabled value="">
      {{ placeholder }}
    </option>

    <!-- opciones -->
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts" generic="T extends string | number">
import { computed } from 'vue';


// 🔹 Opción genérica
interface Option<T> {
  label: string
  value: T
}

// 🔹 v-model tipado dinámicamente
const model = defineModel<T | ''>()

// 🔹 props tipadas con el mismo T
const props = withDefaults(defineProps<{
  options: Option<T>[]
  placeholder: string,
  struct? : string
  selectClass?: string
  disabled?: boolean
}>(), {
  selectClass: 'my-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
  disabled: false
})

const struct = computed(()=>{
  if(props.struct=='white') return 'bg-white text-black'
  else if(props.struct=='green') return 'bg-senaColor text-white'
  else return ''
})

</script>
