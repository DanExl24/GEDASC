<template>
    <input
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :type="type"
      @input="handleInput"
       class="w-2/4 border  border-gray-500 rounded-lg bg-white font-quicksand p-2 focus:outline-none"
    />
</template>

<script setup lang="ts">

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  type?: string
  readonly?: boolean
  inputEvent?: (value:string) => void
}>(), {
  modelValue: '',
  placeholder: 'Digite cualquier dato del aprendiz...',
  type: 'text',
  readonly: false
})

const emit = defineEmits(['update:modelValue'])

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:modelValue', value)

  if(props.inputEvent) {
    props.inputEvent(value)
  }
}
</script>
