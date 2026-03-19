<template>
  <div class="relative">

    <!-- ================= HEADER ================= -->
    <HeaderView -header-title="REGISTRO HISTORICO DE INGRESO Y SALIDA DE APRENDICES"/>

    <!-- ================= NAVEGACIÓN ================= -->
    <div class="flex relative overflow-hidden justify-between">
      <ExitButton to="/"/>
    </div>

    <!-- ================= FILTROS ================= -->
    <div class="mx-20 my-10 flex justify-between items-center">

      <!-- 🔍 BUSCADOR -->
      <div class="w-4/5">
        <SearchBar v-model="queryAprendices"/>
      </div>

      <!-- 🎯 SELECTORES DE FILTRO -->
      <div class="flex gap-4">

        <!-- Filtro por programa -->
        <BaseSelect
          struct="green"
          placeholder="Programa de Formacion"
          v-model:model-value="filters.Program"
          :options="optionsProgram"
        />

        <!-- Filtro por fecha -->
        <BaseSelect
          struct="green"
          placeholder="Fecha"
          v-model:model-value="filters.Date"
          :options="optionsDates"
        />
      </div>
    </div>

    <!-- ================= TABLA ================= -->
    <div class="mx-20">

      <BaseTable>

        <!-- 🧾 CABECERA -->
        <BaseColumn>
          <BaseTableHead name="Nombre"/>
          <BaseTableHead name="Apellido"/>
          <BaseTableHead name="DNI"/>
          <BaseTableHead name="Formación"/>
          <BaseTableHead name="Ingreso"/>
          <BaseTableHead name="Salida"/>
          <BaseTableHead name="Máquina"/>
        </BaseColumn>

        <!-- 📊 FILAS DINÁMICAS -->
        <BaseColumn
          v-for="aprendiz in historial"
          :key="aprendiz.id_ingreso"
        >
          <td>{{ aprendiz.nombre }}</td>
          <td>{{ aprendiz.apellido }}</td>
          <td>{{ aprendiz.documento }}</td>
          <td>{{ aprendiz.formacion }}</td>

          <!-- Manejo de valores nulos -->
          <td>{{ aprendiz.hora_ingreso || '—' }}</td>
          <td>{{ aprendiz.hora_salida || '—' }}</td>

          <!-- Estado de máquina -->
          <td>
            <BaseText
              v-if="aprendiz.id_detallemaquina == null"
              text="No registrada"
              type="error"
              class="font-semibold"
            />

            <BaseButtonOpen
              v-else
              text="Maquina Registrada"
              class-button="m-auto my-0 py-0 px-0 bg-transparent border-none text-center font-semibold !text-senaColor"
              @click="openDetalleMaquina(aprendiz.id_detallemaquina)"
            />
          </td>

        </BaseColumn>
      </BaseTable>
    </div>

    <!-- ================= MODAL DETALLE MÁQUINAS ================= -->
    <BaseModal ref="modalDetalleMaquina" title="Máquinas Registradas">

      <div class="flex flex-col gap-6">

        <!-- 💻 COMPUTADOR -->
        <div v-if="maquinaDetalle.pc" class="border rounded-lg p-4">
          <h3 class="font-bold font-robotoSlab text-lg mb-2">Computador</h3>

          <BaseText type="success" :text="`Marca: ${maquinaDetalle.pc.modelo}`"/>
          <BaseText type="success" :text="`Serial: ${maquinaDetalle.pc.placa_serial}`"/>
        </div>

        <!-- 🚗 VEHÍCULO -->
        <div v-if="maquinaDetalle.vh" class="border rounded-lg p-4">
          <h3 class="font-bold font-robotoSlab text-lg mb-2">Vehículo</h3>

          <BaseText type="success" :text="`Tipo: ${maquinaDetalle.vh.tipo_vehiculo}`"/>
          <BaseText type="success" :text="`Marca: ${maquinaDetalle.vh.modelo}`"/>
          <BaseText type="success" :text="`Placa: ${maquinaDetalle.vh.placa_serial}`"/>
        </div>

        <!-- ✍️ FIRMA -->
        <div v-if="maquinaDetalle.firma">
          <h3 class="font-semibold mb-2">Firma del aprendiz</h3>

          <img
            :src="maquinaDetalle.firma"
            class="border rounded-lg w-48"
          />
        </div>

      </div>

    </BaseModal>

  </div>
</template>
<script setup lang="ts">

// ================= IMPORTS =================
import { ref, onMounted, watch, reactive } from 'vue'

// Componentes UI
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

// Constantes
import { optionsDates } from '@/constants/optionsDates'
import { optionsProgram } from '@/constants/optionsProgram'

// ================= CONFIG =================
const API = import.meta.env.VITE_API_URL



// ================= ESTADOS =================

// Lista principal del historial
const historial = ref<HistorialAprendiz[]>([])

// Modal de detalle
const modalDetalleMaquina = ref()

// Buscador
const queryAprendices = ref()

// Detalle de máquina seleccionada
const maquinaDetalle = ref<DetalleMaquinas>({
  pc: null,
  vh: null
})

// Filtros activos
const filters = reactive({
  Date: 'TODAY',
  Program: 'ADSO'
})



// ================= INTERFACES =================

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



// ================= FUNCIONES API =================

// 🔥 Obtener historial completo (sin filtros)
const getHistorial = async () => {
  const res = await fetch(`${API}/api/historico/historial`)
  const data: HistorialAprendiz[] = await res.json()

  historial.value = data
}


// 🔥 Obtener historial con filtros dinámicos
const getHistorialByFilters = async () => {
  try {
    const params = new URLSearchParams()

    // Agregar filtros si existen
    if (filters.Date) {
      params.append('date', filters.Date)
    }

    if (filters.Program) {
      params.append('program', filters.Program)
    }

    if (queryAprendices.value) {
      params.append('search', queryAprendices.value)
    }

    // Construcción de query string
    const query = params.toString() ? `?${params.toString()}` : ''

    const res = await fetch(`${API}/api/historico/historialFechas${query}`)
    const data: HistorialAprendiz[] = await res.json()

    historial.value = data

  } catch (error) {
    console.error(error)
  }
}


// 🔍 Obtener detalle de máquinas de un aprendiz
const openDetalleMaquina = async (id_detallemaquina: number) => {
  try {
    const response = await fetch(`${API}/api/historico/historialMaquinas/${id_detallemaquina}`)
    const data = await response.json()

    if (!response.ok) {
      console.error(data.message)
      return
    }

    // Guardar resultado en el estado
    maquinaDetalle.value = data.result

    // Abrir modal
    modalDetalleMaquina.value.openModal()

  } catch (error) {
    console.error(error)
  }
}



// ================= CICLO DE VIDA =================

// 🚀 Al montar el componente, cargar datos con filtros por defecto
onMounted(() => {
  getHistorialByFilters()
})



// ================= WATCHERS =================

// 👀 Observa cambios en filtros y búsqueda
watch(
  () => [filters.Date, filters.Program, queryAprendices.value],
  () => {
    if (filters.Date || filters.Program || queryAprendices.value) {
      getHistorialByFilters()
    } else {
      getHistorial()
    }
  }
)

</script>
