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
        <BaseButtonOpen @click="openManual" :image="add" text="Ingreso Manual"/>
        <!--Modal de registro Manual  -->
        <BaseModal ref="modalManual" title="Registro Manual">
          <BaseForm method="POST" :submit="submit">
            <BaseField :input-event="EventoManual" v-model="formManual.documento" label="Documento de Identidad" place-holder="Documento de Identidad" type="text"/>
            <BaseField v-model="formManual.nombre" label="Nombre del aprendiz" place-holder="Esperando Documento..." type="text" readonly/>
            <BaseField v-model="formManual.apellido" label="Apellido del aprendiz" place-holder="Esperando Documento..." type="text" readonly/>
            <BaseField v-model="formManual.formacion" label="Nombre de la Formacion" place-holder="Esperando Documento..." type="text" readonly/>
            <BaseText :text="alerta.message" :type="alerta.type"/>
            <BaseButton text="Añadir Ingreso" type="submit"/>
          </BaseForm>
        </BaseModal>

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
import { ref,onMounted,reactive } from 'vue';
import HeaderView from '@/layouts/HeaderView.vue';
import ExitButton from '@/components/UI/ExitButton.vue';
import SearchBar from '@/components/UI/SearchBar.vue';
import SearchUser from '@/components/UI/SearchUser.vue';
import BaseTable from '@/components/Tables/BaseTable.vue';
import BaseColumn from '@/components/Tables/BaseColumn.vue';
import BaseTableHead from '@/components/Tables/BaseTableHead.vue';
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue';
import codebar from '@/assets/Icons/barcodeScanner.png'
import BarcodeScanner from '@/components/Library/BarcodeScanner.vue';
import { DetectEntry } from '@/Services/DetectEntrys';
import BaseModal from '@/components/Modals/BaseModal.vue';
import add from '@/assets/Icons/add.png'
import BaseForm from '@/components/Forms/BaseForm.vue';
import BaseField from '@/components/Forms/BaseField.vue';
import BaseButton from '@/components/Buttons/BaseButton.vue';
import BaseText from '@/components/Text/BaseText.vue';
const API = import.meta.env.VITE_API_URL
// variables del componente
const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)
const modalManual = ref()

const aprendizData = ref<Aprendiz[]>([]) // inicialmente vacío

// alerta del texto
const alerta = ref({
  message: '',
  type: 'error' as 'error' | 'success'
})


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
const detectAprendiz = async (code: string): Promise<boolean> => {
  if(!code) {
    console.error("Código vacío recibido");
    return false;
  }

  const NoIngresado = await DetectEntry(code)

  if(!NoIngresado){
  console.log("El aprendiz ya tiene un ingreso")
    return false
  }

  const registrado = await addEntry(code)

  if (!registrado) {
    return false
  }

  scannerModal.value?.closeScanner()

  return true
}

// funcion para ingresar aprendices
const addEntry = async (code : string) => {
  if(!code) return //si el codigo llega vacio

  try{
    const response = await fetch(`${API}/api/registroIngresos/addEntry/${code}`, {
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
    return true
  } catch (error) {
    console.error(error);
  }
}


const HistorialIngresos = async () => {
  try{
    const response = await fetch(`${API}/api/registroIngresos/historial`)
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

// emision del evento para abrir el modal manual
const openManual = ()=>{
  modalManual.value.openModal()
    alerta.value.message = ''
    formManual.documento = ''
    formManual.nombre = ''
    formManual.apellido = ''
    formManual.formacion = ''
}

// Campos del formulario
const formManual = reactive({
  documento: '',
  nombre: '',
  apellido: '',
  formacion: ''
})


const EventoManual = async (DocumentoManual : string) =>{
  if(!DocumentoManual) return
  if(DocumentoManual.length!=10){
    console.log("el dni debe tener 10 digitos")
    alerta.value.message = ''
    formManual.nombre = ''
    formManual.apellido = ''
    formManual.formacion = ''
    return
  }
  console.log("documento recibido",DocumentoManual)
  try{
    const response = await fetch(`${API}/api/registroIngresos/ingresoManual/${DocumentoManual}`)

    const data = await response.json()

    if(!response.ok){
      console.log(data.message)
      return
    }
    console.log(data)
    formManual.nombre = data.result.nombre
    console.log(data.result.nombre)
    formManual.apellido = data.result.apellido
    formManual.formacion = data.result.formacion

    console.log(formManual)
    // Rellenar campos
  } catch(error) {
    console.error(error)
  }
}

// Crear registro manual
const submit = async () =>{
  if(await detectAprendiz(formManual.documento)){
    alerta.value.message = 'Registro aceptado'
    alerta.value.type = 'success'
    setTimeout(() => {
      modalManual.value.closeModal()
    }, 1000);
  }
  else{
    alerta.value.message = 'El aprendiz ya tiene un registro'
    alerta.value.type = 'error'
  }
}


</script>
<style>

</style>
