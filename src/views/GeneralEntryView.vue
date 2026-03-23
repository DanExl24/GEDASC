<template>
  <div class="relative">
    <!-- Header del componente-->
    <HeaderView -header-title="INGRESO DE APRENDICES AL CENTRO DE FORMACION"/>
    <img
      v-if="firmaTemporal && machineModalOpen"
      :src="firmaTemporal"
      class="fixed top-20 right-10 w-40 border-2 border-gray-300 rounded-lg shadow-lg bg-white z-[9999] pointer-events-none"
    />
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

        <!--Boton de registro manual  -->
        <BaseButtonOpen @click="openManual" :image="add" text="Ingreso Manual" class="text-white"/>
        <!--Modal de registro Manual  -->
        <BaseModal ref="modalManual" title="Registro Manual">
          <BaseForm method="POST" :submit="submit">
            <BaseField :input-event="EventoManual" v-model="formManual.documento" label="Documento de Identidad" place-holder="Documento de Identidad" type="text"/>
            <BaseField v-model="formManual.nombre" label="Nombre del aprendiz" place-holder="Esperando Documento..." type="text" readonly/>
            <BaseField v-model="formManual.apellido" label="Apellido del aprendiz" place-holder="Esperando Documento..." type="text" readonly/>
            <BaseField v-model="formManual.formacion" label="Nombre de la Formacion" place-holder="Esperando Documento..." type="text" readonly/>
            <!--Texto de alerta  -->
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
        <BaseColumn v-for="(aprendiz,index) in aprendizData" :key="aprendiz.id_aprendiz">
          <td>{{ aprendiz.nombre }}</td>
          <td>{{ aprendiz.apellido }}</td>
          <td>{{ aprendiz.documento }}</td>
          <td>{{ aprendiz.formacion }}</td>
          <td>{{ aprendiz.hora_ingreso }}</td>
          <td>
            <BaseButtonOpen v-if="index === 0 && aprendiz.id_detallemaquina ==null" @click="openMachine(aprendiz)" class-button="m-auto my-0 py-0 px-2 rounded-lg bg-blue-700 min-w-min text-center font-semibold text-white" text="Ingresar Maquina"/>
            <BaseText v-else-if="aprendiz.id_detallemaquina == null" text="No registrada" type="error" class="font-semibold"/>
            <BaseButtonOpen v-else-if="aprendiz.id_detallemaquina != null" text="Ver máquinas" class-button="m-auto my-0 py-0 px-0 bg-transparent border-none text-center font-semibold !text-senaColor" @click="openDetalleMaquina(aprendiz.id_aprendiz)"/>
            <BaseText v-else-if="firmaTemporal" text="Firma registrada" type="success" class="font-semibold"/>
          </td>
        </BaseColumn>
      </BaseTable>
        <!--Modal de registro Manual  -->
        <BaseModal ref="modalMachine" :title="`Registro de máquina de ${aprendizMachine?.nombre}`">
          <BaseForm method="POST" :submit="() => submitMachine(aprendizMachine?.id_aprendiz)">
            <BaseSelect :disabled="maquinaRegistrada.pc || maquinaRegistrada.vh" placeholder="Tipo de Maquina" v-model:model-value="formMachine.TipoMaquina" :options="optionsMachine"/>
            <BaseSelect v-if="formMachine.TipoMaquina == 'vh'" placeholder="Tipo de Vehiculo" v-model:model-value="formMachine.tipoVehiculo" :options="optionsVehicle"/>
            <BaseField v-model="formMachine.modeloMaquina" label="Marca de la Maquina" place-holder="Marca" type="text"/>
            <BaseField :disabled="submittedMachine" :max-length="formMachine.TipoMaquina=='vh' ? 7 : 100"  v-model="formMachine.placaSerial" label="Placa/Serial de Maquina" place-holder="Placa o Serial" type="text" />            <!--Texto de alerta  -->
            <BaseText :text="displayMachineMessage" :type="mensajeMachine.type"/>
            <BaseButtonOpen v-if="!firmaTemporal" class="!bg-orange-500 px-1 py-1" text="Ingresar Firma" @click="openFirma"/>
            <BaseText v-if="firmaTemporal" text="Firma ya registrada" type="success" class="font-semibold" />
            <BaseButton text="Añadir Maquina" type="submit"/>
          </BaseForm>
        </BaseModal>
        <!-- Modal de otro registro -->
        <BaseModal ref="machineConfirmModal" title="Registrar otra máquina">
          <div class="flex flex-col gap-4 items-center">

            <BaseText
              :text="confirmMessage"
              type="success"
              class="text-center font-semibold"
            />

            <div class="flex gap-4">
              <BaseButtonOpen
                text="Sí, registrar"
                class-button="bg-green-600"
                @click="registrarOtra"
              />

              <BaseButtonOpen
                text="No, finalizar"
                class-button="bg-red-600"
                @click="finalizarRegistro"
              />
            </div>

          </div>
        </BaseModal>
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

