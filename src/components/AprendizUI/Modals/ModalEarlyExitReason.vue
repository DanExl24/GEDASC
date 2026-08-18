<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
    <div class="bg-gray-900 border border-amber-500/40 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 bg-amber-500/10 border-b border-amber-500/20">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-white tracking-wide">Salida Anticipada</h3>
            <p class="text-xs text-amber-400/90 font-medium">Fin oficial de clase: {{ scheduledEndTime || 'No definido' }}</p>
          </div>
        </div>
        <button @click="close" class="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido -->
      <div class="p-6 space-y-4">
        <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
          <p class="font-semibold">⚠️ Advertencia de Horario Académico</p>
          <p class="mt-0.5 text-gray-300">El aprendiz está registrando su salida antes del horario de finalización de su formación. Seleccione el motivo justificado.</p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Motivo de Egreso Anticipado</label>
          <div class="space-y-2">
            <label
              v-for="option in predefinedReasons"
              :key="option"
              class="flex items-center p-3 bg-gray-800/80 hover:bg-gray-800 border border-gray-700/60 rounded-xl cursor-pointer transition-colors"
              :class="{ 'border-amber-500/60 bg-amber-500/5': selectedReason === option }"
            >
              <input
                type="radio"
                v-model="selectedReason"
                :value="option"
                class="w-4 h-4 text-amber-500 focus:ring-amber-500 bg-gray-700 border-gray-600"
              />
              <span class="ml-3 text-sm text-gray-200">{{ option }}</span>
            </label>
          </div>
        </div>

        <!-- Opción personalizada si elige Otro -->
        <div v-if="selectedReason === 'Otro'">
          <label class="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Especifique el motivo</label>
          <input
            v-model="customReason"
            type="text"
            placeholder="Detalle la justificación..."
            class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="!finalReason.trim()"
            @click="confirmExit"
            class="px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 active:bg-amber-700 rounded-xl transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
          >
            Confirmar Salida
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  scheduledEndTime?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', reason: string): void
}>()

const predefinedReasons = [
  'Permiso concedido por Instructor',
  'Cita médica / Salud',
  'Calamidad doméstica justificada',
  'Finalización anticipada de actividades lectivas',
  'Trámite institucional CTA',
  'Otro'
]

const selectedReason = ref(predefinedReasons[0])
const customReason = ref('')

const finalReason = computed<string>(() => {
  if (selectedReason.value === 'Otro') {
    return customReason.value.trim()
  }
  return selectedReason.value || ''
})

const close = () => {
  emit('close')
}

const confirmExit = () => {
  const reason = finalReason.value.trim()
  if (!reason) return
  emit('confirm', reason)
  close()
}
</script>
