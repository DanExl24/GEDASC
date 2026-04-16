<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_48%,#f1f8f2_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="REGISTRO HISTORICO DE INGRESO Y SALIDA"
      eyebrow="SENA | Reportes y consulta"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto grid w-full max-w-7xl gap-3 px-4 py-3 lg:grid-cols-[1fr_1fr_1.6fr_auto] lg:items-end lg:px-8">
        <div class="rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Programa</p>
          <BaseSelect
            v-model:model-value="filters.Program"
            :options="optionsProgram"
            placeholder="Programa de formacion"
            select-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div class="rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Fecha</p>
          <BaseSelect
            v-model:model-value="filters.Date"
            :options="optionsDates"
            placeholder="Fecha"
            select-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div class="rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Buscar aprendiz</p>
          <SearchBar
            v-model="queryAprendices"
            input-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <ExitButton
          to="/"
          button-class="flex h-11 w-11 items-center justify-center self-center rounded-2xl border border-emerald-200 bg-white shadow-none transition-transform duration-300 hover:scale-105"
        />
      </div>
    </section>

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
      <section class="grid gap-4">
        <article class="rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
          <div class="border-b border-emerald-100 bg-senaColor px-5 py-4 text-white lg:px-6">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Panel historico</p>
            <h1 class="mt-2 font-robotoSlab text-[1.7rem] font-bold leading-tight lg:text-[1.9rem]">Consulta y filtrado del sistema</h1>
            <p class="mt-2 max-w-3xl text-sm leading-5 text-emerald-50/90">
              Esta vista concentra reportes, filtros y resultados del historial de aprendices. No incluye acciones de registro, solo analisis e informacion.
            </p>
          </div>

          <div class="grid gap-3 p-4 md:grid-cols-2 lg:px-6 lg:py-4">
            <div class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Resultados visibles</p>
                <p class="font-robotoSlab text-2xl font-bold text-senaColor">{{ historial.length }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Registros obtenidos con los filtros actuales.</p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Con maquina asociada</p>
                <p class="font-robotoSlab text-2xl font-bold text-slate-900">{{ machineRegisteredCount }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Movimientos con detalle disponible.</p>
            </div>
          </div>
        </article>
      </section>

      <section class="rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
        <div class="flex flex-col gap-1 border-b border-emerald-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Resultados</p>
            <h2 class="mt-1 font-robotoSlab text-[1.45rem] font-bold text-slate-900">Historial de aprendices</h2>
          </div>
          <p class="text-sm text-slate-500">Vista informativa del comportamiento de ingresos, salidas y maquinas.</p>
        </div>

        <div class="p-4 lg:px-6 lg:py-5">
          <div class="overflow-x-auto rounded-[24px] border border-slate-100 bg-slate-50/70 p-2">
            <BaseTable>
              <BaseColumn row-class="bg-slate-900 text-center">
                <BaseTableHead name="Nombre" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                <BaseTableHead name="Apellido" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                <BaseTableHead name="Formacion" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
                <BaseTableHead name="Ingreso" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
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
                      @click="openDetalleMaquina(aprendiz.id_detallemaquina)"
                    />
                  </div>
                </td>
              </BaseColumn>
            </BaseTable>
          </div>
        </div>
      </section>

      <BaseModal
        ref="modalDetalleMaquina"
        title="Detalle de maquinas registradas"
        modal-class="my-6 w-full max-w-5xl overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
        header-class="relative flex items-center justify-center border-b border-emerald-100 bg-[linear-gradient(90deg,#ffffff_0%,#f3fbf5_40%,#e2f4e6_100%)] px-5 py-4 text-center font-robotoSlab text-lg font-bold text-slate-800"
        body-class="relative max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto px-4 py-4 lg:px-5"
      >
        <div class="grid gap-3 lg:grid-cols-3">
          <article
            v-if="maquinaDetalle.pc"
            class="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf8_100%)] p-3.5"
          >
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
                <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ maquinaDetalle.pc.modelo }}</p>
              </div>
              <div class="rounded-xl bg-slate-50 px-3 py-2">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Serial</p>
                <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ maquinaDetalle.pc.placa_serial }}</p>
              </div>
            </div>
          </article>

          <article
            v-if="maquinaDetalle.vh"
            class="rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7faf8_100%)] p-3.5"
          >
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
                <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ normalizeVehicleType(maquinaDetalle.vh.tipo_vehiculo) }}</p>
              </div>
              <div class="rounded-xl bg-slate-50 px-3 py-2">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Marca</p>
                <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ maquinaDetalle.vh.modelo }}</p>
              </div>
              <div class="rounded-xl bg-slate-50 px-3 py-2">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Placa</p>
                <p class="mt-0.5 text-sm font-semibold text-slate-900">{{ maquinaDetalle.vh.placa_serial }}</p>
              </div>
            </div>
          </article>

          <article
            v-if="maquinaDetalle.firma"
            class="rounded-[18px] border border-dashed border-emerald-200 bg-emerald-50 p-3.5"
          >
            <div class="flex items-center gap-3 border-b border-emerald-100 pb-2.5">
              <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[10px] font-bold uppercase tracking-[0.14em] text-senaColor">
                FIR
              </div>
              <div>
                <h3 class="font-robotoSlab text-base font-bold text-slate-900">Firma del aprendiz</h3>
                <p class="text-xs text-slate-600">Evidencia asociada al registro consultado.</p>
              </div>
            </div>

            <div class="mt-3 flex min-h-[180px] items-center justify-center rounded-[16px] border border-emerald-100 bg-white p-2">
              <img :src="maquinaDetalle.firma" class="max-h-40 w-auto rounded-lg" alt="Firma del aprendiz" />
            </div>
          </article>

          <div
            v-if="!maquinaDetalle.pc && !maquinaDetalle.vh && !maquinaDetalle.firma"
            class="rounded-[18px] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 lg:col-span-3"
          >
            No hay detalles registrados para este movimiento.
          </div>
        </div>
      </BaseModal>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import HeaderView from '@/layouts/HeaderView.vue'