import { ref,onMounted,reactive,watch,computed } from 'vue';
import router from '@/router';
import HeaderView from '@/layouts/HeaderView.vue';
import ExitButton from '@/components/UI/ExitButton.vue';
import SearchBar from '@/components/UI/SearchBar.vue';
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
import { SearchAprendiz } from '@/Services/SearchAprendiz';
import BaseSelect from '@/components/Forms/BaseSelect.vue';
import { optionsMachine } from '@/constants/optionsMachine';
import { optionsVehicle } from '@/constants/optionsVehicle';
import { useRoute } from 'vue-router'
import { connectSocket } from "@/socket";
import { io } from "socket.io-client";
const socket = io("http://192.168.1.7:3000");
// ==========================================================================
// ENTORNO
// ==========================================================================

const API = import.meta.env.VITE_API_URL




// -------------------------------------- LOGICA DEL COMPONENTE --------------------------- //



// ======================================================
// REFERENCIA A VARIABLES
//  =====================================================

const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)
const modalManual = ref()
const aprendizData = ref<Aprendiz[]>([])
const queryAprendices = ref('')
const modalMachine = ref()
const aprendizMachine  = ref<Aprendiz>()
const modalFirma = ref()
const submittedMachine = ref(false);
const route = useRoute()
const machineConfirmModal = ref()
const firmaTemporal = ref('')
const machineModalOpen = ref(false)
const dobleMaquina = ref(false)
const modalDetalleMaquina = ref()
const maquinaDetalle = ref<DetalleMaquinas>({
  pc: null,
  vh: null
})
// -- Alerta de formulario manual -- //
const alerta = ref({message: '', type: 'error' as 'error' | 'success'})

// -- Alerta de formulario de maquina -- //
const mensajeMachine = ref({message: '', type: 'error' as 'error' | 'success'})




// ======================================================
// VARIABLES REACTIVAS
//  =====================================================

// Tipo de Maquin registrada
const maquinaRegistrada = reactive({pc: false, vh: false})
// Campos del formulario manual
const formManual = reactive({documento: '', nombre: '', apellido: '', formacion: ''})
// Campos del formulario de maquia
const formMachine = reactive({modeloMaquina : '', TipoMaquina: '', tipoVehiculo: '', placaSerial: ''})




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


// -- Detectar aprendices registrados a el registro de ingreso
const detectAprendiz = async (code: string): Promise<boolean> => {
  // si llega codigo incorrecto
  if(!code) {
    console.error("Código vacío recibido");
    return false;
  }

  // esperar respuesta de registro
  const NoIngresado = await DetectEntry(code)

  // si esta registrado, no deja avanzar
  if(!NoIngresado){
  console.log("El aprendiz ya tiene un ingreso")
    return false
  }

  // esperar respuesta del ingreso de entrada
  const registrado = await addEntry(code)

  // si hay un inconveniente, retornar falso
  if (!registrado) {
    return false
  }

  // cerrar modal
  scannerModal.value?.closeScanner()

  // retornar verdadero
  return true
}



// -- Ingresar Aprendices
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



// -- Historial de registro de ingreso de los aprendices
const HistorialIngresos = async () => {
  try{
    // historial de ingresos
    const response = await fetch(`${API}/api/registroIngresos/historial`)
    const data = await response.json()
    console.log(data)

    aprendizData.value = data as  Aprendiz[] //Traer los aprendices

  } catch (error) {
    console.error(error)
  }
}


socket.on('firmaRegistrada', ({ documento, firma }: { documento: string, firma: string }) => {
  console.log('Firma recibida del móvil:' + documento + firma);

    firmaTemporal.value = firma

    mensajeMachine.value = {
      message: 'Firma registrada con éxito',
      type: 'success'
    } // Mensaje de ayuda

    router.push('/general-entry') // Regresar al main

    setTimeout(() => {
      mensajeMachine.value = {
        message: '',
        type: 'success'
      }
    }, 1000) // Esperar 1 seg para quitar el mensaje

    submittedMachine.value = false // Evitar submit
});



// -- Registrar otra maquina y bloquear selects
const registrarOtra = () => {
  dobleMaquina.value = true
  machineConfirmModal.value.closeModal()

  if (maquinaRegistrada.pc) {
    formMachine.TipoMaquina = 'vh'
  }

  if (maquinaRegistrada.vh) {
    formMachine.TipoMaquina = 'pc'
  }

  modalMachine.value.openModal()
}

