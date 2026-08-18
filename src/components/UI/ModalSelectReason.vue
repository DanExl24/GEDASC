<template>
  <BaseModal
    :is-open="isOpen"
    :title="title"
    :subtitle="subtitle"
    :size="size || 'md'"
    @close="close"
  >
    <div class="space-y-4">
      <div v-if="alertMessage" :class="alertClass" class="p-3 rounded-xl border text-xs">
        <p class="font-semibold">{{ alertTitle || 'Información Importante' }}</p>
        <p class="mt-0.5 text-gray-300">{{ alertMessage }}</p>
      </div>

      <div>
        <label v-if="label" class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
          {{ label }}
        </label>
        <div class="space-y-2">
          <label
            v-for="option in options"
            :key="option"
            :class="[
              'flex items-center p-3 bg-gray-800/80 hover:bg-gray-800 border rounded-xl cursor-pointer transition-colors',
              selectedReason === option ? activeOptionClass : 'border-gray-700/60 text-gray-200'
            ]"
          >
            <input
              type="radio"
              v-model="selectedReason"
              :value="option"
              :class="radioClass"
              class="w-4 h-4 bg-gray-700 border-gray-600 focus:ring-offset-gray-900"
            />
            <span class="ml-3 text-sm font-medium">{{ option }}</span>
          </label>
        </div>
      </div>

      <!-- Campo personalizado si la opción seleccionada es 'Otro' -->
      <div v-if="selectedReason === 'Otro'" class="animate-fadeIn">
        <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
          {{ customLabel || 'Especifique el motivo' }}
        </label>
        <input
          v-model="customReason"
          type="text"
          :placeholder="customPlaceholder || 'Describa el motivo...'"
          class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 transition-colors"
          :class="inputFocusClass"
        />
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="close"
        class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
      >
        {{ cancelText || 'Cancelar' }}
      </button>
      <button
        type="button"
        :disabled="!finalReason.trim()"
        @click="confirm"
        :class="confirmButtonClass"
        class="px-5 py-2 text-sm font-medium text-white rounded-xl transition-all shadow-lg disabled:opacity-50"
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
    emerald: 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300',
    amber: 'border-amber-500/60 bg-amber-500/10 text-amber-300',
    blue: 'border-blue-500/60 bg-blue-500/10 text-blue-300',
    rose: 'border-rose-500/60 bg-rose-500/10 text-rose-300'
  }
  return map[props.variant] || map.emerald
})

const radioClass = computed(() => {
  const map = {
    emerald: 'text-emerald-500 focus:ring-emerald-500',
    amber: 'text-amber-500 focus:ring-amber-500',
    blue: 'text-blue-500 focus:ring-blue-500',
    rose: 'text-rose-500 focus:ring-rose-500'
  }
  return map[props.variant] || map.emerald
})

const alertClass = computed(() => {
  const map = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-300'
  }
  return map[props.variant] || map.emerald
})

const confirmButtonClass = computed(() => {
  const map = {
    emerald: 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-600/20',
    amber: 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 shadow-amber-600/20',
    blue: 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-blue-600/20',
    rose: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-rose-600/20'
  }
  return map[props.variant] || map.emerald
})

const inputFocusClass = computed(() => {
  const map = {
    emerald: 'focus:border-emerald-500 focus:ring-emerald-500',
    amber: 'focus:border-amber-500 focus:ring-amber-500',
    blue: 'focus:border-blue-500 focus:ring-blue-500',
    rose: 'focus:border-rose-500 focus:ring-rose-500'
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
