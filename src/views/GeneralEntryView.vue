<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f4f8f4_0%,#ffffff_32%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="CONTROL DE ACCESO Y SALIDAS (UNIFICADO)"
      eyebrow="SENA | Registro de accesos"
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
                Registro de acceso automático, rápido y con trazabilidad de máquinas.
              </h1>
              <p class="mt-4 max-w-xl text-[#0f172a] text-sm leading-6 text-slate-900 lg:text-base">
                Centraliza los ingresos y salidas en un único escaneo. El sistema detecta y procesa automáticamente la sesión activa y gestiona los equipos.
              </p>
            </div>
            <div class="flex justify-between w-full gap-3 text-sm text-emerald-950">
              <div class="rounded-2xl bg-white/95 p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  {{ activeTab === 'ingresos' ? 'Ingresos visibles' : 'Salidas visibles' }}
                </p>
                <p class="mt-2 text-3xl font-bold">
                  {{ activeTab === 'ingresos' ? entryData.length : exitData.length }}
                </p>
                <p class="mt-1 text-sm text-slate-600">Aprendices en el historial actual</p>
              </div>
              <div class="rounded-2xl bg-[#1a9551] p-4 shadow-lg">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white">Sin máquina</p>
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
              <p class="text-sm text-slate-500">
                {{ activeTab === 'ingresos' ? 'Último ingreso' : 'Última salida' }}
              </p>
              <p class="mt-1 font-robotoSlab text-xl font-bold text-slate-900">
                {{ activeTab === 'ingresos' 
                  ? (latestEntry ? `${latestEntry.nombre} ${latestEntry.apellido}` : 'Sin ingresos aún') 
                  : (latestExit ? `${latestExit.nombre} ${latestExit.apellido}` : 'Sin salidas aún') }}
              </p>

              <p class="mt-1 text-sm text-slate-600">
                {{ activeTab === 'ingresos' 
                  ? (latestEntry?.hora_ingreso || 'Esperando el próximo ingreso') 
                  : (latestExit?.hora_salida || 'Esperando la próxima salida') }}
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
          :disabled="jornada.isSystemLocked"
        />

        <BaseButtonOpen
          @click="openManual"
          :image="add"
          text="Registro manual"
          variant="dark"
          class-button="min-w-[210px]"
          :disabled="jornada.isSystemLocked"
        />
      </section>

      <section class="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div class="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Historial activo</p>
            <h2 class="font-robotoSlab text-2xl font-bold text-slate-900">
              {{ activeTab === 'ingresos' ? 'Historial de Ingresos del Día' : 'Historial de Salidas del Día' }}
            </h2>
          </div>
          
          <!-- TOGGLE TABS -->
          <div class="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              @click="activeTab = 'ingresos'"
              :class="activeTab === 'ingresos' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'"
              class="rounded-lg px-4 py-1.5 text-sm transition cursor-pointer"
            >
              Ingresos
            </button>
            <button
              @click="activeTab = 'salidas'"
              :class="activeTab === 'salidas' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'"
              class="rounded-lg px-4 py-1.5 text-sm transition cursor-pointer"
            >
              Salidas
            </button>
          </div>
        </div>

        <div class="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/70 p-2">
          <AprendizTable
            v-if="activeTab === 'ingresos'"
            :aprendiz-data="entryData"
            @registrar-salida="handleManualSalida"
          />
          <ExitAprendizTable
            v-else
            :aprendiz-data="exitData"
          />
        </div>
      </section>

      <ModalRegisterManual ref="modalManual" class="debug-border" @submit-manual="handleScanner"/>
      <ModalConfirm
        ref="modalConfirmMonitor"
        title="Tipo de Ingreso"
        sub-title="El aprendiz es monitor. Seleccione el tipo de actividad para esta sesión."
        if-yes="Monitoría"
        if-no="Formación"
        @confirm="registrarIngresoMonitor('monitoria')"
        @cancel="registrarIngresoMonitor('formacion')"
      />
      <ModalMachineDetails
        v-if="currentAprendizId"
        ref="modalMachineDetails"
        :id_aprendiz="currentAprendizId"
        @retired="handleMachineRetired"
      />
      <ModalReentryReason
        ref="modalReentry"
        @confirm="handleReentryConfirm"
      />
      <ModalSelectFormation
        ref="modalSelectFormationRef"
        @confirm="handleFormationSelected"
      />
      <ModalVisitReason
        ref="modalVisitReasonRef"
        @confirm="handleVisitReasonConfirmed"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, nextTick } from 'vue'
