<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-emerald-100">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 font-bold">
              ⏱️
            </div>
            <div>
              <h3 class="font-robotoSlab text-lg font-bold text-slate-800">Simulador de Hora</h3>
              <p class="text-xs text-slate-500">Herramienta de pruebas para administradores</p>
            </div>
          </div>
          <button
            @click="close"
            class="text-slate-400 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="mt-5 space-y-4">
          <p class="text-sm text-slate-600 leading-relaxed">
            Selecciona una hora virtual para probar la inferencia de jornadas (Mañana, Tarde, Noche) o la detección de fuera de horario.
          </p>

          <!-- Preajustes rápidos -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Horarios de Prueba Rápidos:
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                @click="selectedTime = '07:30'"
                class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-amber-400 hover:bg-amber-50 transition"
              >
                07:30 AM (Mañana)
              </button>
              <button
                @click="selectedTime = '14:00'"
                class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-amber-400 hover:bg-amber-50 transition"
              >
                02:00 PM (Tarde)
              </button>
              <button
                @click="selectedTime = '20:30'"
                class="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-amber-400 hover:bg-amber-50 transition"
              >
                08:30 PM (Noche)
              </button>
            </div>
          </div>

          <!-- Selector manual -->
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Hora personalizada (HH:MM 24h):
            </label>
            <input
              type="time"
              v-model="selectedTime"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />
          </div>
        </div>

        <!-- Footer / Acciones -->
        <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            @click="resetRealTime"
            class="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            🔄 Restablecer a Hora Real
          </button>
          <button
            @click="applySimulatedTime"
            class="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition"
          >
            ✅ Aplicar Hora Simulada
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { API_URL } from '@/config/network'

const isOpen = ref(false)
const selectedTime = ref('')
const emit = defineEmits(['updated'])

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const applySimulatedTime = async () => {
  if (!selectedTime.value) return
  try {
    await fetch(`${API_URL}/api/admin/simularHora`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time: selectedTime.value })
    })
    emit('updated')
    close()
  } catch (error) {
    console.error('Error al aplicar simulación:', error)
  }
}

const resetRealTime = async () => {
  try {
    await fetch(`${API_URL}/api/admin/simularHora`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time: null })
    })
    selectedTime.value = ''
    emit('updated')
    close()
  } catch (error) {
    console.error('Error al restablecer hora:', error)
  }
}

defineExpose({ open, close })
</script>
