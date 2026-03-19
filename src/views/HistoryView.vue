<template>
  <div class="relative">

    <HeaderView -header-title="REGISTRO HISTORICO DE INGRESO Y SALIDA DE APRENDICES"/>

    <!-- Div para la mini navegacion-->
    <div class="flex relative overflow-hidden justify-between">
      <!-- Boton para salir -->
      <ExitButton to="/"/>
    </div>

    <!-- FILTROS -->
    <div class="mx-20 my-5 flex gap-4 items-center">
      <div class="flex items-center gap-2 w-4/5">
        <!-- Buscar aprendices -->
        <SearchBar/>
        <BaseSelect struct="green" placeholder="Fecha" v-model:model-value="filters.Date" :options="optionsDates"/>
      </div>
    </div>

    <!-- TABLA -->
    <div class="mx-20">

      <BaseTable>
        <BaseColumn>
          <BaseTableHead name="Nombre"/>
          <BaseTableHead name="Apellido"/>
          <BaseTableHead name="DNI"/>
          <BaseTableHead name="Formación"/>
          <BaseTableHead name="Ingreso"/>
          <BaseTableHead name="Salida"/>
          <BaseTableHead name="Máquina"/>
        </BaseColumn>

        <BaseColumn v-for="aprendiz in historial" :key="aprendiz.id_ingreso">

          <td>{{ aprendiz.nombre }}</td>
          <td>{{ aprendiz.apellido }}</td>
          <td>{{ aprendiz.documento }}</td>
          <td>{{ aprendiz.formacion }}</td>

          <td>{{ aprendiz.hora_ingreso || '—' }}</td>
          <td>{{ aprendiz.hora_salida || '—' }}</td>

          <td>
            <BaseText v-if="aprendiz.id_detallemaquina == null" text="No registrada" type="error" class="font-semibold"/>
            <BaseButtonOpen v-else-if="aprendiz.id_detallemaquina != null" text="Maquina Registrada" class-button="m-auto my-0 py-0 px-0 bg-transparent border-none text-center font-semibold !text-senaColor" @click="openDetalleMaquina(aprendiz.id_detallemaquina)"/>
          </td>

        </BaseColumn>
      </BaseTable>

    </div>
        <BaseModal ref="modalDetalleMaquina" title="Máquinas Registradas">

          <div class="flex flex-col gap-6">

            <!-- COMPUTADOR -->
            <div v-if="maquinaDetalle.pc" class="border rounded-lg p-4">

              <h3 class="font-bold font-robotoSlab text-lg mb-2">Computador</h3>

              <BaseText type="success" :text="`Marca: ${maquinaDetalle.pc.modelo}`"/>
              <BaseText type="success" :text="`Serial: ${maquinaDetalle.pc.placa_serial}`"/>

            </div>

            <!-- VEHICULO -->
            <div v-if="maquinaDetalle.vh" class="border rounded-lg p-4">

              <h3 class="font-bold font-robotoSlab text-lg mb-2">Vehículo</h3>

              <BaseText type="success" :text="`Tipo: ${maquinaDetalle.vh.tipo_vehiculo}`"/>
              <BaseText type="success" :text="`Marca: ${maquinaDetalle.vh.modelo}`"/>
              <BaseText type="success" :text="`Placa: ${maquinaDetalle.vh.placa_serial}`"/>

            </div>

            <!-- FIRMA -->
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

import { ref, onMounted, watch,reactive } from 'vue'
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

const API = import.meta.env.VITE_API_URL

type DateFilter = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'LAST_WEEK' | 'LAST_MONTH' | 'THIS_QUARTER' | ''

const historial = ref<HistorialAprendiz[]>([])
const modalDetalleMaquina = ref()


const maquinaDetalle = ref<DetalleMaquinas>({
  pc: null,
  vh: null
})


const filters = reactive({
  Date: 'TODAY' as DateFilter
})



interface HistorialAprendiz {
  id_ingreso : number,
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


// Interfaz para detalle de
interface DetalleMaquinas {
  pc: Computador | null
  vh: Vehiculo | null
  firma?: string
}



// 🔥 TRAER HISTORIAL COMPLETO
const getHistorial = async () => {
  const res = await fetch(`${API}/api/historico/historial`)
  const data: HistorialAprendiz[] = await res.json()

  historial.value = data
}

const getHistorialByDate = async () =>{
  try {
    const query = filters.Date ? `?filter=${filters.Date}` : ''

    const res = await fetch(`${API}/api/historico/historialFechas${query}`)
    const data: HistorialAprendiz[] = await res.json()

    historial.value = data

  } catch (error) {
    console.error(error)
  }
}


// Consultar maquinas de los aprendices
const openDetalleMaquina = async (id_detallemaquina:number) => {

  try{

    const response = await fetch(`${API}/api/historico/historialMaquinas/${id_detallemaquina}`)
    const data = await response.json()

    if(!response.ok){
      console.error(data.message)
      return
    }

    maquinaDetalle.value = data.result

    modalDetalleMaquina.value.openModal()

  }catch(error){
    console.error(error)
  }

}


onMounted(() => {
  getHistorialByDate()
})

watch(()=> filters.Date, () => {
  if(filters.Date){
    getHistorialByDate()
  }
  else{
  getHistorial()
  }
})

</script>
