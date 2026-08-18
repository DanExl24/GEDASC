<template>
  <div class="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/70 p-2">
    <BaseTable>
      <BaseColumn row-class="bg-slate-900 text-center">
        <BaseTableHead name="Aprendiz" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Formación" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Sesión" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Jornada" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Hora de salida" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Salida de maquinas" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
      </BaseColumn>

      <BaseColumn
        v-for="aprendiz in aprendizData"
        :key="aprendiz.id_aprendiz"
        row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
      >
        <td>
          <div class="flex flex-col items-start gap-1">
            <span class="font-bold text-slate-950">{{ aprendiz.nombre }} {{ aprendiz.apellido }}</span>
            <span class="text-xs font-semibold text-slate-500">C.C. {{ aprendiz.documento }}</span>
            <div class="flex flex-wrap gap-1 mt-0.5">
              <span
                v-if="aprendiz.es_monitor"
                class="inline-flex items-center rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 ring-1 ring-inset ring-purple-700/10"
              >
                Monitor
              </span>
              <span
                v-if="Number(aprendiz.total_formaciones) > 1"
                class="inline-flex items-center rounded-md bg-pink-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pink-700 ring-1 ring-inset ring-pink-700/10"
              >
                Doble Formación
              </span>
              <span
                v-if="Number(aprendiz.numero_sesion) > 1"
                class="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-700/10"
              >
                Sesión {{ aprendiz.numero_sesion }}
              </span>
              <span
                v-if="aprendiz.motivo_visita"
                class="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 ring-1 ring-inset ring-red-700/10"
              >
                Fuera de Horario
              </span>
            </div>
          </div>
        </td>
        <td class="max-w-[180px] break-words text-left font-medium text-slate-800">
          <div class="flex flex-col gap-0.5">
            <span class="font-bold text-slate-900 text-xs">{{ aprendiz.nombre_programa || 'Sin formación' }}</span>
            <span v-if="aprendiz.id_formacion" class="text-[11px] text-purple-700 font-bold">Ficha: {{ aprendiz.id_formacion }}</span>
            <span v-if="aprendiz.motivo_visita" class="text-[10px] text-slate-400 font-medium italic mt-0.5">Motivo: {{ aprendiz.motivo_visita }}</span>
          </div>
        </td>
        <td>
          <span
            @click="showSessionDetails(aprendiz)"
            class="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-700 ring-1 ring-inset ring-sky-700/10 cursor-pointer hover:bg-sky-100 transition"
            title="Ver detalles de la sesión"
          >
            Sesión {{ aprendiz.numero_sesion || 1 }}
          </span>
        </td>
        <td>
          <JornadaBadge
            :aprendiz-id="aprendiz.id_aprendiz"
            :hour="aprendiz.hora_ingreso"
          />
        </td>
        <td class="font-medium text-slate-850">{{ formatDateTime(aprendiz.hora_salida) }}</td>
        <td>
          <div class="flex items-center justify-center">
            <BaseButtonOpen
              v-if="aprendiz.id_detallemaquina"
              text="Ver detalle"
              variant="ghost"
              class-button="min-h-0 px-0 py-0 font-semibold shadow-none text-emerald-600 hover:underline text-xs"
              @click="handleMachineDetails(aprendiz)"
            />
            <BaseText
              v-else
              text="Sin registro"
              type="error"
              text-class="font-semibold text-xs"
            />
          </div>
        </td>
      </BaseColumn>
    </BaseTable>

    <ModalMachineDetails
      v-if="aprendizMachine"
      ref="modalMachineDetails"
      :id_aprendiz="aprendizMachine.id_aprendiz"
      :allow-add="false"
    />

    <!-- Modal Detalle Sesión -->
    <BaseModal ref="modalSessionDetail" title="Detalles de la Sesión">
      <div v-if="selectedSessionAprendiz" class="flex flex-col gap-4 rounded-[24px] bg-slate-50 p-5 text-left text-sm text-slate-700">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Aprendiz</span>
          <p class="text-base font-bold text-slate-900">{{ selectedSessionAprendiz.nombre }} {{ selectedSessionAprendiz.apellido }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">DNI</span>
            <p class="font-semibold text-slate-800">{{ selectedSessionAprendiz.documento }}</p>
          </div>
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">N° Sesión</span>
            <p class="font-semibold text-slate-800">Sesión {{ selectedSessionAprendiz.numero_sesion || 1 }}</p>
          </div>
        </div>

        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Programa de Formación</span>
          <p class="font-semibold text-slate-800">{{ selectedSessionAprendiz.formacion }}</p>
        </div>

        <div v-if="selectedSessionAprendiz.es_monitor">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo de Actividad (Monitor)</span>
          <p class="font-semibold text-purple-700 capitalize">{{ selectedSessionAprendiz.tipo_sesion || 'Formación' }}</p>
        </div>

        <div v-if="Number(selectedSessionAprendiz.total_formaciones) > 1">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Asociación Especial</span>
          <p class="font-semibold text-pink-700">Doble Formación Activa</p>
        </div>

        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Motivo de Reingreso</span>
          <p class="font-semibold text-emerald-800">
            {{ selectedSessionAprendiz.motivo_reingreso || 'Primer ingreso del día (Sin reingreso)' }}
          </p>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import BaseTable from '@/components/Tables/BaseTable.vue'
import BaseColumn from '@/components/Tables/BaseColumn.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButton.vue'
import BaseTableHead from '@/components/Tables/BaseTableHead.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import ModalMachineDetails from '@/components/AprendizUI/Modals/ModalMachineDetails.vue'
import JornadaBadge from '@/components/UI/JornadaBadge.vue'
import type { Aprendiz } from '@/types/aprendiz.types'
import { formatDateTime } from '@/utils/formatDate'

const aprendizMachine = ref<Aprendiz | null>(null)
const modalMachineDetails = ref()

const modalSessionDetail = ref()
const selectedSessionAprendiz = ref<Aprendiz | null>(null)

const showSessionDetails = (aprendiz: Aprendiz) => {
  selectedSessionAprendiz.value = aprendiz
  modalSessionDetail.value?.openModal()
}

const handleMachineDetails = async (aprendiz: Aprendiz) => {
  aprendizMachine.value = aprendiz
  await nextTick()
  if (aprendiz.id_detallemaquina != null) {
    await modalMachineDetails.value?.load(aprendiz.id_detallemaquina)
    modalMachineDetails.value?.open()
  }
}

defineProps<{
  aprendizData: Aprendiz[]
}>()
</script>