import HeaderView from '@/layouts/HeaderView.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BarcodeScanner from '@/components/Library/BarcodeScanner.vue'
import ModalRegisterManual from '@/components/AprendizUI/Modals/ModalRegisterManual.vue'
import ModalConfirm from '@/components/AprendizUI/Modals/ModalConfirm.vue'
import ModalMachineDetails from '@/components/AprendizUI/Modals/ModalMachineDetails.vue'
import ModalReentryReason from '@/components/AprendizUI/Modals/ModalReentryReason.vue'
import ModalSelectFormation from '@/components/AprendizUI/Modals/ModalSelectFormation.vue'
import ModalVisitReason from '@/components/AprendizUI/Modals/ModalVisitReason.vue'
import codebar from '@/assets/Icons/barcodeScanner.png'
import add from '@/assets/Icons/add.png'
import { DetectEntry } from '@/Services/DetectEntrys'
import { SearchAprendiz } from '@/Services/SearchAprendiz'
import type { Aprendiz } from '@/types/aprendiz.types'
import { useAprendiz } from '@/composables/useAprendiz'
import { useExitAprendiz } from '@/composables/useExitAprendiz'
import AprendizTable from '@/components/AprendizUI/AprendizTable.vue'
import ExitAprendizTable from '@/components/AprendizUI/ExitAprendizTable.vue'
import { useNotifications } from '@/composables/useNotifications';
import { useJornadaStore } from '@/stores/jornada'

const jornada = useJornadaStore()
const {addNotification} = useNotifications()

const {
  HistorialIngresoAprendiz,
  AñadirIngresoAprendiz,
  aprendizData: entryData,
  latestAprendiz: latestEntry
} = useAprendiz()

const {
  HistorialSalidaAprendiz,
  aprendizData: exitData,
  latestAprendiz: latestExit
} = useExitAprendiz()

const activeTab = ref<'ingresos' | 'salidas'>('ingresos')
const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)
const queryAprendices = ref('')
const modalManual = ref()
const tempScannedCode = ref('')
const modalConfirmMonitor = ref<InstanceType<typeof ModalConfirm> | null>(null)
const modalMachineDetails = ref<InstanceType<typeof ModalMachineDetails> | null>(null)
const modalReentry = ref<InstanceType<typeof ModalReentryReason> | null>(null)
const modalSelectFormationRef = ref<InstanceType<typeof ModalSelectFormation> | null>(null)
const modalVisitReasonRef = ref<InstanceType<typeof ModalVisitReason> | null>(null)

const isTempMonitor = ref(false)
const currentAprendizId = ref<number | null>(null)

// Flow Context Variables
const tempIsReentry = ref(false)
const tempIsMonitor = ref(false)
const tempMatchingFormations = ref<any[]>([])
const tempAllActiveFormations = ref<any[]>([])

const selectedTipoSesion = ref<'formacion' | 'monitoria'>('formacion')
const selectedIdFormacion = ref<number | undefined>(undefined)
const selectedMotivoVisita = ref<string | undefined>(undefined)

const tipoSesionResolved = ref(false)
const reentryReasonResolved = ref(false)
const reentryReasonText = ref('')

const pendingMachineCount = computed(
  () => entryData.value.filter((aprendiz) => aprendiz.id_detallemaquina == null && !aprendiz.hora_salida).length,
)
const registeredMachineCount = computed(
  () => entryData.value.filter((aprendiz) => aprendiz.id_detallemaquina != null && !aprendiz.hora_salida).length,
)

const evaluateNextStep = async () => {
  // Step 1: Monitor Check
  if (tempIsMonitor.value && !tipoSesionResolved.value) {
    modalConfirmMonitor.value?.open()
    return
  }

  // Step 2: Schedule & Formation Check
  if (selectedTipoSesion.value === 'formacion') {
    if (selectedIdFormacion.value === undefined && selectedMotivoVisita.value === undefined) {
      if (tempMatchingFormations.value.length === 0) {
        // Outside schedule: prompt for reason for visit
        modalVisitReasonRef.value?.open()
        return
      } else if (tempMatchingFormations.value.length === 1) {
        // Match exactly 1
        selectedIdFormacion.value = tempMatchingFormations.value[0].id_formacion
      } else {
        // Overlap: prompt selection
        modalSelectFormationRef.value?.open(tempMatchingFormations.value)
        return
      }
    }
  }

  // Step 3: Reentry Check
  if (tempIsReentry.value && !reentryReasonResolved.value) {
    modalReentry.value?.open()
    return
  }

  // Step 4: Finalize
  await finalizeEntry()
}

const finalizeEntry = async () => {
  try {
    const validacion = await AñadirIngresoAprendiz(
      tempScannedCode.value,
      selectedTipoSesion.value,
      reentryReasonText.value || undefined,
      selectedIdFormacion.value,
      selectedMotivoVisita.value
    )
    if (validacion) {
      addNotification('Ingreso Registrado', 'success')
      await HistorialIngresoAprendiz()
      await HistorialSalidaAprendiz()
    }
  } finally {
    tempScannedCode.value = ''
    tempIsReentry.value = false
    tempIsMonitor.value = false
    tempMatchingFormations.value = []
    tempAllActiveFormations.value = []
    selectedTipoSesion.value = 'formacion'
    selectedIdFormacion.value = undefined
    selectedMotivoVisita.value = undefined
    tipoSesionResolved.value = false
    reentryReasonResolved.value = false
    reentryReasonText.value = ''
    scannerModal.value?.closeScanner()
  }
}

