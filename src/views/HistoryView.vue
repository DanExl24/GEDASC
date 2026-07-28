<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_48%,#f1f8f2_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="REGISTRO HISTORICO DE INGRESO Y SALIDA"
      eyebrow="SENA | Reportes y consulta"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto grid w-full max-w-7xl gap-3 px-4 py-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.5fr_auto] lg:items-end lg:px-8">
        <!-- Selector Dinámico de Programa -->
        <div class="rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Programa</p>
          <select
            v-model="filters.Program"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">Todos los programas</option>
            <option
              v-for="prog in programasOpciones"
              :key="prog.id_programa"
              :value="prog.nombre_programa"
            >
              {{ prog.nombre_programa }}
            </option>
          </select>
        </div>

        <!-- Selector Dinámico de Ficha / Formación -->
        <div class="rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Ficha / Formación</p>
          <select
            v-model="filters.Ficha"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">Todas las fichas</option>
            <option
              v-for="ficha in fichasOpciones"
              :key="ficha.id_formacion"
              :value="ficha.id_formacion"
            >
              Ficha {{ ficha.id_formacion }} {{ ficha.nombre_programa ? `- ${ficha.nombre_programa}` : '' }}
            </option>
          </select>
        </div>

        <!-- Selector de Fecha -->
        <div class="rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Fecha</p>
          <BaseSelect
            v-model:model-value="filters.Date"
            :options="optionsDates"
            placeholder="Fecha"
            select-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </div>

          <SearchBar
            v-model="queryAprendices"
          />

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
          <HistoryAprendizTable
            :historial="historial"
            @open-machine-detail="handleOpenDetalleMaquina"
          />
        </div>
      </section>

      <ModalHistoryMachineDetails
        ref="modalDetalleMaquina"
        :detail="maquinaDetalle"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import HistoryAprendizTable from '@/components/AprendizUI/HistoryAprendizTable.vue'
import ModalHistoryMachineDetails from '@/components/AprendizUI/Modals/ModalHistoryMachineDetails.vue'
import HeaderView from '@/layouts/HeaderView.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'

import { optionsDates } from '@/constants/optionsDates'
import { optionsProgram } from '@/constants/optionsProgram'
import { useHistoryFilters } from '@/composables/History/useHistoryFilters'
import { useHistoryMachineDetail } from '@/composables/History/useHistoryMachineDetail'

const modalDetalleMaquina = ref()
const { historial, queryAprendices, filters, machineRegisteredCount, programasOpciones, fichasOpciones } =
  useHistoryFilters()
const { maquinaDetalle, openDetalleMaquina } = useHistoryMachineDetail()

const handleOpenDetalleMaquina = async (idDetalleMaquina: number) => {
  await openDetalleMaquina(idDetalleMaquina, () => {
    modalDetalleMaquina.value?.open()
  })
}
</script>
