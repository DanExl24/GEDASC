<template>
  <article class="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Buscar aprendiz</p>
          <input
            :value="modelValue"
            :placeholder="placeholder"
            :readonly="readonly"
            :type="type"
            @input="handleInput"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
  </article>

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
