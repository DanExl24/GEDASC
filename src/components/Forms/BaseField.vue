<template>
  <div :class="wrapperClass">
    <label :class="labelClass">{{ label }}</label>

    <input
      :value="modelValue"
      :readonly="readonly"
      :type="type"
      :placeholder="placeHolder"
      @input="handleInput"
      :class="inputClass"
      :maxlength="maxLength"
    />
  </div>
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  modelValue?: string
  type?: string
  placeHolder?: string
  label: string
  readonly?: boolean
  inputEvent?: (value:string)=>void,
  maxLength? : number
  wrapperClass?: string
  labelClass?: string
  inputClass?: string
}>(),{
  type:'text',
  placeHolder:'Write something...',
  readonly:false,
  modelValue : '',
  wrapperClass: 'flex flex-col gap-2',
  labelClass: 'mt-2 font-robotoSlab text-sm font-semibold text-slate-700',
  inputClass: 'rounded-2xl border border-slate-200 bg-slate-50 p-3 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100'
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value

  emit('update:modelValue', value)

  if(props.inputEvent){
    props.inputEvent(value)
  }
}

</script>
