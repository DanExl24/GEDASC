<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f4f8f4_0%,#ffffff_32%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="INGRESO GENERAL DE APRENDICES"
      eyebrow="SENA | Control de acceso"
    />

    <img
      v-if="firmaTemporal && machineModalOpen"
      :src="firmaTemporal"
      class="fixed top-24 right-8 z-[9999] hidden w-40 rounded-2xl border border-emerald-100 bg-white p-2 shadow-2xl lg:block"
      alt="Vista previa de firma"
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
          <BaseTable>
            <BaseColumn row-class="bg-slate-900 text-center">
              <BaseTableHead name="Nombre" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="Apellido" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="Formación" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="Hora de ingreso" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="Registro de máquina" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
            </BaseColumn>

            <BaseColumn
              v-for="(aprendiz, index) in aprendizData"
              :key="aprendiz.id_aprendiz"
              row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
            >
              <td>{{ aprendiz.nombre }}</td>
              <td>{{ aprendiz.apellido }}</td>
              <td>{{ aprendiz.documento }}</td>
              <td>{{ aprendiz.formacion }}</td>
              <td>{{ aprendiz.hora_ingreso }}</td>
              <td>
                <div class="flex items-center justify-center">
                  <BaseButtonOpen
                    v-if="index === 0 && aprendiz.id_detallemaquina == null && !aprendiz.hora_salida"
                    @click="openMachine(aprendiz)"
                    text="Registrar máquina"
                    class-button="min-h-[40px] rounded-xl border-blue-700 bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-none"
                  />
                  <BaseText
                    v-else-if="aprendiz.id_detallemaquina == null"
                    text="No registrada"
                    type="error"
                    text-class="font-semibold"
                  />
                  <BaseButtonOpen
                    v-else-if="aprendiz.id_detallemaquina != null"
                    text="Ver detalle"
                    variant="ghost"
                    class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
                    @click="openDetalleMaquina(aprendiz.id_aprendiz)"
                  />
                  <BaseText
                    v-else-if="firmaTemporal"
                    text="Firma registrada"
                    type="success"
                    text-class="font-semibold"
                  />
                </div>
              </td>
            </BaseColumn>
          </BaseTable>
        </div>
      </section>

      <ModalRegisterManual ref="modalManual" class="debug-border"/>

      <BaseModal
        ref="modalMachine"
        @close="cerrarModalFirma"
        :title="`Registro de máquina de ${aprendizMachine?.nombre || 'aprendiz'}`"
      >
        <div class="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-slate-600">
          Registre el equipo asociado al ingreso. Si ya existe una firma capturada desde móvil, se mostrará una confirmación antes de enviar el formulario.
        </div>

        <BaseForm method="POST" :submit="() => submitMachine(aprendizMachine?.id_aprendiz)">
          <BaseSelect
            :disabled="maquinaRegistrada.pc || maquinaRegistrada.vh"
            placeholder="Tipo de máquina"
            v-model:model-value="formMachine.TipoMaquina"
            :options="optionsMachine"
          />
          <BaseSelect
            v-if="formMachine.TipoMaquina === 'vh'"
            placeholder="Tipo de vehículo"
            v-model:model-value="formMachine.tipoVehiculo"
            :options="optionsVehicle"
          />
          <BaseField
            v-model="formMachine.modeloMaquina"
            label="Marca de la máquina"
            place-holder="Marca"
            type="text"
          />
          <BaseField
            v-model="formMachine.placaSerial"
            :max-length="formMachine.TipoMaquina === 'vh' ? 7 : 100"
            label="Placa o serial"
            place-holder="Placa o serial"
            type="text"
          />

          <BaseText :text="displayMachineMessage" :type="mensajeMachine.type" text-class="text-sm font-medium" />

          <BaseButtonOpen
            v-if="!firmaTemporal"
            class-button="rounded-2xl border-orange-500 bg-orange-500 px-4 py-3 text-white shadow-none"
            text="Capturar firma"
            @click="openFirma"
          />
          <BaseText
            v-if="firmaTemporal"
            text="Firma ya registrada"
            type="success"
            text-class="font-semibold"
          />

          <BaseButton
            text="Añadir máquina"
            type="submit"
            button-class="mt-2 rounded-2xl !bg-emerald-700 shadow-[0_14px_30px_rgba(15,107,63,0.18)]"
          />
        </BaseForm>
      </BaseModal>

      <BaseModal ref="machineConfirmModal" title="Registrar otra máquina">
        <div class="flex flex-col items-center gap-4 rounded-2xl bg-slate-50 p-5 text-center">
          <BaseText
            :text="confirmMessage"
            type="success"
            text-class="text-center font-semibold"
          />

          <div class="flex flex-wrap justify-center gap-3">
            <BaseButtonOpen
              text="Sí, registrar"
              variant="green"
              class-button="rounded-2xl px-4 py-3"
              @click="registrarOtra"
            />

            <BaseButtonOpen
              text="No, finalizar"
              variant="danger"
              class-button="rounded-2xl px-4 py-3"
              @click="finalizarRegistro"
            />
          </div>
        </div>
      </BaseModal>

      <BaseModal ref="machineOtroAprendiz" title="Esta máquina ya tiene un dueño. ¿Deseas prestarla?">
        <div class="flex flex-col items-center gap-4 rounded-2xl bg-slate-50 p-5 text-center">
          <BaseText
            :text="confirmMessage"
            type="success"
            text-class="text-center font-semibold"
          />

          <div class="flex flex-wrap justify-center gap-3">
            <BaseButtonOpen
              text="Sí, quiero prestarla"
              variant="green"
              class-button="rounded-2xl px-4 py-3"
              @click="permisoDeMaquina(true)"
            />

            <BaseButtonOpen
              text="No, no la quiero prestar"
              variant="danger"
              class-button="rounded-2xl px-4 py-3"
              @click="permisoDeMaquina(false)"
            />

            <BaseText
              v-if="incosistenciaMaquina"
              text="Esta maquina ya fue prestada Hoy"
              type="error"
              text-class="font-semibold"
            />
          </div>
        </div>
      </BaseModal>

      <BaseModal ref="modalDetalleMaquina" title="Máquinas registradas">
        <div class="grid gap-4">
          <div v-if="maquinaDetalle.pc" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 class="font-robotoSlab text-lg font-bold text-slate-900">Computador</h3>
            <BaseText type="success" :text="`Marca: ${maquinaDetalle.pc.modelo}`" />
            <BaseText type="success" :text="`Serial: ${maquinaDetalle.pc.placa_serial}`" />
          </div>

          <div v-if="maquinaDetalle.vh" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 class="font-robotoSlab text-lg font-bold text-slate-900">Vehículo</h3>
            <BaseText type="success" :text="`Tipo: ${normalizeVehicleType(maquinaDetalle.vh.tipo_vehiculo)}`" />
            <BaseText type="success" :text="`Marca: ${maquinaDetalle.vh.modelo}`" />
            <BaseText type="success" :text="`Placa: ${maquinaDetalle.vh.placa_serial}`" />
          </div>

          <div v-if="maquinaDetalle.firma" class="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4">
            <h3 class="mb-2 font-semibold text-slate-900">Firma del aprendiz</h3>
            <img :src="maquinaDetalle.firma" class="w-48 rounded-xl border bg-white" alt="Firma del aprendiz" />
          </div>
        </div>
      </BaseModal>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import router from '@/router'
