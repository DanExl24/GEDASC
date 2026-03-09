<template>
  <select
    v-model="model"
    class="border border-gray-400 rounded-lg p-2 bg-white focus:outline-none disabled:bg-gray-200 my-1"
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

<script setup lang="ts">

interface Option {
  label: string
  value: string | number
}

const model = defineModel<string | number | "">({
  default: ""
})

defineProps<{
  options: Option[],
  placeholder : string
}>()

</script>
