<template>
  <div class="flex flex-col">
    <label class="mt-2 font-robotoSlab">{{ label }}</label>

    <input
      :value="modelValue"
      :readonly="readonly"
      :type="type"
      :placeholder="placeHolder"
      @input="handleInput"
      class="border border-gray-400 focus:outline-none rounded-lg p-2 py-2.5 font-quicksand"
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
}>(),{
  type:'text',
  placeHolder:'Write something...',
  readonly:false,
  modelValue : ''
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
