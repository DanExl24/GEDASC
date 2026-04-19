<template>
  <div class="overflow-x-auto rounded-[24px] border border-slate-100 bg-slate-50/70 p-2">
    <BaseTable>
      <BaseColumn row-class="bg-slate-900 text-center">
        <BaseTableHead name="Nombre" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Apellido" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Formacion" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Ingreso" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Jornada" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Salida" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        <BaseTableHead name="Maquina" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
      </BaseColumn>

      <BaseColumn
        v-for="aprendiz in historial"
        :key="aprendiz.id_ingreso"
        row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
      >
        <td>{{ aprendiz.nombre }}</td>
        <td>{{ aprendiz.apellido }}</td>
        <td>{{ aprendiz.documento }}</td>
        <td>{{ aprendiz.formacion }}</td>
        <td>{{ aprendiz.hora_ingreso || '-' }}</td>
        <td>
          <JornadaBadge
            :aprendiz-id="aprendiz.id_aprendiz"
            :hour="aprendiz.hora_ingreso"
          />
        </td>
        <td>{{ aprendiz.hora_salida || '-' }}</td>
        <td>
          <div class="flex items-center justify-center">
            <BaseText
              v-if="aprendiz.id_detallemaquina == null"
              text="Sin registro"
              type="error"
              text-class="font-semibold"
            />

            <BaseButtonOpen
              v-else
              text="Ver detalle"
              variant="ghost"
              class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
              @click="emit('open-machine-detail', aprendiz.id_detallemaquina)"
            />
          </div>
        </td>
      </BaseColumn>
    </BaseTable>
  </div>
</template>

<script setup lang="ts">
import BaseTable from '@/components/Tables/BaseTable.vue'
import BaseColumn from '@/components/Tables/BaseColumn.vue'
import BaseTableHead from '@/components/Tables/BaseTableHead.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import JornadaBadge from '@/components/UI/JornadaBadge.vue'
import type { HistorialAprendiz } from '@/types/history.types'

defineProps<{
  historial: HistorialAprendiz[]
}>()

const emit = defineEmits<{
  (e: 'open-machine-detail', idDetalleMaquina: number): void
}>()
</script>
