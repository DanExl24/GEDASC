<template>
  <BaseModal
    ref="modalRef"
    title="Detalle de maquinas registradas"
    modal-class="my-6 w-full max-w-5xl overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    header-class="relative flex items-center justify-center border-b border-emerald-100 bg-[linear-gradient(90deg,#ffffff_0%,#f3fbf5_40%,#e2f4e6_100%)] px-5 py-4 text-center font-robotoSlab text-lg font-bold text-slate-800"
    body-class="relative max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto px-4 py-4 lg:px-5"
  >
    <!-- ESTADO DEL EQUIPO -->
    <div v-if="detail" class="mb-4 p-3.5 rounded-[18px] bg-slate-50 border border-slate-200 flex flex-wrap justify-between items-center">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Estado del Equipo</p>
        <BaseText
          v-if="detail.estado_equipo === 'retirado'"
          type="success"
          text="RETIRADO DEL CENTRO"
          class="font-robotoSlab text-base font-bold"
        />
        <BaseText
          v-else
          type="error"
          text="DENTRO DEL CENTRO"
          class="font-robotoSlab text-base font-bold"
        />
      </div>
      <p v-if="detail.hora_retiro_equipo" class="text-xs text-slate-500">
        Retirado en: {{ formatDateTime(detail.hora_retiro_equipo) }}
      </p>
    </div>

    <div class="grid gap-3" :class="detail.firma_salida && detail.firma_salida !== 'Sin firma de salida' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'">
      <article
        v-if="detail.pc"
        class="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf8_100%)] p-3.5"
      >
        <BaseText
          v-if="estadoUI.text"
          :type="estadoUI.type"
          :text="estadoUI.text"
        />

        <div class="flex items-center gap-3 border-b border-slate-100 pb-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-senaColor text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            PC
          </div>
          <div>
            <h3 class="font-robotoSlab text-base font-bold text-slate-900">Computador</h3>
            <p class="text-xs text-slate-500">Equipo asociado al registro</p>
          </div>
        </div>

        <div class="mt-3 grid gap-2">
          <div class="rounded-xl bg-slate-50 px-3 py-2">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Marca</p>
            <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ detail.pc.marca }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 px-3 py-2">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Serial</p>
            <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ detail.pc.serial }}</p>
          </div>
          <div
            v-if="showOwner && detail.aprendices?.owner?.name"
            class="rounded-xl bg-rose-50 px-3 py-2"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-rose-400">Propietario</p>
            <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ detail.aprendices?.owner?.name }}</p>
          </div>
        </div>
      </article>

      <article
        v-if="detail.vh"
        class="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf8_100%)] p-3.5"
      >
        <BaseText
          v-if="estadoUI.text"
          :type="estadoUI.type"
          :text="estadoUI.text"
        />

        <div class="flex items-center gap-3 border-b border-slate-100 pb-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
            VH
          </div>
          <div>
            <h3 class="font-robotoSlab text-base font-bold text-slate-900">Vehiculo</h3>
            <p class="text-xs text-slate-500">Vehiculo registrado en el movimiento</p>
          </div>
        </div>

        <div class="mt-3 grid gap-2">
          <div class="rounded-xl bg-slate-50 px-3 py-2">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Tipo</p>
            <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ normalizeVehicleType(detail.vh.tipo_vehiculo) }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 px-3 py-2">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Marca</p>
            <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ detail.vh.marca }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 px-3 py-2">
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Placa</p>
            <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ detail.vh.placa }}</p>
          </div>
          <div
            v-if="showOwner && detail.aprendices?.owner?.name"
            class="rounded-xl bg-rose-50 px-3 py-2"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-rose-400">Propietario</p>
            <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ detail.aprendices?.owner?.name }}</p>
          </div>
        </div>
      </article>

      <article
        v-if="detail.firma"
        class="rounded-[18px] border border-dashed border-emerald-200 bg-emerald-50 p-3.5"
      >
        <div class="flex items-center gap-3 border-b border-emerald-100 pb-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[10px] font-bold uppercase tracking-[0.14em] text-senaColor">
            FIR
          </div>
          <div>
            <h3 class="font-robotoSlab text-base font-bold text-slate-900">Firma de ingreso</h3>
            <p class="text-xs text-slate-600">Evidencia asociada al ingreso del equipo.</p>
          </div>
        </div>

        <div class="mt-3 flex min-h-[180px] items-center justify-center rounded-[16px] border border-emerald-100 bg-white p-2">
          <img :src="detail.firma" class="max-h-40 w-auto rounded-lg" alt="Firma del aprendiz" />
        </div>
      </article>

      <!-- FIRMA SALIDA -->
      <article
        v-if="detail.firma_salida && detail.firma_salida !== 'Sin firma de salida'"
        class="rounded-[18px] border border-dashed border-slate-300 bg-slate-100 p-3.5"
      >
        <div class="flex items-center gap-3 border-b border-slate-200 pb-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[10px] font-bold uppercase tracking-[0.14em] text-slate-800">
            FSA
          </div>
          <div>
            <h3 class="font-robotoSlab text-base font-bold text-slate-900">Firma de salida</h3>
            <p class="text-xs text-slate-600">Evidencia asociada a la salida del equipo.</p>
          </div>
        </div>

        <div class="mt-3 flex min-h-[180px] items-center justify-center rounded-[16px] border border-slate-200 bg-white p-2">
          <img :src="detail.firma_salida" class="max-h-40 w-auto rounded-lg" alt="Firma de salida" />
        </div>
      </article>

      <div
        v-if="!detail.pc && !detail.vh && !detail.firma"
        class="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 lg:col-span-3"
      >
        No hay detalles registrados para este movimiento.
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import BaseText from '@/components/Text/BaseText.vue'
import { useMachineDetailStatus } from '@/composables/useMachineDetailStatus'
import { normalizeVehicleType } from '@/utils/vehicleType'
import { formatDateTime } from '@/utils/formatDate'
import type { MaquinaDetalleUI } from '@/types/machineDetails.types'

const modalRef = ref()
const props = defineProps<{
  detail: MaquinaDetalleUI
}>()
const { showOwner, estadoUI } = useMachineDetailStatus(toRef(props, 'detail'))

const open = () => modalRef.value?.openModal()
const close = () => modalRef.value?.closeModal()

defineExpose({ open, close })
</script>
