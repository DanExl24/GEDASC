<template>
  <div class="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/70 p-2">
    <BaseTable>
      <BaseColumn row-class="bg-slate-900 text-center">
        <BaseTableHead name="Aprendiz" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Formación" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Sesión" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Ingreso" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Equipos/Vehículos" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Acción / Estado" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
      </BaseColumn>

      <BaseColumn
        v-for="(aprendiz, index) in aprendizData"
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
            </div>
          </div>
        </td>
        <td class="max-w-[180px] break-words text-left font-medium text-slate-800">
          {{ aprendiz.formacion }}
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
          <div class="flex flex-col items-center gap-1">
            <span class="font-semibold text-slate-800">{{ aprendiz.hora_ingreso }}</span>
            <JornadaBadge
              :aprendiz-id="aprendiz.id_aprendiz"
              :hour="aprendiz.hora_ingreso"
            />
          </div>
        </td>
        <td>
          <div class="flex items-center justify-center">
            <BaseButtonOpen
              v-if="index === 0 && aprendiz.id_detallemaquina == null && !aprendiz.hora_salida"
              @click="openMachine(aprendiz)"
              text="Registrar Maquina"
              class-button="min-h-[36px] rounded-xl border-senaColor bg-senaColor px-2.5 py-1.5 text-xs font-semibold text-white shadow-none cursor-pointer"
            />
            <BaseText
              v-else-if="aprendiz.id_detallemaquina == null"
              text="No registrada"
              type="error"
              text-class="font-semibold text-xs"
            />
            <BaseButtonOpen
              v-else-if="aprendiz.id_detallemaquina != null"
              text="Ver detalle"
              variant="ghost"
              class-button="min-h-0 px-0 py-0 font-semibold shadow-none text-emerald-600 hover:underline text-xs"
              @click="handleMachineDetails(aprendiz)"
            />
          </div>
        </td>
        <td>
          <div class="flex items-center justify-center">
            <BaseButtonOpen
              v-if="!aprendiz.hora_salida"
              @click="emit('registrar-salida', aprendiz)"
              text="Registrar Salida"
              variant="ghost"
              class-button="min-h-[36px] rounded-xl py-1.5 px-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 shadow-sm transition cursor-pointer"
            />
            <span
              v-else
              class="inline-flex rounded-full border border-slate-200 bg-slate-100 text-slate-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
            >
              Salida: {{ aprendiz.hora_salida }}
            </span>
          </div>
        </td>
      </BaseColumn>
    </BaseTable>

    <ModalRegisterMachine
      v-if="aprendizMachine"
      ref="modalMachine"
      :aprendiz="aprendizMachine"
      @close="closeMachineForm"
    />
    <ModalMachineDetails
      v-if="aprendizMachine"
      ref="modalMachineDetails"
      :id_aprendiz="aprendizMachine.id_aprendiz"
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

const emit = defineEmits<{
  (e: 'registrar-salida', aprendiz: Aprendiz): void
}>()
import BaseTable from '../Tables/BaseTable.vue'
import BaseColumn from '../Tables/BaseColumn.vue'
import BaseText from '../Text/BaseText.vue'
import BaseButtonOpen from '../Buttons/BaseButton.vue'
import BaseTableHead from '../Tables/BaseTableHead.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import JornadaBadge from '@/components/UI/JornadaBadge.vue'
import type { Aprendiz } from '@/types/aprendiz.types'
import ModalRegisterMachine from './Modals/ModalRegisterMachine.vue'
import ModalMachineDetails from './Modals/ModalMachineDetails.vue'

const aprendizMachine = ref<Aprendiz | null>(null)
const modalMachine = ref()
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

const openMachine = (aprendiz: Aprendiz) => {
  console.log('[RegisterMachine] Abrir modal para aprendiz:', aprendiz)
  aprendizMachine.value = aprendiz

  nextTick(() => {
    modalMachine.value.open()
  })
}

const closeMachineForm = () => {
  modalMachine.value.close()
  aprendizMachine.value = null
}

defineProps<{
  aprendizData: Aprendiz[]
}>()
</script>