import HeaderView from '@/layouts/HeaderView.vue'
import ExitButton from '@/components/UI/ExitButton.vue'
import SearchBar from '@/components/UI/SearchBar.vue'
import BaseTable from '@/components/Tables/BaseTable.vue'
import BaseColumn from '@/components/Tables/BaseColumn.vue'
import BaseTableHead from '@/components/Tables/BaseTableHead.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BarcodeScanner from '@/components/Library/BarcodeScanner.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import BaseForm from '@/components/Forms/BaseForm.vue'
import BaseField from '@/components/Forms/BaseField.vue'
import BaseButton from '@/components/Buttons/BaseButton.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseSelect from '@/components/Forms/BaseSelect.vue'
import ModalRegisterManual from '@/components/AprendizUI/Modals/ModalRegisterManual.vue'

import codebar from '@/assets/Icons/barcodeScanner.png'
import add from '@/assets/Icons/add.png'

import { DetectEntry } from '@/Services/DetectEntrys'
import { SearchAprendiz } from '@/Services/SearchAprendiz'
import { API_URL } from '@/config/network'
import { connectSocket } from '@/socket'
import { optionsMachine } from '@/constants/optionsMachine'
import { optionsVehicle } from '@/constants/optionsVehicle'
import { normalizeVehicleType } from '@/utils/vehicleType'
const socket = connectSocket()
const API = API_URL

