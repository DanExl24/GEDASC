<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f4f8f4_0%,#ffffff_32%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="INGRESO GENERAL DE APRENDICES"
      eyebrow="SENA | Control de acceso"
    />

    <BarcodeScanner ref="scannerModal" @aprendiz-detectado="handleScanner" />

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <section class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article class="overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#0d7a3b_0%,#1c9a55_48%,#eef8f1_48%,#ffffff_100%)] p-6 text-white shadow-[0_22px_60px_rgba(15,107,63,0.18)]">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="max-w-2xl">
              <p class="mb-3 inline-flex rounded-full bg-white/14 px-4 py-1 text-sm font-semibold tracking-[0.18em] text-emerald-50">
                Control de acceso
              </p>
              <h1 class="font-robotoSlab text-3xl font-bold leading-tight lg:text-4xl [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]">
                Registro de ingreso claro, rápido y con trazabilidad de máquinas.
              </h1>
              <p class="mt-4 max-w-xl text-[#0f172a] text-sm leading-6 text-emerald-50/90 lg:text-base">
                Centraliza el ingreso de aprendices, permite búsqueda inmediata, registro manual y captura de equipos en un flujo más fácil de leer.
              </p>
            </div>

            <div class="flex justify-between w-full gap-3 text-sm text-emerald-950">
              <div class="rounded-2xl bg-white/95 p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Ingresos visibles</p>
                <p class="mt-2 text-3xl font-bold">{{ aprendizData.length }}</p>
                <p class="mt-1 text-sm text-slate-600">Aprendices en el historial actual</p>
              </div>
              <div class="rounded-2xl bg-[#1a9551] p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white">Pendientes de máquina</p>
                <p class="mt-2 text-3xl font-bold">{{ pendingMachineCount }}</p>
                <p class="mt-1 text-sm text-[#0f172a]">Registros sin equipo asociado</p>
              </div>
            </div>
          </div>
        </article>

        <aside class="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Resumen operativo</p>
          <div class="mt-4 grid gap-8">
            <div class="rounded-2xl bg-emerald-50 p-4">
              <p class="text-sm text-slate-500">Último registro visible</p>
              <p class="mt-1 font-robotoSlab text-xl font-bold text-slate-900">
                {{ latestAprendiz ? `${latestAprendiz.nombre} ${latestAprendiz.apellido}` : 'Sin registros aún' }}
              </p>

              <p class="mt-1 text-sm text-slate-600">
                {{ latestAprendiz?.hora_ingreso || 'Esperando el próximo ingreso' }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200 p-4 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <p class="text-sm text-slate-500">Máquinas registradas</p>
              <p class="mt-1 text-2xl font-bold text-slate-900">{{ registeredMachineCount }}</p>
              <p class="mt-1 text-sm text-slate-600">Equipos ya enlazados al historial mostrado.</p>
            </div>
          </div>
        </aside>
      </section>

      <section class="grid gap-4 lg:grid-cols-[auto_1fr_auto_auto] lg:items-center">

        <ExitButton
          to="/"
        />

        <SearchBar
          v-model="queryAprendices"
        />


        <BaseButtonOpen
          @click="open"
          :image="codebar"
          text="Escanear aprendiz"
          variant="green"
          class-button="min-w-[210px]"
        />

        <BaseButtonOpen
          @click="openManual"
          :image="add"
          text="Ingreso manual"
          variant="dark"
          class-button="min-w-[210px]"
        />
      </section>

      <section class="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div class="mb-5 flex flex-col gap-2 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Historial activo</p>
            <h2 class="font-robotoSlab text-2xl font-bold text-slate-900">Aprendices registrados en ingreso</h2>
          </div>
          <p class="text-sm text-slate-500">
            El primer registro pendiente puede asociar máquina directamente desde la tabla.
          </p>
        </div>

        <div class="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/70 p-2">
          <AprendizTable :aprendiz-data="aprendizData"/>
        </div>
      </section>

      <ModalRegisterManual ref="modalManual" class="debug-border"/>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import HeaderView from '@/layouts/HeaderView.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BarcodeScanner from '@/components/Library/BarcodeScanner.vue'
import ModalRegisterManual from '@/components/AprendizUI/Modals/ModalRegisterManual.vue'
import codebar from '@/assets/Icons/barcodeScanner.png'
import add from '@/assets/Icons/add.png'
import { DetectEntry } from '@/Services/DetectEntrys'
import { SearchAprendiz } from '@/Services/SearchAprendiz'
import { useAprendiz } from '@/composables/useAprendiz'
import AprendizTable from '@/components/AprendizUI/AprendizTable.vue'
const { HistorialIngresoAprendiz,AñadirIngresoAprendiz,aprendizData,latestAprendiz } = useAprendiz()
const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)
const queryAprendices = ref('')
const modalManual = ref()

const pendingMachineCount = computed(
  () => aprendizData.value.filter((aprendiz) => aprendiz.id_detallemaquina == null).length,
)
const registeredMachineCount = computed(
  () => aprendizData.value.filter((aprendiz) => aprendiz.id_detallemaquina != null).length,
)

const handleScanner = async (code: string) => {
  if (!code) return

  const estado = await DetectEntry(code)

  const messages = {
    no_existe: 'El aprendiz no existe',
    ya_registrado: 'El aprendiz ya está registrado'
  }

  try{

    if (estado === 'no_existe' || estado === 'ya_registrado') {
      scannerModal.value?.setResultMessage(messages[estado])
      return
    }

    await AñadirIngresoAprendiz(code)

  } finally {
    scannerModal.value?.closeScanner()
  }
}



const open = () => {
  scannerModal.value?.openScanner()
}

const openManual = () => {
  modalManual.value.open()
}

onMounted(() => {
  HistorialIngresoAprendiz()
})

watch(queryAprendices, async (nuevoTexto) => {
  if (!nuevoTexto.trim()) {
    await HistorialIngresoAprendiz()
    return
  }

  const data = await SearchAprendiz(nuevoTexto, 'ingreso')
  aprendizData.value = data
})



</script>
