<template>
  <BaseModal ref="modalRef" :title="title" @close="handleCancel">
    <div class="flex flex-col gap-4 rounded-[24px] bg-slate-50 p-5 text-center">
      <BaseText
        :text="subTitle"
        type="success"
        text-class="text-center font-semibold text-slate-700"
      />

      <!-- Opciones predefinidas -->
      <div class="grid gap-2 sm:grid-cols-2">
        <button
          v-for="opt in options"
          :key="opt"
          type="button"
          @click="selectOption(opt)"
          :class="selectedReason === opt ? 'bg-emerald-600 text-white border-emerald-700 shadow' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'"
          class="rounded-xl border px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition cursor-pointer"
        >
          {{ opt }}
        </button>
      </div>

      <!-- Campo de texto personalizado -->
      <div v-if="selectedReason === 'Otro'" class="mt-2 text-left">
        <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
          Especifique el motivo
        </label>
        <textarea
          v-model="customReason"
          placeholder="Escriba el motivo del reingreso..."
          class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          rows="2"
        ></textarea>
      </div>

      <div class="mt-4 flex justify-end gap-3">
        <BaseButtonOpen
          text="Cancelar"
          variant="white"
          class-button="rounded-2xl px-4 py-2.5 text-xs font-bold uppercase"
          @click="handleCancel"
        />
        <BaseButtonOpen
          text="Aceptar Reingreso"
          variant="green"
          :disabled="!isValid"
          class-button="rounded-2xl px-4 py-2.5 text-xs font-bold uppercase"
          @click="handleConfirm"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'

const title = 'Motivo de Reingreso'
const subTitle = 'El aprendiz ya cuenta con registros hoy. Indique el motivo del reingreso:'

const options = [
  'Formación académica extra',
  'Monitoría o apoyo docente',
  'Olvidó un objeto/pertenencia',
  'Reunión administrativa/Coordinación',
  'Otro'
]

const selectedReason = ref('')
const customReason = ref('')

const emit = defineEmits<{
  (e: 'confirm', reason: string): void
  (e: 'cancel'): void
}>()

const modalRef = ref()

const isValid = computed(() => {
  if (!selectedReason.value) return false
  if (selectedReason.value === 'Otro' && !customReason.value.trim()) return false
  return true
})

const open = () => {
  selectedReason.value = ''
  customReason.value = ''
  modalRef.value?.openModal()
}

const close = () => {
  modalRef.value?.closeModal()
}

const selectOption = (opt: string) => {
  selectedReason.value = opt
  if (opt !== 'Otro') {
    customReason.value = ''
  }
}

const handleConfirm = () => {
  const finalReason = selectedReason.value === 'Otro' 
    ? customReason.value.trim() 
    : selectedReason.value
  emit('confirm', finalReason)
  close()
}

const handleCancel = () => {
  emit('cancel')
  close()
}

defineExpose({
  open,
  close
})
</script>
