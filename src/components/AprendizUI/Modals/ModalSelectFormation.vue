<template>
  <BaseModal
    ref="baseModalRef"
    title="Seleccionar Formación Académica"
    modal-class="my-6 w-full max-w-lg overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    header-class="relative flex items-center justify-center border-b border-emerald-100 bg-[linear-gradient(90deg,#ffffff_0%,#f3fbf5_40%,#e2f4e6_100%)] px-5 py-4 text-center font-robotoSlab text-lg font-bold text-slate-800"
    body-class="relative space-y-4 px-5 py-5"
  >
    <p class="text-sm text-slate-500 leading-relaxed">
      El aprendiz se encuentra registrado en múltiples programas de formación activos con horarios coincidentes en este momento. Seleccione cuál corresponde a esta sesión:
    </p>

    <div class="space-y-2">
      <button
        v-for="f in formations"
        :key="f.id_formacion"
        class="w-full text-left p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 bg-slate-50/50 hover:bg-emerald-50/30 transition flex justify-between items-center group cursor-pointer"
        @click="select(f.id_formacion)"
      >
        <div class="space-y-1">
          <p class="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">
            Ficha: {{ f.nombre_ficha }}
          </p>
          <p class="text-xs text-slate-500 font-medium">
            {{ f.nombre_programa }}
          </p>
        </div>
        <span class="rounded-full bg-slate-200/60 group-hover:bg-emerald-100/80 px-3 py-1 text-[10px] font-bold text-slate-600 group-hover:text-emerald-700 transition uppercase tracking-wider">
          {{ f.jornada }}
        </span>
      </button>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import type { ActiveSchedule } from '@/types/aprendiz.types'

const baseModalRef = ref()
const formations = ref<ActiveSchedule[]>([])

const emit = defineEmits<{
  (e: 'confirm', idFormacion: number): void
}>()

const open = (list: ActiveSchedule[]) => {
  formations.value = list
  baseModalRef.value?.openModal()
}

const close = () => {
  baseModalRef.value?.closeModal()
}

const select = (idFormacion: number) => {
  emit('confirm', idFormacion)
  close()
}

defineExpose({
  open,
  close
})
</script>