// -- Vaciar campos del formulario
const resetMachineForm = () => {

  // limpiar formulario
  formMachine.TipoMaquina = ''
  formMachine.tipoVehiculo = ''
  formMachine.modeloMaquina = ''
  formMachine.placaSerial = ''

  // limpiar firma
  firmaTemporal.value = ''

  // limpiar estados
  maquinaRegistrada.pc = false
  maquinaRegistrada.vh = false

  dobleMaquina.value = false
  submittedMachine.value = false

  // limpiar mensajes
  mensajeMachine.value = { message: '', type: 'error' }

  // cerrar modales por seguridad
  machineModalOpen.value = false
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
  connectSocket();
  HistorialIngresos(); // esto trae el historial apenas se abre la vista
  // cerrar modal automáticamente si la ruta es de firma
  if (route.path.startsWith('/general-entry/firma/')) {
    modalFirma.value?.closeModal()
    router.push('/general-entry') // Para que no haya conveniente3s entre ruats
  }
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

// -- Abrir modal para ingresar maquina
const openMachine = (aprendiz : Aprendiz) =>{
  machineModalOpen.value = true
  firmaTemporal.value = '' // 👈 limpiar firma anterior

  maquinaRegistrada.pc = false
  maquinaRegistrada.vh = false

  aprendizMachine.value = aprendiz
  modalMachine.value.openModal()

  for (const key in formMachine) {
    formMachine[key as keyof typeof formMachine] = ''
  }
}


// -- Abrir modal de firma
const openFirma = () => {
  if (!aprendizMachine.value) return

  // modalFirma.value.openModal()

  // router.push(`/general-entry/firma/${aprendizMachine.value.documento}`)
  socket.emit("abrirFirmaEnMovil", { documento: aprendizMachine.value.documento });
}



// =======================================================
// FUNCIONES CLOSE Y SUS MODALES
// ========================================================


// -- Cerrar modal para finalizar el registro
const finalizarRegistro = () => {
  dobleMaquina.value = false
  machineConfirmModal.value.closeModal()
  resetMachineForm()
  // limpiar firma
  firmaTemporal.value = ''

  // limpiar formulario
  formMachine.TipoMaquina = ''
  formMachine.tipoVehiculo = ''
  formMachine.modeloMaquina = ''
  formMachine.placaSerial = ''
  console.log(firmaTemporal)
}



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
    alerta.value.message = 'El aprendiz ya tiene un registro';
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

// -- INGRESAR MAQUINA DEL APRENDIZ -- //
const submitMachine = async (id_aprendiz?: number) => {
  if (!id_aprendiz || submittedMachine.value) return; // bloquea si ya se está enviando

// validar que tipoMaquina exista
if (!formMachine.TipoMaquina) {
  mensajeMachine.value = {
    message: 'Debe seleccionar el tipo de máquina',
    type: 'error'
  }
  return
}

if (formMachine.TipoMaquina !== 'vh') {
  formMachine.tipoVehiculo = ''
}

// validación para pc
if (formMachine.TipoMaquina === 'pc') {
  if (!formMachine.modeloMaquina || !formMachine.placaSerial) {
    mensajeMachine.value = {
      message: 'Todos los campos son obligatorios',
      type: 'error'
    }
    return
  }

  if (!firmaTemporal.value) {
    mensajeMachine.value = {
      message: 'Debe ingresar una firma',
      type: 'error'
    }
    return
  }
}

// validación para vehículo
if (formMachine.TipoMaquina === 'vh') {
  if (
    !formMachine.tipoVehiculo ||
    !formMachine.modeloMaquina ||
    !formMachine.placaSerial
  ) {
    mensajeMachine.value = {
      message: 'Todos los campos son obligatorios',
      type: 'error'
    }
    return
  }

  if (!firmaTemporal.value) {
    mensajeMachine.value = {
      message: 'Debe ingresar la firma',
      type: 'error'
    }
    return
  }
}

  // marcar que se hizo submit
  submittedMachine.value = true;


  if(dobleMaquina.value == false){
      try {
      const response = await fetch(`${API}/api/registroIngresos/ingresoMaquina/${id_aprendiz}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoMaquina: formMachine.TipoMaquina,
          tipoVehiculo: formMachine.tipoVehiculo,
          modelo: formMachine.modeloMaquina.toUpperCase(),
          placaSerial: formMachine.placaSerial.toUpperCase(),
          firma: firmaTemporal.value
        })
      });

      const data = await response.json();
      console.log(data);

      // Después de fetch exitoso
      mensajeMachine.value = { message: 'Máquina ingresada con éxito', type: 'success' };

      await HistorialIngresos();

  // marcar qué tipo se registró
  if (formMachine.TipoMaquina === 'pc') {
    maquinaRegistrada.pc = true
  }

  if (formMachine.TipoMaquina === 'vh') {
    maquinaRegistrada.vh = true
  }


  setTimeout(() => {
    machineModalOpen.value = false
    modalMachine.value.closeModal()

    // si solo tiene uno registrado
    if (maquinaRegistrada.pc !== maquinaRegistrada.vh) {

      machineConfirmModal.value.openModal()

    }

    submittedMachine.value = false

  }, 1000)

    } catch (error) {
      console.error(error);
      mensajeMachine.value = { message: 'Error al registrar la máquina', type: 'error' };
    }
  finally {
      submittedMachine.value = false; // desbloquear después
    }
  }



  else if(dobleMaquina.value == true){
          try {
      const response = await fetch(`${API}/api/registroIngresos/ingresoDobleMaquina/${id_aprendiz}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoMaquina: formMachine.TipoMaquina,
          tipoVehiculo: formMachine.tipoVehiculo,
          modelo: formMachine.modeloMaquina.toUpperCase(),
          placaSerial: formMachine.placaSerial.toUpperCase(),
          firma: firmaTemporal.value
        })
      });

      const data = await response.json();
      console.log(data);

      // Después de fetch exitoso
      mensajeMachine.value = { message: 'Máquina ingresada con éxito', type: 'success' };

      await HistorialIngresos();

  // marcar qué tipo se registró
  if (formMachine.TipoMaquina === 'pc') {
    maquinaRegistrada.pc = true
  }

  if (formMachine.TipoMaquina === 'vh') {
    maquinaRegistrada.vh = true
  }


  setTimeout(() => {
    machineModalOpen.value = false
    modalMachine.value.closeModal()
    resetMachineForm()   // 👈 limpiar todo
    submittedMachine.value = false

  }, 1000)

    } catch (error) {
      console.error(error);
      mensajeMachine.value = { message: 'Error al registrar la máquina', type: 'error' };
    }
  finally {
      submittedMachine.value = false; // desbloquear después
    }
  }

};



