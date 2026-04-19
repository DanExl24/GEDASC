<template>
  <div class="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/70 p-2">
    <BaseTable>
      <BaseColumn row-class="bg-slate-900 text-center">
        <BaseTableHead name="Nombre" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Apellido" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Formacion" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Jornada" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Hora de salida" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Salida de maquinas" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
      </BaseColumn>

      <BaseColumn
        v-for="aprendiz in aprendizData"
        :key="aprendiz.id_aprendiz"
        row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
      >
        <td>{{ aprendiz.nombre }}</td>
        <td>{{ aprendiz.apellido }}</td>
        <td>{{ aprendiz.documento }}</td>
        <td>{{ aprendiz.formacion }}</td>
        <td>
          <JornadaBadge
            :aprendiz-id="aprendiz.id_aprendiz"
            :hour="aprendiz.hora_ingreso"
          />
        </td>
        <td>{{ aprendiz.hora_salida }}</td>
        <td>
          <div class="flex items-center justify-center">
            <BaseButtonOpen
              v-if="aprendiz.id_detallemaquina"
              text="Ver detalle"
              variant="ghost"
              class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
              @click="handleMachineDetails(aprendiz)"
            />
            <BaseText
              v-else
              text="Sin registro"
              type="error"
              text-class="font-semibold"
            />
          </div>
        </td>
      </BaseColumn>
    </BaseTable>

    <ModalMachineDetails
      v-if="aprendizMachine"
      ref="modalMachineDetails"
      :id_aprendiz="aprendizMachine.id_aprendiz"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import BaseTable from '@/components/Tables/BaseTable.vue'
import BaseColumn from '@/components/Tables/BaseColumn.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButton.vue'
import BaseTableHead from '@/components/Tables/BaseTableHead.vue'
import ModalMachineDetails from '@/components/AprendizUI/Modals/ModalMachineDetails.vue'
import JornadaBadge from '@/components/UI/JornadaBadge.vue'
import type { Aprendiz } from '@/types/aprendiz.types'

const aprendizMachine = ref<Aprendiz | null>(null)
const modalMachineDetails = ref()

const handleMachineDetails = async (aprendiz: Aprendiz) => {
  aprendizMachine.value = aprendiz
  await nextTick()
  await modalMachineDetails.value?.load(aprendiz.id_aprendiz)
  modalMachineDetails.value?.open()
}

defineProps<{
  aprendizData: Aprendiz[]
}>()
</script>