const registrarIngresoMonitor = async (tipoSesion: 'formacion' | 'monitoria') => {
  selectedTipoSesion.value = tipoSesion
  tipoSesionResolved.value = true
  modalConfirmMonitor.value?.close()
  await evaluateNextStep()
}

const handleReentryConfirm = async (reason: string) => {
  reentryReasonText.value = reason
  reentryReasonResolved.value = true
  modalReentry.value?.close()
  await evaluateNextStep()
}

const handleFormationSelected = async (idFormacion: number) => {
  selectedIdFormacion.value = idFormacion
  await evaluateNextStep()
}

const handleVisitReasonConfirmed = async (reason: string) => {
  selectedMotivoVisita.value = reason
  await evaluateNextStep()
}

const handleMachineRetired = async () => {
  if (tempScannedCode.value) {
    // If retiring machine, they are exiting, so no schedule checks needed
    const validacion = await AñadirIngresoAprendiz(tempScannedCode.value)
    if (validacion) {
      addNotification('Salida Registrada (con Retiro de Equipo)', 'success')
      await HistorialSalidaAprendiz()
    }
    tempScannedCode.value = ''
  }
  modalMachineDetails.value?.close()
  scannerModal.value?.closeScanner()
}

const handleManualSalida = async (aprendiz: Aprendiz) => {
  const code = aprendiz.documento
  if (!code) return

  const res = await DetectEntry(code)

  if (res.status === 'no_existe' || res.status === 'error') {
    addNotification('Error al procesar el aprendiz', 'warning')
    return
  }

  if (res.activeSession) {
    if (res.hasMachine) {
      tempScannedCode.value = code
      currentAprendizId.value = res.id_aprendiz || null
      await nextTick()
      if (currentAprendizId.value && res.id_detallemaquina) {
        await modalMachineDetails.value?.load(res.id_detallemaquina)
        modalMachineDetails.value?.open()
      }
      return
    }

    const validacion = await AñadirIngresoAprendiz(code)
    if (validacion) {
      addNotification('Salida Registrada', 'success')
      await HistorialSalidaAprendiz()
    }
  }
}

const handleScanner = async (code: string) => {
  if (!code) return

  const res = await DetectEntry(code)

  const messages = {
    no_existe: 'El aprendiz no existe',
    error: 'Error en la verificación'
  }

  if (res.status === 'no_existe' || res.status === 'error') {
    const msg = messages[res.status] || 'Error al verificar'
    scannerModal.value?.setResultMessage(msg)
    addNotification(msg, 'warning')
    scannerModal.value?.closeScanner()
    return
  }

  // 1️⃣ CASO: Sesión Activa -> REGISTRAR SALIDA
  if (res.activeSession) {
    if (res.hasMachine) {
      tempScannedCode.value = code
      currentAprendizId.value = res.id_aprendiz || null
      await nextTick()
      if (currentAprendizId.value && res.id_detallemaquina) {
        await modalMachineDetails.value?.load(res.id_detallemaquina)
        modalMachineDetails.value?.open()
      }
      return
    }

    const validacion = await AñadirIngresoAprendiz(code)
    if (validacion) {
      addNotification('Salida Registrada', 'success')
      await HistorialSalidaAprendiz()
    }
    scannerModal.value?.closeScanner()
    return
  }

  // 2️⃣ CASO: Sin Sesión Activa -> REGISTRAR INGRESO
  tempScannedCode.value = code
  tempIsMonitor.value = res.es_monitor || false
  tempIsReentry.value = res.isReentry || false
  tempMatchingFormations.value = res.schedule?.matchingFormations || []
  tempAllActiveFormations.value = res.schedule?.allActiveFormations || []

  // Reset flow
  selectedTipoSesion.value = 'formacion'
  selectedIdFormacion.value = undefined
  selectedMotivoVisita.value = undefined
  tipoSesionResolved.value = false
  reentryReasonResolved.value = false
  reentryReasonText.value = ''

  await evaluateNextStep()
}



const open = () => {
  scannerModal.value?.openScanner()
}

const openManual = () => {
  modalManual.value.open()
}

onMounted(() => {
  HistorialIngresoAprendiz()
  HistorialSalidaAprendiz()
})

watch([queryAprendices, activeTab], async ([nuevoTexto, tab]) => {
  const text = nuevoTexto.trim()
  if (tab === 'ingresos') {
    if (!text) {
      await HistorialIngresoAprendiz()
    } else {
      const data = await SearchAprendiz(text, 'ingreso')
      entryData.value = data
    }
  } else {
    if (!text) {
      await HistorialSalidaAprendiz()
    } else {
      const data = await SearchAprendiz(text, 'salida')
      exitData.value = data
    }
  }
})



</script>
