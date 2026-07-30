<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f5fbf5_0%,#ffffff_45%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="HISTORIAL DE ACTIVOS REGISTRADOS"
      eyebrow="SENA | Equipos y vehiculos"
    />

    <section class="sticky top-[89px] z-20 border-b border-emerald-100 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgba(15,107,63,0.06)]">
      <div class="mx-auto flex w-full max-w-7xl flex-wrap items-end gap-3 px-4 py-3 lg:flex-nowrap lg:px-8">
        <!-- Vista activa -->
        <article class="min-w-[200px] flex-[1.2] rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Vista activa</p>
          <div class="grid grid-cols-2 gap-2 rounded-[16px] bg-slate-100 p-1.5">
            <button
              type="button"
              :class="selectedView === 'computers' ? 'bg-senaColor text-white shadow-[0_10px_18px_rgba(15,107,63,0.2)]' : 'bg-transparent text-slate-600'"
              class="rounded-[14px] px-3 py-2.5 text-sm font-semibold transition"
              @click="selectedView = 'computers'"
            >
              Computadores
            </button>
            <button
              type="button"
              :class="selectedView === 'vehicles' ? 'bg-slate-900 text-white shadow-[0_10px_18px_rgba(15,23,42,0.18)]' : 'bg-transparent text-slate-600'"
              class="rounded-[14px] px-3 py-2.5 text-sm font-semibold transition"
              @click="selectedView = 'vehicles'"
            >
              Vehiculos
            </button>
          </div>
        </article>

        <!-- Fecha -->
        <article class="min-w-[130px] flex-[0.8] rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Fecha</p>
          <BaseSelect
            v-model:model-value="filters.Date"
            :options="optionsDates"
            placeholder="Fecha"
            select-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </article>

        <!-- Tipo Vehículo: solo en vista vehicles -->
        <article v-if="selectedView === 'vehicles'" class="min-w-[130px] flex-[0.8] rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Tipo Vehículo</p>
          <BaseSelect
            v-model:model-value="filters.vehicleType"
            :options="vehicleTypeOptions"
            placeholder="Todos los tipos"
            select-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </article>

        <!-- Búsqueda activa -->
        <article class="min-w-0 flex-[1.5] rounded-[18px] border border-slate-200 bg-white p-3">
          <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Busqueda activa</p>
          <SearchBar
            v-model="filters.searchValue"
            :placeholder="activeSearchPlaceholder"
            :with-container="false"
            :show-label="false"
            container-class="w-full"
            input-class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </article>

        <ExitButton
          to="/"
          button-class="flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-2xl border border-emerald-200 bg-white shadow-none transition-transform duration-300 hover:scale-105"
        />
      </div>

    </section>

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 lg:px-8 lg:py-5">
      <section class="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
        <article class="overflow-hidden rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
          <div :class="heroAccentClass" class="px-5 py-4 text-white lg:px-6">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Vista consolidada</p>
            <h1 class="mt-2 font-robotoSlab text-[1.7rem] font-bold leading-tight lg:text-[2rem]">
              {{ selectedViewTitle }}
            </h1>
            <p class="mt-2 max-w-3xl text-sm leading-6 text-white/90">
              {{ selectedViewDescription }}
            </p>
          </div>

          <div class="grid gap-3 p-4 md:grid-cols-2 lg:px-6 lg:py-5">
            <div class="rounded-[20px] border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Resultados visibles</p>
                <p class="font-robotoSlab text-2xl font-bold text-senaColor">{{ activeVisibleCount }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Registros obtenidos con los filtros actuales.</p>
            </div>

            <div class="rounded-[20px] border border-slate-200 bg-white px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-senaColor">Con salida asociada</p>
                <p class="font-robotoSlab text-2xl font-bold text-slate-900">{{ activeCompletedCount }}</p>
              </div>
              <p class="mt-1 text-sm text-slate-600">Movimientos que ya registran hora de salida.</p>
            </div>
          </div>
        </article>

        <section class="grid gap-3 sm:grid-cols-2">
          <article
            v-for="card in summaryCards"
            :key="card.label"
            :class="card.cardClass"
            class="rounded-[24px] border px-4 py-4 shadow-[0_16px_35px_rgba(15,23,42,0.06)]"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p :class="card.eyebrowClass" class="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  {{ card.eyebrow }}
                </p>
                <h2 :class="card.titleClass" class="mt-2 font-robotoSlab text-lg font-bold">{{ card.label }}</h2>
              </div>

              <div :class="card.badgeClass" class="flex h-10 w-10 items-center justify-center rounded-xl text-[11px] font-bold uppercase tracking-[0.14em]">
                {{ card.badge }}
              </div>
            </div>

            <p :class="card.valueClass" class="mt-5 font-robotoSlab text-4xl font-bold">{{ card.value }}</p>
            <p :class="card.descriptionClass" class="mt-2 text-sm leading-5">{{ card.description }}</p>
          </article>
        </section>
      </section>

      <section class="rounded-[28px] border border-emerald-200 bg-white shadow-[0_18px_45px_rgba(15,107,63,0.08)]">
        <div class="flex flex-col gap-1 border-b border-emerald-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between lg:px-6">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-senaColor">Resultados</p>
            <h2 class="mt-1 font-robotoSlab text-[1.45rem] font-bold text-slate-900">
              Historial de {{ selectedViewLabel.toLowerCase() }}
            </h2>
          </div>
          <p class="text-sm text-slate-500">
            {{ filters.searchValue.trim() ? 'Consulta refinada por texto sobre el historial cargado.' : 'Consulta general del historial seleccionado.' }}
          </p>
        </div>

        <div class="p-4 lg:px-6 lg:py-5">
          <AssetsHistoryTable
            :selected-view="selectedView"
            :selected-view-label="selectedViewLabel"
            :computer-history="filteredComputerHistory"
            :vehicle-history="filteredVehicleHistory"
            :is-loading="isLoading"
            :load-error="loadError"
            :active-visible-count="activeVisibleCount"
            @open-owner="handleOpenPropietario"
          />
        </div>
      </section>

      <ModalAssetOwnerDetails ref="modalPropietario" :detail="propietario" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HeaderView from '@/layouts/HeaderView.vue'
import AssetsHistoryTable from '@/components/AprendizUI/AssetsHistoryTable.vue'
import ModalAssetOwnerDetails from '@/components/AprendizUI/Modals/ModalAssetOwnerDetails.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'

import { optionsDates } from '@/constants/optionsDates'
import { optionsVehicle } from '@/constants/optionsVehicle'
import { useAssetsHistory } from '@/composables/History/useAssetsHistory'

// Opciones para el select de tipo de vehículo
const vehicleTypeOptions = [
  { label: 'Todos los tipos', value: '' },
  ...optionsVehicle,
]

const route = useRoute()
const router = useRouter()
const modalPropietario = ref()
const {
  selectedView,
  filters,
  propietario,
  filteredComputerHistory,
  filteredVehicleHistory,
  summaryCards,
  selectedViewLabel,
  selectedViewTitle,
  selectedViewDescription,
  heroAccentClass,
  activeSearchPlaceholder,
  activeVisibleCount,
  activeCompletedCount,
  isLoading,
  loadError,
  openPropietario,
} = useAssetsHistory(route, router)

const handleOpenPropietario = async (idDetalleMaquina: number) => {
  await openPropietario(idDetalleMaquina)
  modalPropietario.value?.open()
}
</script>