export interface Aprendiz {
  id_aprendiz: number
  nombre: string
  apellido: string
  documento: string
  formacion: string
  hora_ingreso?: string
  hora_salida?: string
  id_detallemaquina?: number
}

interface Computador {
  modelo: string
  placa_serial: string
  firma: string
}

interface Vehiculo {
  tipo_vehiculo: string
  modelo: string
  placa_serial: string
  firma: string
}



interface DetalleMaquinas {
  pc: Computador | null
  vh: Vehiculo | null
  firma?: string
}

const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)
const modalMachine = ref()
const modalFirma = ref()
const machineConfirmModal = ref()
const modalDetalleMaquina = ref()
const machineOtroAprendiz = ref()
const modalManual = ref()
const route = useRoute()
const aprendizData = ref<Aprendiz[]>([])
const aprendizMachine = ref<Aprendiz>()
const queryAprendices = ref('')
const firmaTemporal = ref('')
const machineModalOpen = ref(false)
const dobleMaquina = ref(false)
const submittedMachine = ref(false)
const incosistenciaMaquina = ref()

const maquinaRegistrada = reactive({ pc: false, vh: false })

const formMachine = reactive({ modeloMaquina: '', TipoMaquina: '', tipoVehiculo: '', placaSerial: '' })


const mensajeMachine = ref({ message: '', type: 'error' as 'error' | 'success' })
const maquinaDetalle = ref<DetalleMaquinas>({ pc: null, vh: null })

const latestAprendiz = computed(() => aprendizData.value[0] ?? null)
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
    }

    await addEntry(code)

  } finally {
    scannerModal.value?.closeScanner()
  }
}

