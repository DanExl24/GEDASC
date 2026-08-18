<template>
  <BaseModal ref="modalRef" title="Detalle del propietario">
    <div class="grid gap-3">
      <div class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Nombre</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ detail.nombre || 'Sin informacion' }}</p>
      </div>

      <div class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Apellido</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ detail.apellido || 'Sin informacion' }}</p>
      </div>

      <div class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Programa</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ detail.formacion || 'Sin informacion' }}</p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-[18px] border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Ficha (N° Formación)</p>
          <p class="mt-1 text-sm font-bold text-emerald-900">
            {{ detail.id_formacion ? `Ficha ${detail.id_formacion}` : 'Sin ficha' }}
          </p>
        </div>

        <div class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Horario</p>
          <p class="mt-1 text-sm font-semibold text-slate-900">
            {{ (detail.horario_inicio && detail.horario_fin) ? `${detail.horario_inicio} - ${detail.horario_fin}` : 'Sin horario' }}
          </p>
        </div>
      </div>

      <div class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Jornada</p>
        <div class="mt-2">
          <JornadaBadge
            :aprendiz-id="detail.id_propietario"
            :hour="detail.hora_ingreso"
          />
        </div>
      </div>

      <!-- ESTADO DEL ACTIVO -->
      <div v-if="detail.estado_equipo" class="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Estado del Activo</p>
          <p class="mt-0.5 text-sm font-bold" :class="detail.estado_equipo === 'retirado' ? 'text-blue-700' : 'text-emerald-700'">
            {{ detail.estado_equipo === 'retirado' ? 'RETIRADO DEL CENTRO' : 'DENTRO DEL CENTRO' }}
          </p>
        </div>
        <span
          class="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
          :class="detail.estado_equipo === 'retirado' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'"
        >
          {{ detail.estado_equipo === 'retirado' ? 'Retirado' : 'Dentro' }}
        </span>
      </div>

      <!-- SECCIÓN DE FIRMAS (INGRESO Y SALIDA) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
        <!-- Firma de Ingreso -->
        <div class="rounded-[18px] border border-dashed border-emerald-200 bg-emerald-50/70 p-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <p class="text-xs font-bold uppercase tracking-wider text-emerald-800">Firma de Ingreso</p>
              <span v-if="detail.hora_ingreso" class="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                {{ detail.hora_ingreso }}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Capturada al registrar ingreso en portería</p>
          </div>

          <div v-if="detail.firma_ingreso || detail.firma" class="mt-3 flex justify-center rounded-[16px] border border-emerald-100 bg-white p-3 min-h-[110px] items-center">
            <img :src="detail.firma_ingreso || detail.firma || ''" class="max-h-32 w-auto object-contain rounded-lg" alt="Firma de ingreso" />
          </div>
          <div v-else class="mt-3 flex justify-center items-center rounded-[16px] border border-dashed border-slate-200 bg-white p-4 min-h-[110px] text-center text-xs text-slate-400 italic">
            Sin firma de ingreso registrada
          </div>
        </div>

        <!-- Firma de Salida / Retiro -->
        <div
          class="rounded-[18px] border border-dashed p-4 flex flex-col justify-between"
          :class="detail.firma_salida && detail.firma_salida !== 'Sin firma de salida' ? 'border-blue-200 bg-blue-50/60' : 'border-slate-300 bg-slate-50/70'"
        >
          <div>
            <div class="flex items-center justify-between">
              <p
                class="text-xs font-bold uppercase tracking-wider"
                :class="detail.firma_salida && detail.firma_salida !== 'Sin firma de salida' ? 'text-blue-800' : 'text-slate-600'"
              >
                Firma de Salida
              </p>
              <span v-if="detail.hora_salida" class="text-[11px] font-bold text-blue-700 bg-blue-100/90 px-2 py-0.5 rounded-full">
                {{ detail.hora_salida }}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">Capturada al retirar el equipo o finalizar jornada</p>
          </div>

          <div
            v-if="detail.firma_salida && detail.firma_salida !== 'Sin firma de salida'"
            class="mt-3 flex justify-center rounded-[16px] border border-blue-100 bg-white p-3 min-h-[110px] items-center"
          >
            <img :src="detail.firma_salida" class="max-h-32 w-auto object-contain rounded-lg" alt="Firma de salida" />
          </div>
          <div v-else class="mt-3 flex flex-col justify-center items-center rounded-[16px] border border-dashed border-slate-200 bg-white p-4 min-h-[110px] text-center">
            <span class="text-slate-400 text-xs italic">Aún no se ha registrado firma de salida</span>
            <span v-if="detail.estado_equipo !== 'retirado'" class="mt-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
              Activo Dentro del CTA
            </span>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import JornadaBadge from '@/components/UI/JornadaBadge.vue'
import type { AssetOwnerDetail } from '@/types/assetsHistory.types'

defineProps<{
  detail: AssetOwnerDetail
}>()

const modalRef = ref()

const open = () => modalRef.value?.openModal()
const close = () => modalRef.value?.closeModal()

defineExpose({ open, close })
</script>
