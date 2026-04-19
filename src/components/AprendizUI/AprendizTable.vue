<template>
  <div class="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/70 p-2">
    <BaseTable>
      <BaseColumn row-class="bg-slate-900 text-center">
        <BaseTableHead name="Nombre" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Apellido" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Formación" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Hora de ingreso" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Registro de máquina" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
      </BaseColumn>
      <BaseColumn
        v-for="(aprendiz, index) in aprendizData"
        :key="aprendiz.id_aprendiz"
        row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
      >
        <td>{{ aprendiz.nombre }}</td>
        <td>{{ aprendiz.apellido }}</td>
        <td>{{ aprendiz.documento }}</td>
        <td>{{ aprendiz.formacion }}</td>
        <td>{{ aprendiz.hora_ingreso }}</td>
        <td>
          <div class="flex items-center justify-center">
            <BaseButtonOpen
              v-if="index === 0 && aprendiz.id_detallemaquina == null && !aprendiz.hora_salida"
              @click="openMachine(aprendiz)"
              text="Registrar máquina"
              class-button="min-h-[40px] rounded-xl border-blue-700 bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-none"
            />
            <BaseText
              v-else-if="aprendiz.id_detallemaquina == null"
              text="No registrada"
              type="error"
              text-class="font-semibold"
            />
            <BaseButtonOpen
              v-else-if="aprendiz.id_detallemaquina != null"
              text="Ver detalle"
              variant="ghost"
              class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
              @click="handleMachineDetails(aprendiz)"
            />
            <BaseText
              v-else-if="aprendizMachine?.firma"
              text="Firma registrada"
              type="success"
              text-class="font-semibold"
            />
          </div>
        </td>
      </BaseColumn>
    </BaseTable>
    <ModalRegisterMachine @close="closeMachineForm"   v-if="aprendizMachine" ref="modalMachine" :aprendiz="aprendizMachine" />
    <ModalMachineDetails ref="modalMachineDetails" v-if="aprendizMachine" :id_aprendiz="aprendizMachine.id_aprendiz"/>
  </div>
</template>
<script setup lang="ts">
import { ref,nextTick } from 'vue';
import BaseTable from '../Tables/BaseTable.vue';
import BaseColumn from '../Tables/BaseColumn.vue';
import BaseText from '../Text/BaseText.vue';
import BaseButtonOpen from '../Buttons/BaseButton.vue';
import BaseTableHead from '../Tables/BaseTableHead.vue';
import type { Aprendiz } from '@/types/aprendiz.types';
import ModalRegisterMachine from './Modals/ModalRegisterMachine.vue';
import ModalMachineDetails from './Modals/ModalMachineDetails.vue';


const aprendizMachine = ref<Aprendiz | null>(null)
const modalMachine = ref()
const modalMachineDetails = ref()

const handleMachineDetails = async (aprendiz : Aprendiz) => {
  aprendizMachine.value = aprendiz
  await nextTick()
  await modalMachineDetails.value?.load(aprendizMachine.value.id_aprendiz)
  modalMachineDetails.value?.open()
}

const openMachine = (aprendiz: Aprendiz) => {
  aprendizMachine.value = aprendiz

  // esperar a que Vue renderice el modal
  nextTick(() => {
    modalMachine.value.open()
  })
}

const closeMachineForm = () => {
  modalMachine.value.close()
}

defineProps<{
  aprendizData: Aprendiz[]
}>()

</script>
