<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f6fbf6_0%,#ffffff_34%,#eef6f0_100%)] text-slate-800">
    <HeaderView
      HeaderTitle="SALIDA GENERAL DE APRENDICES"
      eyebrow="SENA | Control de salida"
    />

    <BarcodeScanner ref="scannerModal" @aprendiz-detectado="detectAprendiz" />

    <main class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
      <section class="grid gap-4  lg:grid-cols-[1fr_1.5fr]">
        <aside class=" rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
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
            <div class="rounded-2xl border border-slate-200 p-4 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
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
              <p class="mt-4 max-w-xl text-sm text-[#0f172a] leading-6 lg:text-base">
                Confirma salidas por escáner o de forma manual, consulta el historial inmediato y revisa los equipos asociados antes del cierre del movimiento.
              </p>
            </div>

            <div class="flex justify-between w-full gap-3 text-sm text-emerald-950">
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
        <div class="flex items-center">
          <ExitButton
            to="/"
            button-class="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-white shadow-[0_10px_25px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:scale-105"
          />
        </div>

        <article class="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Buscar aprendiz</p>
          <SearchBar
            v-model="queryAprendices"
            input-class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-quicksand text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />
        </article>

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

        <div class="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/70 p-2">
          <BaseTable>
            <BaseColumn row-class="bg-slate-900 text-center">
              <BaseTableHead name="Nombre" head-class="rounded-l-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="Apellido" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="DNI" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="Formación" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="Hora de salida" head-class="bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
              <BaseTableHead name="Salida de máquinas" head-class="rounded-r-2xl bg-slate-900 px-4 py-4 text-center font-quicksand text-sm font-semibold uppercase tracking-[0.14em] text-slate-100" />
            </BaseColumn>

            <BaseColumn
              v-for="aprendiz in aprendizData"
              :key="aprendiz.id_aprendiz"
              row-class="text-center align-middle transition odd:bg-white even:bg-slate-50/80 hover:bg-emerald-50/70 [&>td]:border-b [&>td]:border-slate-100 [&>td]:px-4 [&>td]:py-4 [&>td]:text-sm [&>td]:text-slate-700"
            >
              <td>{{ aprendiz.nombre }}</td>
              <td>{{ aprendiz.apellido }}</td>
              <td>{{ aprendiz.documento }}</td>
              <td>{{ aprendiz.formacion }}</td>
              <td>{{ aprendiz.hora_salida }}</td>
              <td>
                <div class="flex items-center justify-center">
                  <BaseButtonOpen
                    v-if="aprendiz.id_detallemaquina"
                    text="Ver detalle"
                    variant="ghost"
                    class-button="min-h-0 px-0 py-0 font-semibold shadow-none"
                    @click="openDetalleMaquina(aprendiz.id_aprendiz)"
                  />
                  <BaseText
                    v-else
                    text="Sin registro"
                    type="error"
                    text-class="font-semibold"
                  />
                </div>
              </td>
            </BaseColumn>
          </BaseTable>
        </div>
      </section>

      <BaseModal ref="modalManual" title="Registro manual de salida">
        <div class="rounded-2xl bg-slate-50 p-4">
          <p class="mb-1 text-sm font-semibold text-slate-700">Verifique el documento antes de confirmar la salida del aprendiz.</p>
          <p class="text-sm text-slate-500">Los datos se completan automáticamente cuando el aprendiz existe en la base de datos.</p>
        </div>

        <BaseForm method="POST" :submit="submit">
          <BaseField
            :input-event="EventoManual"
            v-model="formManual.documento"
            label="Documento de identidad"
            place-holder="Documento de identidad"
            type="text"
          />
          <BaseField
            v-model="formManual.nombre"
            label="Nombre del aprendiz"
            place-holder="Esperando documento..."
            type="text"
            readonly
          />
          <BaseField
            v-model="formManual.apellido"
            label="Apellido del aprendiz"
            place-holder="Esperando documento..."
            type="text"
            readonly
          />
          <BaseField
            v-model="formManual.formacion"
            label="Programa de formación"
            place-holder="Esperando documento..."
            type="text"
            readonly
          />

          <BaseText :text="alerta.message" :type="alerta.type" text-class="text-sm font-medium" />

          <BaseButton
            text="Añadir salida"
            type="submit"
            button-class="mt-2 rounded-2xl !bg-emerald-700 shadow-[0_14px_30px_rgba(15,107,63,0.18)]"
          />
        </BaseForm>
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

import codebar from '@/assets/Icons/barcodeScanner.png'
import add from '@/assets/Icons/add.png'

import { DetectExit } from '@/Services/DetectExits'
import { SearchAprendiz } from '@/Services/SearchAprendiz'
import { normalizeVehicleType } from '@/utils/vehicleType'

