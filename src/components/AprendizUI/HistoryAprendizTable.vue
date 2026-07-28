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
        <td>
          <div class="flex flex-col items-center gap-1">
            <span class="font-semibold text-slate-800">{{ aprendiz.documento }}</span>
            <div class="flex flex-wrap items-center justify-center gap-1">
              <span
                v-if="aprendiz.es_monitor"
                class="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-purple-700 uppercase"
              >
                MONITOR
              </span>
              <span
                v-if="Number(aprendiz.total_formaciones) > 1 || (aprendiz.todas_formaciones && aprendiz.todas_formaciones.length > 1)"
                class="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-pink-700 uppercase"
              >
                DOBLE FORMACIÓN
              </span>
            </div>
          </div>
        </td>
        <td>
          <div class="flex flex-col items-center gap-0.5 text-center">
            <!-- Programa y Ficha de esta sesión -->
            <span class="font-bold text-slate-800 text-xs uppercase leading-tight">
              {{ aprendiz.nombre_programa || aprendiz.formacion || 'Sin formación' }}
            </span>
            
            <div class="flex items-center gap-1.5 mt-0.5">
              <span v-if="aprendiz.id_formacion" class="text-[11px] font-bold text-purple-700">
                Ficha: {{ aprendiz.id_formacion }}
              </span>

              <!-- Formación Secundaria limpia (si aplica) -->
              <template v-if="aprendiz.todas_formaciones && aprendiz.todas_formaciones.length > 1">
                <template v-for="f in aprendiz.todas_formaciones" :key="f.id_formacion">
                  <span
                    v-if="f.id_formacion !== aprendiz.id_formacion"
                    class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200"
                    :title="f.nombre_programa"
                  >
                    +{{ f.id_formacion }}
                  </span>
                </template>
              </template>
            </div>

            <!-- Motivo si fue visita/monitoría -->
            <span v-if="aprendiz.motivo_visita" class="text-[10px] text-slate-500 font-medium italic mt-0.5">
              Motivo: {{ aprendiz.motivo_visita }}
            </span>
          </div>
        </td>
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
