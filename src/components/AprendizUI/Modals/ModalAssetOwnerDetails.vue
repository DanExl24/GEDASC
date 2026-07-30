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

      <div v-if="detail.firma" class="rounded-[18px] border border-dashed border-emerald-200 bg-emerald-50 p-4">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-senaColor">Firma registrada</p>
        <div class="mt-3 flex justify-center rounded-[16px] border border-emerald-100 bg-white p-3">
          <img :src="detail.firma" class="max-h-40 w-auto rounded-lg" alt="Firma del propietario" />
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
