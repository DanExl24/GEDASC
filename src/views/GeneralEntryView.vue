<template>
  <div class="relative">
    <!-- Header del componente-->
    <HeaderView -header-title="INGRESO DE APRENDICES AL CENTRO DE FORMACION"/>
    <!-- Div para la mini navegacion-->
    <div class="flex relative overflow-hidden justify-between">
      <!-- Boton para salir -->
      <ExitButton to="/"/>
      <!-- Boton para abrir el modal -->
      <BaseButtonOpen @click="open" :image="codebar" text="Escanear Aprendiz"/>
    </div>
    <!-- Escaneo de codigo de barras -->
      <BarcodeScanner ref="scannerModal" @aprendiz-detectado="detectAprendiz"/>
      <!-- Div para insertar el apartado de aprendices-->
    <div class="mx-20 my-3">
      <section class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-2 w-4/5">
          <!-- Buscar aprendices -->
          <SearchBar/>
          <!-- Boton para encontrar resultados -->
          <SearchUser/>
        </div>
        <!--Boton de registro manual  -->
        <BaseButton to="/" button-message="Registro Manual" button-class="w-full"/>
      </section>
      <!-- tabla de aprendices-->
      <BaseTable>
        <!-- Columna de encabezado-->
        <BaseColumn>
          <BaseTableHead name="Nombre"/>
          <BaseTableHead name="Apellido"/>
          <BaseTableHead name="DNI"/>
          <BaseTableHead name="Nombre de la Formacion"/>
          <BaseTableHead name="Hora de Ingreso"/>
          <BaseTableHead name="Registro de Maquina"/>
        </BaseColumn>
        <!--Registros -->
        <BaseColumn v-for="aprendiz in aprendizData" :key="aprendiz.id_aprendiz">
          <td>{{ aprendiz.nombre }}</td>
          <td>{{ aprendiz.apellido }}</td>
          <td>{{ aprendiz.documento }}</td>
          <td>{{ aprendiz.formacion }}</td>
          <td>{{ aprendiz.hora_ingreso }}</td>
          <td>''</td>
        </BaseColumn>
      </BaseTable>
    </div>
  </div>
</template>
<script setup lang="ts">
// dependencias
import { ref,onMounted } from 'vue';
import HeaderView from '@/layouts/HeaderView.vue';
import ExitButton from '@/components/UI/ExitButton.vue';
import SearchBar from '@/components/UI/SearchBar.vue';
import SearchUser from '@/components/UI/SearchUser.vue';
import BaseButton from '@/components/Buttons/BaseButton.vue';
import BaseTable from '@/components/Tables/BaseTable.vue';
import BaseColumn from '@/components/Tables/BaseColumn.vue';
import BaseTableHead from '@/components/Tables/BaseTableHead.vue';
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue';
import codebar from '@/assets/Icons/barcodeScanner.png'
import BarcodeScanner from '@/components/Library/BarcodeScanner.vue';
import { DetectEntry } from '@/Services/DetectEntrys';


// variables del componente
const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)

const aprendizData = ref<Aprendiz[]>([]) // inicialmente vacío

// Interfaz aprendiz
export interface Aprendiz {
  id_aprendiz: number,
  nombre: string,
  apellido: string,
  documento: string,
  formacion: string,
  hora_ingreso: string
}


// funcion que trae el documento del aprendiz hacia el padre
const detectAprendiz = async (code: string) => {
  if(!code) {
    console.error("Código vacío recibido");
    return;
  }

  const NoIngresado = await DetectEntry(code)
  if(NoIngresado){
  addEntry(code)
  scannerModal.value?.closeScanner()
    return
  }
  else{
    console.log("El aprendiz ya tiene un ingreso")
    return
  }
}

// funcion para ingresar aprendices
const addEntry = async (code : string) => {
  if(!code) return //si el codigo llega vacio

  try{
    const response = await fetch(`http://localhost:3000/api/registroIngresos/addEntry/${code}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    });
    const data = await response.json()

    if(!response.ok){
      if (response.status === 409) {
          // Mostrar mensaje del backend
          console.log("Info:", data.message)
          return
      }
    }

    console.log("Ingreso registrado:", data);
    HistorialIngresos();  // refrescar tabla
  } catch (error) {
    console.error(error);
  }
}


const HistorialIngresos = async () => {
  try{
    const response = await fetch(`http://localhost:3000/api/registroIngresos/historial`)
    const data = await response.json()
    console.log(data)
    aprendizData.value = data
  } catch (error) {
    console.error(error)
  }
}

// Ejecutar al montar el componente
onMounted(() => {
  HistorialIngresos(); // esto trae el historial apenas se abre la vista
});

// emision del evento para abrir el escaner
const open = () => {
  scannerModal.value?.openScanner()
}


</script>
<style>

</style>
