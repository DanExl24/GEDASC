<template>
  <select
    v-model="model"
    :class="[struct,'border border-gray-400 rounded-lg p-2 focus:outline-none disabled:bg-gray-200 my-1']"
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
const props = defineProps<{
  options: Option<T>[]
  placeholder: string,
  struct? : string
}>()

const struct = computed(()=>{
  if(props.struct=='white') return 'bg-white text-black'
  else if(props.struct=='green') return 'bg-senaColor text-white'
  else return ''
})

</script>
