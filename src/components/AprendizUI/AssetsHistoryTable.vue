<template>
  <div class="overflow-x-auto rounded-[24px] border border-slate-100 bg-slate-50/70 p-2">
    <BaseTable>
      <BaseColumn row-class="bg-slate-900 text-center">
        <template v-if="selectedView === 'computers'">
          <BaseTableHead name="Marca" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="Serial" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="Ingreso" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="Salida" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="Propietario" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        </template>

        <template v-else>
          <BaseTableHead name="Tipo" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="Placa" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="Marca" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="Ingreso" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="Salida" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
          <BaseTableHead name="Propietario" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
        </template>
      </BaseColumn>

      <template v-if="selectedView === 'computers'">
        <BaseColumn
          v-for="computer in computerHistory"
          :key="computer.id_detallemaquina"
          row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
        >
          <td>{{ computer.marca }}</td>
          <td>{{ computer.serial }}</td>
          <td>{{ computer.documento }}</td>
          <td>{{ computer.hora_ingreso || '-' }}</td>
          <td>{{ computer.hora_salida || '-' }}</td>
          <td>
            <div class="flex justify-center">
              <BaseButtonOpen
                text="Ver propietario"
                variant="ghost"
                class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
                @click="emit('open-owner', computer.id_detallemaquina)"
              />
            </div>
          </td>
        </BaseColumn>
      </template>

      <template v-else>
        <BaseColumn
          v-for="vehicle in vehicleHistory"
          :key="vehicle.id_detallemaquina"
          row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
        >
          <td>{{ vehicle.tipo_vehiculo }}</td>
          <td>{{ vehicle.placa }}</td>
          <td>{{ vehicle.marca }}</td>
          <td>{{ vehicle.documento }}</td>
          <td>{{ vehicle.hora_ingreso || '-' }}</td>
          <td>{{ vehicle.hora_salida || '-' }}</td>
          <td>
            <div class="flex justify-center">
              <BaseButtonOpen
                text="Ver propietario"
                variant="ghost"
                class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
                @click="emit('open-owner', vehicle.id_detallemaquina)"
              />
            </div>
          </td>
        </BaseColumn>
      </template>
    </BaseTable>

    <div v-if="isLoading" class="px-4 py-10 text-center text-sm font-medium text-slate-500">
      Cargando historial de {{ selectedViewLabel.toLowerCase() }}...
    </div>

    <div v-else-if="loadError" class="px-4 py-10 text-center text-sm font-medium text-red-600">
      {{ loadError }}
    </div>

    <div v-else-if="activeVisibleCount === 0" class="px-4 py-10 text-center text-sm font-medium text-slate-500">
      No hay registros para los filtros actuales.
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseTable from '@/components/Tables/BaseTable.vue'
import BaseColumn from '@/components/Tables/BaseColumn.vue'
import BaseTableHead from '@/components/Tables/BaseTableHead.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import type {
  AssetView,
  ComputerHistoryRow,
  VehicleHistoryRow,
} from '@/types/assetsHistory.types'

defineProps<{
  selectedView: AssetView
  selectedViewLabel: string
  computerHistory: ComputerHistoryRow[]
  vehicleHistory: VehicleHistoryRow[]
  isLoading: boolean
  loadError: string
  activeVisibleCount: number
}>()

const emit = defineEmits<{
  (e: 'open-owner', idDetalleMaquina: number): void
}>()
</script>