const addEntry = async (code: string) => {
  if (!code) return

  try {
    const response = await fetch(`${API}/api/registroIngresos/addEntry/${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 409) {
        console.log('Info:', data.message)
      }
      return
    }

    console.log('Ingreso registrado:', data)
    await HistorialIngresos()
    return true
  } catch (error) {
    console.error(error)
  }
}

const HistorialIngresos = async () => {
  try {
    const response = await fetch(`${API}/api/registroIngresos/historial`)
    const data = await response.json()

    aprendizData.value = data as Aprendiz[]
  } catch (error) {
    console.error(error)
  }
}

socket.on('firmaRegistrada', ({ documento, firma }: { documento: string; firma: string }) => {
  console.log('Firma recibida del movil:' + documento + firma)

  firmaTemporal.value = firma
  mensajeMachine.value = {
    message: 'Firma registrada con exito',
    type: 'success',
  }

  router.push('/general-entry')

  setTimeout(() => {
    mensajeMachine.value = {
      message: '',
      type: 'success',
    }
  }, 1000)

  submittedMachine.value = false
})

const resetMachineForm = () => {
  formMachine.TipoMaquina = ''
  formMachine.tipoVehiculo = ''
  formMachine.modeloMaquina = ''
  formMachine.placaSerial = ''

  firmaTemporal.value = ''

  maquinaRegistrada.pc = false
  maquinaRegistrada.vh = false

  dobleMaquina.value = false
  submittedMachine.value = false
  mensajeMachine.value = { message: '', type: 'error' }
  machineModalOpen.value = false
}

const open = () => {
  scannerModal.value?.openScanner()
}

const openManual = () => {
  console.log('modal ref:', modalManual.value)
  modalManual.value?.open?.()
}

const openMachine = (aprendiz: Aprendiz) => {
  machineModalOpen.value = true
  firmaTemporal.value = ''
  maquinaRegistrada.pc = false
  maquinaRegistrada.vh = false
  aprendizMachine.value = aprendiz
  modalMachine.value.openModal()

  for (const key in formMachine) {
    formMachine[key as keyof typeof formMachine] = ''
  }
}

const clearMachineForm = () => {
    for (const key in formMachine) {
    formMachine[key as keyof typeof formMachine] = ''
  }
}

const openFirma = () => {
  if (!aprendizMachine.value) return

  socket.emit('abrirFirmaEnMovil', { documento: aprendizMachine.value.documento })
}

const openDetalleMaquina = async (id_aprendiz: number) => {
  try {
    const response = await fetch(`${API}/api/registroIngresos/detalleMaquinas/${id_aprendiz}`)
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

const registrarOtra = () => {
  dobleMaquina.value = true
  machineConfirmModal.value.closeModal()

  if (maquinaRegistrada.pc) formMachine.TipoMaquina = 'vh'
  if (maquinaRegistrada.vh) formMachine.TipoMaquina = 'pc'

  modalMachine.value.openModal()
}

const finalizarRegistro = () => {
  dobleMaquina.value = false
  machineConfirmModal.value.closeModal()
  resetMachineForm()
}

const cerrarModalFirma = () => {
  modalMachine.value.closeModal()

  socket.emit('cerrarFirmaEnMovil', {
    documento: aprendizMachine.value?.documento,
  })
}




const buildMachinePayload = () => ({
  tipoMaquina: formMachine.TipoMaquina,
  tipoVehiculo: formMachine.tipoVehiculo,
  modelo: formMachine.modeloMaquina.toUpperCase(),
  placaSerial: formMachine.placaSerial.toUpperCase(),
  firma: firmaTemporal.value,
})

const validateMachineForm = () => {
  if (!formMachine.TipoMaquina) {
    mensajeMachine.value = { message: 'Debe seleccionar el tipo de maquina', type: 'error' }
    return false
  }

  if (formMachine.TipoMaquina !== 'vh') {
    formMachine.tipoVehiculo = ''
  }

  if (formMachine.TipoMaquina === 'pc' && (!formMachine.modeloMaquina || !formMachine.placaSerial)) {
    mensajeMachine.value = { message: 'Todos los campos son obligatorios', type: 'error' }
    return false
  }

  if (
    formMachine.TipoMaquina === 'vh' &&
    (!formMachine.tipoVehiculo || !formMachine.modeloMaquina || !formMachine.placaSerial)
  ) {
    mensajeMachine.value = { message: 'Todos los campos son obligatorios', type: 'error' }
    return false
  }

  if (!firmaTemporal.value) {
    mensajeMachine.value = { message: 'Debe ingresar una firma', type: 'error' }
    return false
  }

  return true
}

const handleMachineSuccess = async () => {
  mensajeMachine.value = { message: 'Maquina ingresada con exito', type: 'success' }
  await HistorialIngresos()

  if (formMachine.TipoMaquina === 'pc') maquinaRegistrada.pc = true
  if (formMachine.TipoMaquina === 'vh') maquinaRegistrada.vh = true

  setTimeout(() => {
    machineModalOpen.value = false
    modalMachine.value.closeModal()

    if (!dobleMaquina.value && maquinaRegistrada.pc !== maquinaRegistrada.vh) {
      machineConfirmModal.value.openModal()
    } else {
      resetMachineForm()
    }

    submittedMachine.value = false
  }, 1000)
}

type MachineResponse = {
  message? : string,
  tipoEquipo? : "vehiculo" | "computador",
  aviso? : "diferenteAprendiz" | "maquinaSinDueño" | "maquinaPrincipalExistente",
  excepcion? : boolean,
  placa? : string,
  serial? : string,
  modelo? : string,
  tipo_vehiculo? : string
}

const otherMachineAprendiz = reactive<{ id_aprendiz?: number }>({})

// permiso de los aprendices

const permisoDeMaquina = async (quiereForzar : boolean)=> {
  if(!otherMachineAprendiz.id_aprendiz) return
  console.log(quiereForzar)
  if(quiereForzar){
    const response = await fetch(`${API}/api/registroIngresos/ingresoMaquina/${otherMachineAprendiz.id_aprendiz}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...buildMachinePayload(),
        forzarExcepcion: true
      }),
    })
    const data = await response.json()
    console.log(data)
    if(!data.excepcion){
      incosistenciaMaquina.value = true
      return
    }
    if(data.idDetallesMaquina){
      incosistenciaMaquina.value = false
      machineOtroAprendiz.value.closeModal()
      return
    }
  }
  else{
    machineOtroAprendiz.value.closeModal()
    clearMachineForm()
  }
}



