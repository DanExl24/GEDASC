<template>
  <BaseModal
    :is-open="isOpen"
    :title="title"
    :subtitle="subtitle"
    :size="size || 'md'"
    @close="close"
  >
    <div class="space-y-4 font-quicksand">
      <!-- Alerta Informativa / Contextual -->
      <div v-if="alertMessage" :class="alertClass" class="p-3.5 rounded-2xl border text-xs">
        <p class="font-bold font-robotoSlab tracking-wide">{{ alertTitle || 'Información Importante' }}</p>
        <p class="mt-0.5 opacity-90 leading-relaxed">{{ alertMessage }}</p>
      </div>

      <!-- Selector de Opciones -->
      <div>
        <label v-if="label" class="block text-xs font-bold font-robotoSlab text-slate-600 uppercase tracking-wider mb-2.5">
          {{ label }}
        </label>
        <div class="space-y-2">
          <label
            v-for="option in options"
            :key="option"
            :class="[
              'flex items-center p-3.5 rounded-2xl border cursor-pointer transition-all duration-150',
              selectedReason === option ? activeOptionClass : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70 text-slate-700'
            ]"
          >
            <input
              type="radio"
              v-model="selectedReason"
              :value="option"
              :class="radioClass"
              class="w-4 h-4 bg-white border-slate-300 focus:ring-offset-white"
            />
            <span class="ml-3 text-xs sm:text-sm font-semibold">{{ option }}</span>
          </label>
        </div>
      </div>

      <!-- Campo personalizado si la opción seleccionada es 'Otro' -->
      <div v-if="selectedReason === 'Otro'" class="pt-1">
        <label class="block text-xs font-bold font-robotoSlab text-slate-600 uppercase tracking-wider mb-1.5">
          {{ customLabel || 'Especifique el motivo' }}
        </label>
        <input
          v-model="customReason"
          type="text"
          :placeholder="customPlaceholder || 'Describa el motivo detalladamente...'"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-xs sm:text-sm outline-none transition focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          :class="inputFocusClass"
        />
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="close"
        class="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer"
      >
        {{ cancelText || 'Cancelar' }}
      </button>
      <button
        type="button"
        :disabled="!finalReason.trim()"
        @click="confirm"
        :class="confirmButtonClass"
        class="px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
      >
        {{ confirmText || 'Confirmar' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title: string
    subtitle?: string
    label?: string
    description?: string
    alertTitle?: string
    alertMessage?: string
    options: string[]
    variant?: 'emerald' | 'amber' | 'blue' | 'rose'
    size?: 'sm' | 'md' | 'lg'
    confirmText?: string
    cancelText?: string
    customLabel?: string
    customPlaceholder?: string
  }>(),
  {
    variant: 'emerald',
    size: 'md',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar'
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', reason: string): void
}>()

const selectedReason = ref(props.options[0] || '')
const customReason = ref('')

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      selectedReason.value = props.options[0] || ''
      customReason.value = ''
    }
  }
)

const activeOptionClass = computed(() => {
  const map = {
    emerald: 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm',
    amber: 'border-amber-500 bg-amber-50 text-amber-950 shadow-sm',
    blue: 'border-blue-500 bg-blue-50 text-blue-950 shadow-sm',
    rose: 'border-rose-500 bg-rose-50 text-rose-950 shadow-sm'
  }
  return map[props.variant] || map.emerald
})

const radioClass = computed(() => {
  const map = {
    emerald: 'text-emerald-600 focus:ring-emerald-500',
    amber: 'text-amber-600 focus:ring-amber-500',
    blue: 'text-blue-600 focus:ring-blue-500',
    rose: 'text-rose-600 focus:ring-rose-500'
  }
  return map[props.variant] || map.emerald
})

const alertClass = computed(() => {
  const map = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    rose: 'bg-rose-50 border-rose-200 text-rose-900'
  }
  return map[props.variant] || map.emerald
})

const confirmButtonClass = computed(() => {
  const map = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/10',
    amber: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-amber-600/10',
    blue: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-600/10',
    rose: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/10'
  }
  return map[props.variant] || map.emerald
})

const inputFocusClass = computed(() => {
  const map = {
    emerald: 'focus:border-emerald-500 focus:ring-emerald-100',
    amber: 'focus:border-amber-500 focus:ring-amber-100',
    blue: 'focus:border-blue-500 focus:ring-blue-100',
    rose: 'focus:border-rose-500 focus:ring-rose-100'
  }
  return map[props.variant] || map.emerald
})

const finalReason = computed<string>(() => {
  if (selectedReason.value === 'Otro') {
    return customReason.value.trim()
  }
  return selectedReason.value || ''
})

const close = () => {
  emit('close')
}

const confirm = () => {
  const reason = finalReason.value.trim()
  if (!reason) return
  emit('confirm', reason)
  close()
}
</script>
