<template>
  <BaseModal @close="close" ref="modalRef" title="Máquinas registradas">
    <div class="grid gap-4">
      <div v-if="maquinaDetalle?.pc" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="font-robotoSlab text-lg font-bold text-slate-900">Computador</h3>
        <BaseText type="success" :text="`Marca: ${maquinaDetalle?.pc.marca}`" />
        <BaseText type="success" :text="`Serial: ${maquinaDetalle?.pc.serial}`" />
      </div>

      <div v-if="maquinaDetalle?.vh" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 class="font-robotoSlab text-lg font-bold text-slate-900">Vehículo</h3>
        <BaseText type="success" :text="`Tipo: ${normalizeVehicleType(maquinaDetalle?.vh.tipo_vehiculo)}`" />
        <BaseText type="success" :text="`Marca: ${maquinaDetalle?.vh.marca}`" />
        <BaseText type="success" :text="`Placa: ${maquinaDetalle?.vh.placa}`" />
      </div>

      <div v-if="maquinaDetalle?.firma" class="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4">
        <h3 class="mb-2 font-semibold text-slate-900">Firma del aprendiz</h3>
        <img :src="maquinaDetalle?.firma" class="w-48 rounded-xl border bg-white" alt="Firma del aprendiz" />
      </div>
    </div>
  </BaseModal>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/components/Modals/BaseModal.vue';
import BaseText from '@/components/Text/BaseText.vue';
import { useMachineService } from '@/composables/API/useMachineService';
import { normalizeVehicleType } from '@/utils/vehicleType';
import type { machineDetails } from '@/types/machineDetails.types';
const {getDetalleMaquina} = useMachineService()
const maquinaDetalle = ref<machineDetails | null>(null)
const modalRef = ref()


const open = () => {
  modalRef.value?.openModal()
}

const close = () => {
  modalRef.value?.closeModal()
}

defineProps<{
  id_aprendiz : number
}>()

const load = async (ID: number) => {
  const data = await getDetalleMaquina(ID)
  maquinaDetalle.value = data
}

defineExpose({
  open,
  close,
  load
})
</script>
