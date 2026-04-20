<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f6fbf6_0%,#ffffff_34%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="SALIDA GENERAL DE APRENDICES"
      eyebrow="SENA | Control de salida"
    />

    <BarcodeScanner ref="scannerModal" @aprendiz-detectado="handleScanner" />

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <section class="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
        <aside class="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Resumen operativo</p>
          <div class="mt-4 grid gap-7">
            <div class="rounded-2xl bg-emerald-50 p-4">
              <p class="text-sm text-slate-500">Última salida visible</p>
              <p class="mt-1 font-robotoSlab text-xl font-bold text-slate-900">
                {{ latestAprendiz ? `${latestAprendiz.nombre} ${latestAprendiz.apellido}` : 'Sin salidas aún' }}
              </p>
              <p class="mt-1 text-sm text-slate-600">
                {{ latestAprendiz?.hora_salida || 'Esperando el próximo registro' }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <p class="text-sm text-slate-500">Sin detalle de máquina</p>
              <p class="mt-1 text-2xl font-bold text-slate-900">{{ noMachineCount }}</p>
              <p class="mt-1 text-sm text-slate-600">Movimientos sin equipo asociado en el detalle.</p>
            </div>
          </div>
        </aside>

        <article class="overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#0c6d36_0%,#178549_46%,#eef8f1_46%,#ffffff_100%)] p-6 text-white shadow-[0_22px_60px_rgba(15,107,63,0.16)]">
          <div class="flex flex-wrap items-start justify-between gap-6">
            <div class="max-w-2xl">
              <p class="mb-3 inline-flex rounded-full bg-white/14 px-4 py-1 text-sm font-semibold tracking-[0.18em] text-emerald-50">
                Flujo de salida
              </p>
              <h1 class="font-robotoSlab text-3xl font-bold leading-tight lg:text-4xl [text-shadow:0_2px_8px_rgba(0,0,0,0.4)]">
                Registro de salida ordenado, visible y conectado con el detalle de máquinas.
              </h1>
              <p class="mt-4 max-w-xl text-sm leading-6 text-[#0f172a] lg:text-base">
                Confirma salidas por escáner o de forma manual, consulta el historial inmediato y revisa los equipos asociados antes del cierre del movimiento.
              </p>
            </div>

            <div class="flex w-full justify-between gap-3 text-sm text-emerald-950">
              <div class="rounded-2xl bg-white/95 p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Salidas visibles</p>
                <p class="mt-2 text-3xl font-bold">{{ aprendizData.length }}</p>
                <p class="mt-1 text-sm text-slate-600">Aprendices registrados en el historial actual</p>
              </div>
              <div class="rounded-2xl bg-[#1a9551] p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white">Con máquina asociada</p>
                <p class="mt-2 text-3xl font-bold">{{ machineLinkedCount }}</p>
                <p class="mt-1 text-sm text-[#0f172a]">Registros con detalle disponible para consulta</p>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="grid gap-4 lg:grid-cols-[auto_1fr_auto_auto] lg:items-center">
        <ExitButton to="/" />

        <SearchBar v-model="queryAprendices" />

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
          text="Salida manual"
          variant="dark"
          class-button="min-w-[210px]"
        />
      </section>

      <section class="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div class="mb-5 flex flex-col gap-2 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Historial activo</p>
            <h2 class="font-robotoSlab text-2xl font-bold text-slate-900">Aprendices registrados en salida</h2>
          </div>
          <p class="text-sm text-slate-500">
            Consulta el detalle de máquinas cuando exista un registro asociado al aprendiz.
          </p>
        </div>

        <ExitAprendizTable :aprendiz-data="aprendizData" />
      </section>

      <ModalRegisterExitManual ref="modalManual" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import HeaderView from '@/layouts/HeaderView.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BarcodeScanner from '@/components/Library/BarcodeScanner.vue'
import ExitAprendizTable from '@/components/AprendizUI/ExitAprendizTable.vue'
import ModalRegisterExitManual from '@/components/AprendizUI/Modals/ModalRegisterExitManual.vue'
import codebar from '@/assets/Icons/barcodeScanner.png'
import add from '@/assets/Icons/add.png'
import { DetectExit } from '@/Services/DetectExits'
import { SearchAprendiz } from '@/Services/SearchAprendiz'
import { useExitAprendiz } from '@/composables/useExitAprendiz'
import { useNotifications } from '@/composables/useNotifications';
const {addNotification} = useNotifications()
const {
  HistorialSalidaAprendiz,
  AñadirSalidaAprendiz,
  aprendizData,
  latestAprendiz,
} = useExitAprendiz()

const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)
const modalManual = ref()
const queryAprendices = ref('')

const machineLinkedCount = computed(
  () => aprendizData.value.filter((aprendiz) => aprendiz.id_detallemaquina != null).length,
)

const noMachineCount = computed(
  () => aprendizData.value.filter((aprendiz) => aprendiz.id_detallemaquina == null).length,
)

const handleScanner = async (code: string) => {
  if (!code) return

  const estado = await DetectExit(code)

  const messages = {
    no_existe: 'El aprendiz no existe',
    ya_registrado: 'El aprendiz no tiene ingreso o ya registró salida',
  }

  try {
    if (estado === 'no_existe' || estado === 'ya_registrado') {
      scannerModal.value?.setResultMessage(messages[estado])
      addNotification(messages[estado],'warning')
      return
    }

    if (estado === 'error') {
      scannerModal.value?.setResultMessage('Error al procesar la salida')
      return
    }

    const registered = await AñadirSalidaAprendiz(code)

    scannerModal.value?.setResultMessage(
      registered ? 'Salida registrada correctamente' : 'Error al registrar la salida',
    )
  } finally {
    scannerModal.value?.closeScanner()
  }
}

const open = () => {
  scannerModal.value?.openScanner()
}

const openManual = () => {
  modalManual.value?.open()
}

onMounted(() => {
  HistorialSalidaAprendiz()
})

watch(queryAprendices, async (nuevoTexto) => {
  if (!nuevoTexto.trim()) {
    await HistorialSalidaAprendiz()
    return
  }

  const data = await SearchAprendiz(nuevoTexto, 'salida')
  aprendizData.value = data
})
</script>
