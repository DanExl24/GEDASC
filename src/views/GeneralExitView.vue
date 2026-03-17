<template>
  <div class="relative">
    <!-- Header del componente-->
    <HeaderView -header-title="SALIDA DE APRENDICES DEL CENTRO DE FORMACION"/>
    <!-- Div para la mini navegacion-->
    <div class="flex relative overflow-hidden justify-between">
      <!-- Boton para salir -->
      <ExitButton to="/"/>
      <!-- Boton para abrir el modal -->
      <BaseButtonOpen @click="open" :image="codebar" text="Escanear Aprendiz" class="text-white"/>
    </div>

    <!-- Escaneo de codigo de barras -->
      <BarcodeScanner ref="scannerModal" @aprendiz-detectado="detectAprendiz"/>

      <!-- Div para insertar el apartado de aprendices-->
    <div class="mx-20 my-3">
      <section class="flex items-center justify-between mb-10">
        <div class="flex items-center gap-2 w-4/5">
          <!-- Buscar aprendices -->
          <SearchBar v-model="queryAprendices"/>
        </div>

        <!--Boton de Ingreso manual  -->
        <BaseButtonOpen @click="openManual" :image="add" text="Salida Manual" class="text-white"/>
        <!--Modal de registro Manual  -->
        <BaseModal ref="modalManual" title="Ingreso Manual">
          <BaseForm method="POST" :submit="submit">
            <BaseField :input-event="EventoManual" v-model="formManual.documento" label="Documento de Identidad" place-holder="Documento de Identidad" type="text"/>
            <BaseField v-model="formManual.nombre" label="Nombre del aprendiz" place-holder="Esperando Documento..." type="text" readonly/>
            <BaseField v-model="formManual.apellido" label="Apellido del aprendiz" place-holder="Esperando Documento..." type="text" readonly/>
            <BaseField v-model="formManual.formacion" label="Nombre de la Formacion" place-holder="Esperando Documento..." type="text" readonly/>
            <!--Texto de alerta  -->
            <BaseText :text="alerta.message" :type="alerta.type"/>
            <BaseButton text="Añadir Salida" type="submit"/>
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
          <BaseTableHead name="Hora de Salida"/>
          <BaseTableHead name="Salida de Maquinas"/>
        </BaseColumn>
        <!--Registros -->
        <BaseColumn v-for="(aprendiz) in aprendizData" :key="aprendiz.id_aprendiz">
          <td>{{ aprendiz.nombre }}</td>
          <td>{{ aprendiz.apellido }}</td>
          <td>{{ aprendiz.documento }}</td>
          <td>{{ aprendiz.formacion }}</td>
          <td>{{ aprendiz.hora_salida }}</td>
          <td>
            <BaseButtonOpen
              v-if="aprendiz.id_detallemaquina"
              text="Ver Detalle"
              class-button="m-auto my-0 py-0 px-0 bg-transparent border-none text-center font-semibold !text-senaColor"
              @click="openDetalleMaquina(aprendiz.id_aprendiz)"
            />

            <BaseText
              v-else
              text="Sin registro"
              type="error"
              class="font-semibold"
            />
          </td>
        </BaseColumn>
      </BaseTable>
        <!-- Modal para ver los detalles de las maquinas-->
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
  </div>
</template>
<script setup lang="ts">

// ====================================================================
// DEPENDENCIAS
// ===================================================================

import { ref,onMounted,reactive,watch} from 'vue';
import HeaderView from '@/layouts/HeaderView.vue';
import ExitButton from '@/components/UI/ExitButton.vue';
import SearchBar from '@/components/UI/SearchBar.vue';
import BaseTable from '@/components/Tables/BaseTable.vue';
import BaseColumn from '@/components/Tables/BaseColumn.vue';
import BaseTableHead from '@/components/Tables/BaseTableHead.vue';
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue';
import codebar from '@/assets/Icons/barcodeScanner.png'
import BarcodeScanner from '@/components/Library/BarcodeScanner.vue';
import { DetectExit } from '@/Services/DetectExits';
import BaseModal from '@/components/Modals/BaseModal.vue';
import BaseForm from '@/components/Forms/BaseForm.vue';
import BaseField from '@/components/Forms/BaseField.vue';
import BaseButton from '@/components/Buttons/BaseButton.vue';
import BaseText from '@/components/Text/BaseText.vue';
import { SearchAprendiz } from '@/Services/SearchAprendiz';
import add from '@/assets/Icons/add.png'


// ==========================================================================
// ENTORNO
// ==========================================================================

const API = import.meta.env.VITE_API_URL





// -------------------------------------- LOGICA DEL COMPONENTE --------------------------- //



// ======================================================
// REFERENCIA A VARIABLES
//  =====================================================

const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)
const aprendizData = ref<Aprendiz[]>([])
const modalManual = ref()
const queryAprendices = ref('')
const modalDetalleMaquina = ref()
const maquinaDetalle = ref<DetalleMaquinas>({
  pc: null,
  vh: null
})
// -- Alerta de formulario manual -- //
const alerta = ref({message: '', type: 'error' as 'error' | 'success'})




// ======================================================
// VARIABLES REACTIVAS
//  =====================================================

// Campos del formulario manual
const formManual = reactive({documento: '', nombre: '', apellido: '', formacion: ''})


// ==========================================================
// INTERFACES
// ==========================================================


// -- Interfaz para aprendices
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


// Interfaz para computadores
interface Computador {
  modelo: string
  placa_serial: string
  firma: string
}


// Interfaz para vehiculos
interface Vehiculo {
  tipo_vehiculo: string
  modelo: string
  placa_serial: string
  firma: string
}