import BaseTable from '@/components/Tables/BaseTable.vue'
import BaseColumn from '@/components/Tables/BaseColumn.vue'
import BaseTableHead from '@/components/Tables/BaseTableHead.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'

import { optionsDates } from '@/constants/optionsDates'
import { optionsProgram } from '@/constants/optionsProgram'
import { normalizeVehicleType } from '@/utils/vehicleType'

const API = import.meta.env.VITE_API_URL

const historial = ref<HistorialAprendiz[]>([])
const modalDetalleMaquina = ref()
const queryAprendices = ref('')
const maquinaDetalle = ref<DetalleMaquinas>({ pc: null, vh: null })

const filters = reactive({
  Date: 'TODAY',
  Program: 'ADSO',
})

interface HistorialAprendiz {
  id_ingreso: number
  id_aprendiz: number
  nombre: string
  apellido: string
  documento: string
  formacion: string
  hora_ingreso: string | null
  hora_salida: string | null
  id_detallemaquina: number | null
}

interface Computador {
  modelo: string
  placa_serial: string
}

interface Vehiculo {
  tipo_vehiculo: string
  modelo: string
  placa_serial: string
}

interface DetalleMaquinas {
  pc: Computador | null
  vh: Vehiculo | null
  firma?: string
}

const machineRegisteredCount = computed(
  () => historial.value.filter((item) => item.id_detallemaquina != null).length,
)

const getHistorial = async () => {
  const res = await fetch(`${API}/api/historico/historial`)
  const data: HistorialAprendiz[] = await res.json()
  historial.value = data
}

const getHistorialByFilters = async () => {
  try {
    const params = new URLSearchParams()

    if (filters.Date) params.append('date', filters.Date)
    if (filters.Program) params.append('program', filters.Program)
    if (queryAprendices.value) params.append('search', queryAprendices.value)

    const query = params.toString() ? `?${params.toString()}` : ''
    const res = await fetch(`${API}/api/historico/historialFechas${query}`)
    const data: HistorialAprendiz[] = await res.json()

    historial.value = data
  } catch (error) {
    console.error(error)
  }
}

const openDetalleMaquina = async (id_detallemaquina: number) => {
  try {
    const response = await fetch(`${API}/api/historico/historialMaquinas/${id_detallemaquina}`)
    const data = await response.json()

    if (!response.ok) {
      console.error(data.message)
      return
    }

    maquinaDetalle.value = data.result
    modalDetalleMaquina.value.openModal()
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  getHistorialByFilters()
})

watch(
  () => [filters.Date, filters.Program, queryAprendices.value],
  () => {
    if (filters.Date || filters.Program || queryAprendices.value) {
      getHistorialByFilters()
    } else {
      getHistorial()
    }
  },
)
</script>