const API = import.meta.env.VITE_API_URL

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
const aprendizData = ref<Aprendiz[]>([])
const modalManual = ref()
const queryAprendices = ref('')
const modalDetalleMaquina = ref()
const maquinaDetalle = ref<DetalleMaquinas>({ pc: null, vh: null })
const alerta = ref({ message: '', type: 'error' as 'error' | 'success' })

const formManual = reactive({ documento: '', nombre: '', apellido: '', formacion: '' })

const latestAprendiz = computed(() => aprendizData.value[0] ?? null)
const machineLinkedCount = computed(
  () => aprendizData.value.filter((aprendiz) => aprendiz.id_detallemaquina != null).length,
)
const noMachineCount = computed(
  () => aprendizData.value.filter((aprendiz) => aprendiz.id_detallemaquina == null).length,
)

const detectAprendiz = async (code: string): Promise<'ok' | 'ya_registrado' | 'no_existe' | 'error'> => {
  if (!code) return 'error'

  const estado = await DetectExit(code)

  if (estado === 'no_existe') {
    scannerModal.value?.setResultMessage('El aprendiz no existe')
    scannerModal.value?.closeScanner()
    return 'no_existe'
  }

  if (estado === 'ya_registrado') {
    scannerModal.value?.setResultMessage('El aprendiz no tiene ingreso o ya registró salida')
    scannerModal.value?.closeScanner()
    return 'ya_registrado'
  }

  if (estado === 'error') {
    scannerModal.value?.closeScanner()
    return 'error'
  }

  // estado === 'ok'
  const registrado = await addExit(code)

  if (!registrado) {
    scannerModal.value?.setResultMessage('Error al registrar la salida')
    scannerModal.value?.closeScanner()
    return 'error'
  }

  scannerModal.value?.setResultMessage('Salida registrada correctamente')
  scannerModal.value?.closeScanner()

  return 'ok'
}

const addExit = async (code: string): Promise<boolean> => {
  if (!code) return false

  try {
    const response = await fetch(`${API}/api/registroSalidas/addExit/${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 409) {
        console.log('Info:', data.message)
      } else {
        console.error('Error:', data.message)
      }
      return false
    }

    console.log('Salida registrada:', data)
    await HistorialSalidas()
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const HistorialSalidas = async () => {
  try {
    const response = await fetch(`${API}/api/registroSalidas/historial`)
    const data = await response.json()
    aprendizData.value = data as Aprendiz[]
  } catch (error) {
    console.error(error)
  }
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

const open = () => {
  scannerModal.value?.openScanner()
}

const openManual = () => {
  modalManual.value.openModal()
  alerta.value.message = ''
  formManual.documento = ''
  formManual.nombre = ''
  formManual.apellido = ''
  formManual.formacion = ''
}

const submit = async () => {
  if (!formManual.documento) {
    alerta.value.message = 'Ingrese un documento de identidad'
    alerta.value.type = 'error'
    return
  }

  if (formManual.documento.length !== 10) {
    alerta.value.message = 'El DNI debe tener 10 digitos'
    alerta.value.type = 'error'
    return
  }

  if (!/^\d{10}$/.test(formManual.documento)) {
    alerta.value.message = 'El DNI debe contener solo numeros'
    alerta.value.type = 'error'
    return
  }

  const estado = await detectAprendiz(formManual.documento)

  if (estado === 'ok') {
    alerta.value.message = 'Registro aceptado'
    alerta.value.type = 'success'

    setTimeout(() => {
      modalManual.value.closeModal()
    }, 1000)
    return
  }

  if (estado === 'no_existe') {
    alerta.value.message = 'El aprendiz no existe'
    alerta.value.type = 'error'
    return
  }

  if (estado === 'ya_registrado') {
    alerta.value.message = 'El aprendiz no tiene ingreso o ya tiene salida'
    alerta.value.type = 'error'
    return
  }

  // error genérico
  alerta.value.message = 'Ocurrió un error al procesar la solicitud'
  alerta.value.type = 'error'
}

const EventoManual = async (DocumentoManual: string) => {
  if (!DocumentoManual) return

  if (DocumentoManual.length !== 10) {
    alerta.value.message = ''
    formManual.nombre = ''
    formManual.apellido = ''
    formManual.formacion = ''
    return
  }

  try {
    const response = await fetch(`${API}/api/registroIngresos/ingresoManual/${DocumentoManual}`)
    const data = await response.json()

    if (!response.ok) {
      console.log(data.message)
      return
    }

    formManual.nombre = data.result.nombre
    formManual.apellido = data.result.apellido
    formManual.formacion = data.result.formacion
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  HistorialSalidas()
})

watch(queryAprendices, async (nuevoTexto) => {
  if (!nuevoTexto.trim()) {
    await HistorialSalidas()
    return
  }

  const data = await SearchAprendiz(nuevoTexto, 'salida')
  aprendizData.value = data
})
</script>
