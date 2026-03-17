<template>
  <div class="relative">

    <HeaderView header-title="HISTORIAL DE INGRESOS Y SALIDAS CTA"/>

    <!-- FILTROS -->
    <div class="mx-20 my-5 flex gap-4 items-center">

      <input type="date" v-model="fechaInicio" class="border p-2 rounded"/>
      <input type="date" v-model="fechaFin" class="border p-2 rounded"/>

      <BaseButton text="Filtrar" @click="filtrarHistorial"/>

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
          <BaseTableHead name="Detalle"/>
        </BaseColumn>

        <BaseColumn v-for="aprendiz in historial" :key="aprendiz.id_aprendiz">

          <td>{{ aprendiz.nombre }}</td>
          <td>{{ aprendiz.apellido }}</td>
          <td>{{ aprendiz.documento }}</td>
          <td>{{ aprendiz.formacion }}</td>

          <td>{{ aprendiz.hora_ingreso || '—' }}</td>
          <td>{{ aprendiz.hora_salida || '—' }}</td>

          <td>
            <BaseText
              :text="aprendiz.id_detallemaquina ? 'Con máquina' : 'Sin máquina'"
              :type="aprendiz.id_detallemaquina ? 'success' : 'error'"
            />
          </td>

          <td>
            <BaseButtonOpen
              text="Ver"
              v-if="aprendiz.hora_salida"
              @click="openDetalle(aprendiz.id_aprendiz)"
            />
          </td>

        </BaseColumn>
      </BaseTable>

    </div>

    <!-- MODAL DETALLE -->
    <BaseModal ref="modalDetalle" title="Detalle de Salida">

      <div class="flex flex-col gap-4">

        <BaseText :text="`Fecha: ${detalle.fecha}`" type="success"/>
        <BaseText :text="`Hora: ${detalle.hora}`" type="success"/>

        <div v-if="detalle.pc">
          <BaseText :text="`PC: ${detalle.pc.modelo}`" type="success"/>
        </div>

        <div v-if="detalle.vh">
          <BaseText :text="`Vehículo: ${detalle.vh.tipo_vehiculo}`" type="success"/>
        </div>

        <img v-if="detalle.firma" :src="detalle.firma" class="w-40 border"/>

      </div>

    </BaseModal>

  </div>
</template>
<script setup lang="ts">

import { ref, onMounted } from 'vue'
import HeaderView from '@/layouts/HeaderView.vue'
import BaseTable from '@/components/Tables/BaseTable.vue'
import BaseColumn from '@/components/Tables/BaseColumn.vue'
import BaseTableHead from '@/components/Tables/BaseTableHead.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButton from '@/components/Buttons/BaseButton.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import BaseModal from '@/components/Modals/BaseModal.vue'

const API = import.meta.env.VITE_API_URL

const historial = ref<HistorialAprendiz[]>([])

const detalle = ref<DetalleSalida>({
  pc: null,
  vh: null,
  firma: '',
  fecha: '',
  hora: ''
})


const fechaInicio = ref('')
const fechaFin = ref('')

const modalDetalle = ref()



interface HistorialAprendiz {
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

interface DetalleSalida {
  pc: Computador | null
  vh: Vehiculo | null
  firma?: string
  fecha: string
  hora: string
}


// 🔥 TRAER HISTORIAL COMPLETO
const getHistorial = async () => {
  const res = await fetch(`${API}/api/historico/historial`)
  const data: HistorialAprendiz[] = await res.json()

  historial.value = data
}


// 🔍 FILTRAR POR FECHA
const filtrarHistorial = async () => {
  const res = await fetch(`${API}/api/historico/historialFechas?inicio=${fechaInicio.value}&fin=${fechaFin.value}`)
  const data = await res.json()
  historial.value = data
}


// 👁️ DETALLE DE SALIDA
const openDetalle = async (id_aprendiz: number) => {
  const res = await fetch(`${API}/api/registroSalidas/detalle/${id_aprendiz}`)
  const data: { result: DetalleSalida } = await res.json()

  detalle.value = data.result
}


onMounted(() => {
  getHistorial()
})

</script>
