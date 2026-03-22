<template>
  <div class="relative">

    <!-- ================= HEADER ================= -->
    <HeaderView -header-title="REGISTRO HISTÓRICO DE VEHÍCULOS"/>

    <!-- ================= NAV ================= -->
    <div class="flex justify-between">
      <ExitButton to="/"/>
    </div>

    <!-- ================= FILTROS ================= -->
    <div class="mx-20 my-10 flex justify-between items-center">

      <!-- 🔎 SEARCH DINÁMICO -->
      <div class="w-4/5" v-if="filters.filterType">
        <SearchBar v-model="filters.searchValue"/>
      </div>

      <!-- SELECTORES -->
      <div class="flex gap-4">
        <BaseSelect
          struct="green"
          placeholder="Filtrar por"
          v-model:model-value="filters.filterType"
          :options="optionsFilterType"
        />

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

        <!-- 🔥 HEADERS COMPLETOS -->
        <BaseColumn>
          <BaseTableHead name="Tipo"/>
          <BaseTableHead name="Placa"/>
          <BaseTableHead name="Marca"/>
          <BaseTableHead name="DNI"/>
          <BaseTableHead name="Ingreso"/>
          <BaseTableHead name="Salida"/>
          <BaseTableHead name="Propietario"/>
        </BaseColumn>

        <!-- 🔥 DATA -->
        <BaseColumn
          v-for="vehiculo in vehiculos"
          :key="vehiculo.id_detallemaquina"
        >
          <td>{{ vehiculo.tipo_vehiculo }}</td>
          <td>{{ vehiculo.placa }}</td>
          <td>{{ vehiculo.marca }}</td>
          <td>{{ vehiculo.documento }}</td>

          <!-- ⏱️ Horas -->
          <td>{{ vehiculo.hora_ingreso || '—' }}</td>
          <td>{{ vehiculo.hora_salida || '—' }}</td>

          <!-- 👤 Botón modal -->
          <td>
            <div class="flex justify-center items-center">
              <BaseButtonOpen
                text="Ver propietario"
                class-button="!text-white !bg-senaColor border-none font-semibold"
                @click="openPropietario(vehiculo.id_detallemaquina)"
              />
            </div>
          </td>
        </BaseColumn>

      </BaseTable>
    </div>

    <!-- ================= MODAL ================= -->
    <BaseModal ref="modalPropietario" title="Detalle del Propietario">

      <div class="flex flex-col gap-4">

        <BaseText :text="`Nombre: ${propietario.nombre}`" type="success"/>
        <BaseText :text="`Apellido: ${propietario.apellido}`" type="success"/>
        <BaseText :text="`Programa: ${propietario.formacion}`" type="success"/>

        <!-- ✍️ Firma -->
        <div v-if="propietario.firma">
          <h3 class="font-semibold">Firma</h3>
          <img :src="propietario.firma" class="w-48 border rounded"/>
        </div>

      </div>

    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'

// ================= UI =================
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

// ================= CONSTANTES =================
import { optionsDates } from '@/constants/optionsDates'

const API = import.meta.env.VITE_API_URL

// ================= ESTADOS =================

const vehiculos = ref<HistorialVehiculo[]>([])

const modalPropietario = ref()

const propietario = ref<Propietario>({
  id_propietario: 0,
  nombre: '',
  apellido: '',
  formacion: '',
  firma: ''
})

// 🔥 Filtros
const filters = reactive({
  Date: 'TODAY',
  filterType: '',
  searchValue: ''
})

// ================= OPCIONES =================
const optionsFilterType = [
  { label: 'Placa', value: 'PLACA' },
  { label: 'ID Aprendiz', value: 'APRENDIZ' },
]

// ================= INTERFACES =================

// 👤 Propietario (igual que computadores)
interface Propietario {
  id_propietario: number
  nombre: string
  apellido: string
  formacion: string
  firma: string
}

// 🚗 Historial vehículo (🔥 clave: ahora incluye horas)
interface HistorialVehiculo {
  id_detallemaquina: number
  tipo_vehiculo: string
  placa: string
  marca: string
  documento : string
  hora_ingreso: string | null
  hora_salida: string | null
  id_aprendiz: number
}

// ================= API =================

const getVehiculos = async () => {
  const params = new URLSearchParams()

  if (filters.Date) params.append('date', filters.Date)

  if (filters.filterType && filters.searchValue) {
    params.append('type', filters.filterType)
    params.append('value', filters.searchValue)
  }

  const query = params.toString() ? `?${params}` : ''

  const res = await fetch(`${API}/api/HistorialVehiculos/historial${query}`)
  const data = await res.json()

  console.log(data)

  vehiculos.value = data
}

// 👤 Modal propietario
const openPropietario = async (id_detallevehiculo: number) => {
  const res = await fetch(`${API}/api/HistorialVehiculos/propietario/${id_detallevehiculo}`)
  const data = await res.json()

  console.log(data)

  propietario.value = data.result as Propietario

  modalPropietario.value.openModal()
}

// ================= LIFECYCLE =================
onMounted(() => {
  getVehiculos()
})

// ================= WATCH =================
watch(
  () => [filters.Date, filters.filterType, filters.searchValue],
  () => {
    getVehiculos()
  }
)
</script>
