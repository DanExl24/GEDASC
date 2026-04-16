<template>
    <input
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :type="type"
      @input="handleInput"
      :class="inputClass"
    />
</template>

<script setup lang="ts">

// props del componente
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  type?: string
  readonly?: boolean
  inputEvent?: (value:string) => void
  inputClass?: string
}>(), {
  modelValue: '',
  placeholder: 'Digite cualquier dato del aprendiz...',
  type: 'text',
  readonly: false
  ,
  inputClass: 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100'
})

// emitir evento
const emit = defineEmits(['update:modelValue'])

// funcion para input automatico
const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)

  if(props.inputEvent) {
    props.inputEvent(value)
  }
}
</script>