// Interfaz para detalle de
interface DetalleMaquinas {
  pc: Computador | null
  vh: Vehiculo | null
  firma?: string
}



// ===================================================
// FUNCIONES AUXILIARES
// ===================================================


// -- Detectar aprendices registrados a el registro de salidas
const detectAprendiz = async (code: string): Promise<boolean> => {
  // si llega codigo incorrecto
  if(!code) {
    console.error("Código vacío recibido");
    return false;
  }

  // esperar respuesta de registro
  const NoIngresado = await DetectExit(code)

  // si esta registrado, no deja avanzar
  if(!NoIngresado){
  console.log("El aprendiz ya tiene una salida")
    return false
  }

  // esperar respuesta del ingreso de entrada
  const registrado = await addExit(code)

  // si hay un inconveniente, retornar falso
  if (!registrado) {
    return false
  }

  // cerrar modal
  scannerModal.value?.closeScanner()

  // retornar verdadero
  return true
}



// -- Ingresar Aprendices a Salidas
const addExit = async (code: string): Promise<boolean> => {
  if (!code) return false

  try {
    const response = await fetch(`${API}/api/registroSalidas/addExit/${code}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'}
    });

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 409) {
        console.log("Info:", data.message)
      } else {
        console.error("Error:", data.message)
      }
      return false // 👈 CLAVE
    }

    console.log("Salida registrada:", data);

    await HistorialSalidas();
    return true

  } catch (error) {
    console.error(error);
    return false // 👈 CLAVE
  }
}


// -- Historial de registro de ingreso de los aprendices
const HistorialSalidas = async () => {
  try{
    // historial de ingresos
    const response = await fetch(`${API}/api/registroSalidas/historial`)
    const data = await response.json()
    console.log(data)

    aprendizData.value = data as  Aprendiz[] //Traer los aprendices

  } catch (error) {
    console.error(error)
  }
}

// Consultar maquinas de los aprendices
const openDetalleMaquina = async (id_aprendiz:number) => {

  try{

    const response = await fetch(`${API}/api/registroIngresos/detalleMaquinas/${id_aprendiz}`)
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

// =======================================================
// ON MOUNTED (Se ejecuta al montar el DOM)
// =======================================================

onMounted(() => {
  HistorialSalidas(); // esto trae el historial apenas se abre la vista
})




// =======================================================
// FUNCIONES OPEN Y SUS MODALES
// ========================================================

// -- Abrir Scanner
const open = () => {
  scannerModal.value?.openScanner()
}

// -- Abrir modal de registro Manual
const openManual = ()=>{
  modalManual.value.openModal()
  // vaciar todos los campos
    alerta.value.message = ''
    formManual.documento = ''
    formManual.nombre = ''
    formManual.apellido = ''
    formManual.formacion = ''
}


// =======================================================
// FUNCIONES CLOSE Y SUS MODALES
// ========================================================



// ========================================================
// EVENTOS SUBMITS
// =========================================================

// -- Ingresar aprendiz a registro de ingreso
const submit = async () => {
  // validar campo vacío
  if (!formManual.documento) {
    alerta.value.message = 'Ingrese un documento de identidad';
    alerta.value.type = 'error';
    return; // detener ejecución
  }

  // validar longitud
  if (formManual.documento.length !== 10) {
    alerta.value.message = 'El DNI debe tener 10 dígitos';
    alerta.value.type = 'error';
    return; // detener ejecución
  }

  // Opcional: validar que solo sean números
  if (!/^\d{10}$/.test(formManual.documento)) {
    alerta.value.message = 'El DNI debe contener solo números';
    alerta.value.type = 'error';
    return;
  }

  // llamar a la función de registro
  const registrado = await detectAprendiz(formManual.documento);

  if (registrado) {
    alerta.value.message = 'Registro aceptado';
    alerta.value.type = 'success';

    setTimeout(() => {
      modalManual.value.closeModal();
    }, 1000);

  } else {
    alerta.value.message = 'El aprendiz no tiene ingreso o ya tiene salida';
    alerta.value.type = 'error';
  }
};

// -- CONSULTAR DATOS DEL APRENDIZ PARA EL REGISTRO MANUAL -- //
const EventoManual = async (DocumentoManual : string) =>{
  if(!DocumentoManual) return // si el documento esta mal
  if(DocumentoManual.length!=10){
    console.log("el dni debe tener 10 digitos")
    alerta.value.message = ''
    formManual.nombre = ''
    formManual.apellido = ''
    formManual.formacion = ''
    return // si el documento no tiene 10 digitos
  }
  console.log("documento recibido",DocumentoManual)
  try{
    const response = await fetch(`${API}/api/registroIngresos/ingresoManual/${DocumentoManual}`)
    const data = await response.json()

    if(!response.ok){console.log(data.message); return}

    console.log(data)
    // Obtener datos del aprendiz
    formManual.nombre = data.result.nombre
    console.log(data.result.nombre)
    formManual.apellido = data.result.apellido
    formManual.formacion = data.result.formacion

    console.log(formManual)
    // Rellenar campos
  } catch(error) {console.error(error)}
}




// ================================== WATCHS =========================== //



// -- VERIFICAR SI HAY BUSQUEDA DE APRENDICES -- //
watch(queryAprendices, async (nuevoTexto) => {

  if (!nuevoTexto.trim()) {await HistorialSalidas(); return} //si no hay texto

  const data = await SearchAprendiz(nuevoTexto,'salida') // si hay texto

  aprendizData.value = data // Pasar el aprendiz encontrado en busqueda

})





// ========================== COMPUTEDS ================================= //



</script>
<style>

</style>
