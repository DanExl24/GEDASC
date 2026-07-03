<template>
  <BaseModal
    ref="baseModalRef"
    title="Motivo de Visita"
    modal-class="my-6 w-full max-w-lg overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    header-class="relative flex items-center justify-center border-b border-emerald-100 bg-[linear-gradient(90deg,#ffffff_0%,#f3fbf5_40%,#e2f4e6_100%)] px-5 py-4 text-center font-robotoSlab text-lg font-bold text-slate-800"
    body-class="relative space-y-4 px-5 py-5"
  >
    <p class="text-sm text-slate-500 leading-relaxed">
      El aprendiz está ingresando fuera de su horario académico registrado. Por favor, seleccione o ingrese el motivo de su visita:
    </p>

    <div v-if="!showCustomInput" class="grid grid-cols-2 gap-2">
      <button
        v-for="reason in predefinedReasons"
        :key="reason"
        class="text-left p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 text-xs font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
        @click="selectReason(reason)"
      >
        {{ reason }}
      </button>
      <button
        class="text-left p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 text-xs font-bold text-slate-500 hover:text-emerald-700 transition cursor-pointer"
        @click="showCustomInput = true"
      >
        Otro...
      </button>
    </div>

    <div v-else class="space-y-4">
      <div class="space-y-1">
        <label class="text-xs font-bold uppercase tracking-wider text-slate-500">Especificar Motivo</label>
        <input
          v-model="customReason"
          type="text"
          placeholder="Escriba el motivo de la visita..."
          class="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
          @keyup.enter="submitCustom"
        />
      </div>

      <div class="flex gap-2 justify-end">
        <button
          class="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          @click="showCustomInput = false"
        >
          Volver
        </button>
        <button
          class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition cursor-pointer"
          :disabled="!customReason.trim()"
          @click="submitCustom"
        >
          Confirmar
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'

const baseModalRef = ref()
const showCustomInput = ref(false)
const customReason = ref('')

const predefinedReasons = [
  'Biblioteca',
  'Proyecto de formación',
  'Monitoría',
  'Bienestar al Aprendiz',
  'Reunión con instructor',
  'Evento institucional',
  'Trámite administrativo'
]

const emit = defineEmits<{
  (e: 'confirm', reason: string): void
}>()

const open = () => {
  showCustomInput.value = false
  customReason.value = ''
  baseModalRef.value?.openModal()
}

const close = () => {
  baseModalRef.value?.closeModal()
}

const selectReason = (reason: string) => {
  emit('confirm', reason)
  close()
}

const submitCustom = () => {
  const reason = customReason.value.trim()
  if (reason) {
    emit('confirm', reason)
    close()
  }
}

defineExpose({
  open,
  close
})
</script>