const submitMachine = async (id_aprendiz?: number) => {
  if (!id_aprendiz || submittedMachine.value) return
  if (!validateMachineForm()) return

  submittedMachine.value = true

  try {
    const endpoint = dobleMaquina.value
      ? `${API}/api/registroIngresos/ingresoDobleMaquina/${id_aprendiz}`
      : `${API}/api/registroIngresos/ingresoMaquina/${id_aprendiz}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildMachinePayload()),
    })
    const data: MachineResponse = await response.json()

    console.log(data)

    if(data.aviso){
      if(data.aviso == "diferenteAprendiz"){
        otherMachineAprendiz.id_aprendiz = id_aprendiz
        machineOtroAprendiz.value.openModal()
      }
    }

    if (!response.ok) {
      mensajeMachine.value = {
        message: data.message || 'Error al registrar la maquina',
        type: 'error'
      }

      submittedMachine.value = false // desbloquea pero no deja spam
      return
    }

    console.log(data)
    await handleMachineSuccess()
  } catch (error) {
    console.error(error)
    mensajeMachine.value = { message: 'Error al registrar la maquina', type: 'error' }
  } finally {
    submittedMachine.value = false
  }
}

onMounted(() => {
  HistorialIngresos()

  if (route.path.startsWith('/general-entry/firma/')) {
    modalFirma.value?.closeModal()
    router.push('/general-entry')
  }
})

watch(queryAprendices, async (nuevoTexto) => {
  if (!nuevoTexto.trim()) {
    await HistorialIngresos()
    return
  }

  const data = await SearchAprendiz(nuevoTexto, 'ingreso')
  aprendizData.value = data
})

watch(
  formMachine,
  () => {
    submittedMachine.value = false
  },
  { deep: true },
)

watch(
  () => formMachine.placaSerial,
  (nuevoValor) => {
    if (!nuevoValor) return

    let value = nuevoValor.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

    if (formMachine.TipoMaquina === 'vh') {
      if (value.length > 7) value = value.slice(0, 7)
      if (value.length > 3) value = value.slice(0, 3) + '-' + value.slice(3)
    }

    if (value !== nuevoValor) formMachine.placaSerial = value
  },
)

watch(
  () => formMachine.modeloMaquina,
  (nuevoValor) => {
    if (!nuevoValor) return

    const value = nuevoValor.toUpperCase()

    if (value !== nuevoValor) {
      formMachine.modeloMaquina = value
    }
  },
)

watch(
  () => route.fullPath,
  (newPath) => {
    if (newPath.startsWith('/general-entry/firma/')) {
      modalFirma.value?.openModal()
    } else {
      modalFirma.value?.closeModal()
    }
  },
)

watch(
  () => formMachine.TipoMaquina,
  () => {
    formMachine.placaSerial = ''
    formMachine.tipoVehiculo = ''
    formMachine.modeloMaquina = ''
    mensajeMachine.value = { message: '', type: 'error' }
  },
)

const errorMachine = computed(() => {
  if (!submittedMachine.value) return ''
  if (!formMachine.TipoMaquina) return 'Ingrese un tipo de maquina'
  if (formMachine.TipoMaquina === 'vh' && !formMachine.tipoVehiculo) return 'Ingrese un tipo de vehiculo'
  if (!formMachine.modeloMaquina) return 'Digite una marca'
  if (!formMachine.placaSerial) return 'Digite placa o serial'
  if (!firmaTemporal.value) return 'Digite la firma'

  return ''
})

const displayMachineMessage = computed(() => errorMachine.value || mensajeMachine.value.message)

const confirmMessage = computed(() => {
  if (maquinaRegistrada.pc) return 'Desea registrar tambien un vehiculo?'
  if (maquinaRegistrada.vh) return 'Desea registrar tambien un computador?'
  return ''
})
</script>