// ================================== WATCHS =========================== //



// -- VERIFICAR SI HAY BUSQUEDA DE APRENDICES -- //
watch(queryAprendices, async (nuevoTexto) => {

  if (!nuevoTexto.trim()) {await HistorialIngresos(); return} //si no hay texto

  const data = await SearchAprendiz(nuevoTexto,'ingreso') // si hay texto

  aprendizData.value = data // Pasar el aprendiz encontrado en busqueda

})



watch(formMachine, () => {
  submittedMachine.value = false; // limpiar errores si el usuario cambia algo
}, { deep: true });


// Vigilar placa
watch(() => formMachine.placaSerial, (nuevoValor) => {
  if (!nuevoValor) return;

  let value = nuevoValor.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

  if (formMachine.TipoMaquina === 'vh') {
    if (value.length > 7) value = value.slice(0, 7);
    if (value.length > 3) value = value.slice(0, 3) + '-' + value.slice(3);
  }

  if (value !== nuevoValor) formMachine.placaSerial = value;
});

// Formatear a uppercase la marca de la maquina
watch(() => formMachine.modeloMaquina, (nuevoValor) => {
  if (!nuevoValor) return

  const value = nuevoValor.toUpperCase()

  if (value !== nuevoValor) {
    formMachine.modeloMaquina = value
  }
})

// -- VIGILAR CAMBIOS EN LA RUTA DE FIRMA
watch(() => route.fullPath, (newPath) => {

  if (newPath.startsWith('/general-entry/firma/')) {
    modalFirma.value?.openModal()
  } else {
    modalFirma.value?.closeModal()
  }

})

watch(() => formMachine.TipoMaquina, () => {
  // Limpiar todos los campos relevantes al cambiar el tipo
  formMachine.placaSerial = '';
  formMachine.tipoVehiculo = '';
  formMachine.modeloMaquina = '';

  // También puedes resetear errores si quieres
  mensajeMachine.value = { message: '', type: 'error' };
});

// ========================== COMPUTEDS ================================= //

const errorMachine = computed(() => {
  if (!submittedMachine.value) return '' // no mostrar nada hasta que se haga submit
  if (!formMachine.TipoMaquina) return 'Ingrese un tipo de maquina'
  if (formMachine.TipoMaquina === 'vh' && !formMachine.tipoVehiculo) return 'Ingrese un tipo de vehiculo'
  if (!formMachine.modeloMaquina) return 'Digite una marca'
  if (!formMachine.placaSerial) return 'Digite placa o serial'
  if (!firmaTemporal.value) return 'Digite la firma'

  return ''
})

const displayMachineMessage = computed(() => {
  return errorMachine.value || mensajeMachine.value.message;
});

const confirmMessage = computed(() => {
  if (maquinaRegistrada.pc) {
    return "¿Desea registrar también un vehículo?"
  }

  if (maquinaRegistrada.vh) {
    return "¿Desea registrar también un computador?"
  }

  return ""
})


</script>
<style>

</style>
