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
          <SearchBar v-model="queryAprendices"/>
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
            <BaseButtonOpen v-if="index === 0" @click="openMachine(aprendiz)" class-button="m-auto my-1 py-0 px-2 rounded-sm bg-blue-700 min-w-min text-center" text="Ingresar Maquina"/>
            <BaseText v-else-if="aprendiz.id_detallemaquina == null" text="No registrada" type="error"/>
            <BaseText v-else-if="aprendiz.id_detallemaquina != null" text="Registro Exitoso" type="success"/>
          </td>
        </BaseColumn>
      </BaseTable>
        <!--Modal de registro Manual  -->
        <BaseModal ref="modalMachine" :title="`Registro de máquina de ${aprendizMachine?.nombre}`">
          <BaseForm method="POST" :submit="() => submitMachine(aprendizMachine?.id_aprendiz)">
            <BaseSelect placeholder="Tipo de Maquina" v-model:model-value="formMachine.TipoMaquina" :options="optionsMachine"/>
            <BaseSelect v-if="formMachine.TipoMaquina == 'vh'" placeholder="Tipo de Vehiculo" v-model:model-value="formMachine.tipoVehiculo" :options="optionsVehicle"/>
            <BaseField v-model="formMachine.modeloMaquina" label="Modelo de Maquina" place-holder="Modelo" type="text"/>
            <BaseField :disabled="submittedMachine" :max-length="formMachine.TipoMaquina=='vh' ? 7 : 100"  v-model="formMachine.placaSerial" label="Placa/Serial de Maquina" place-holder="Placa o Serial" type="text" />            <!--Texto de alerta  -->
            <BaseText :text="displayMachineMessage" :type="mensajeMachine.type"/>
            <BaseButtonOpen class="!bg-orange-500 px-1 py-1" text="Ingresar Firma" @click="openFirma"/>

            <BaseButton text="Añadir Maquina" type="submit"/>
          </BaseForm>
        </BaseModal>
        <!--Modal de Firma del aprendiz  -->
        <BaseModal class="flex items-center justify-center" @close="closeFirma" ref="modalFirma" :title="`Firma de ${aprendizMachine?.nombre}`">
          <!-- Renderizar la firma-->
           <SignaturePad v-model:signature="formMachine.firma" />
        </BaseModal>
    </div>
  </div>
</template>
<script setup lang="ts">

// ==================== DEPENDENCIAS ============================= //

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
import SignaturePad from '@/components/Library/SignaturePad.vue';
import { useRoute } from 'vue-router'

// ============================== ENTORNO ====================== //

const API = import.meta.env.VITE_API_URL


// ========================= VARIABLES REACTIVAS Y REFS ================== //

const scannerModal = ref<InstanceType<typeof BarcodeScanner> | null>(null)
const modalManual = ref()
const aprendizData = ref<Aprendiz[]>([])
const queryAprendices = ref('')
const modalMachine = ref()
const aprendizMachine  = ref<Aprendiz>()
const modalFirma = ref()
const submittedMachine = ref(false);
const route = useRoute()

// -- Alerta de formulario manual -- //
const alerta = ref({message: '', type: 'error' as 'error' | 'success'})

// -- Alerta de formulario de maquina -- //
const mensajeMachine = ref({message: '', type: 'error' as 'error' | 'success'})


// =================================== FORMS ================================ //

// Campos del formulario manual
const formManual = reactive({documento: '', nombre: '', apellido: '', formacion: ''})

// Campos del formulario de maquia
const formMachine = reactive({modeloMaquina : '', TipoMaquina: '', tipoVehiculo: '', placaSerial: '', firma: ''})





// ============================== INTERFACES ======================== //

// -- Interfaz para aprendices --S
export interface Aprendiz {id_aprendiz: number, nombre: string, apellido: string, documento: string, formacion: string, hora_ingreso: string, id_detallemaquina : number}





// ========================== FUNCIONES ================================ //


// -- DETECTAR APRENDICES REGISTRADOS EN EL INGRESO DE APRENDICES-- //
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

// -- INGRESAR APRENDICES -- //
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

// -- HISTORIAL DE APRENDICES -- //
const HistorialIngresos = async () => {
  try{
    // historial de ingresos
    const response = await fetch(`${API}/api/registroIngresos/historial`)
    const data = await response.json()
    console.log(data)

    aprendizData.value = data as  Aprendiz[]

  } catch (error) {
    console.error(error)
  }
}



// ================================ ON MOUNTED ---------------------------- //
onMounted(() => {
  HistorialIngresos(); // esto trae el historial apenas se abre la vista


  // cerrar modal automáticamente si la ruta es de firma

  if (route.path.startsWith('/general-entry/firma/')) {
    modalFirma.value?.closeModal()
    router.push('/general-entry') // Para que no haya conveniente3s entre ruats
  }

});


// ============================== MODALES ============================== //

// -- ABRIR SCANNER -- //
const open = () => {
  scannerModal.value?.openScanner()
}

// -- ABRIR EL MODAL PARA REGISTRO MANUAL -- //
const openManual = ()=>{
  modalManual.value.openModal()
  // vaciar todos los campos
    alerta.value.message = ''
    formManual.documento = ''
    formManual.nombre = ''
    formManual.apellido = ''
    formManual.formacion = ''
}

// -- ABRIR EL MODAL PARA INGRESAR MAQUINA -- //
const openMachine = (aprendiz : Aprendiz) =>{
  aprendizMachine.value = aprendiz
  modalMachine.value.openModal()
  for(const key in formMachine){
    formMachine[key as keyof typeof formMachine] = '' // Vaciar campos
  }
}

const openFirma = () => {
  if (!aprendizMachine.value) return

  modalFirma.value.openModal()

  router.push(`/general-entry/firma/${aprendizMachine.value.documento}`)
}

const closeFirma = () =>{
  router.push(`/general-entry`)
}

// =========================== EVENTOS SUBMITS ============================= //

// -- INGRESAR APRENDIZ A REGISTRO DE INGRESO -- //
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

  // Ahora sí llamamos a la función de registro
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
  if (!id_aprendiz) return;
  if (!id_aprendiz || submittedMachine.value) return; // bloquea si ya se está enviando

  // marcar que se hizo submit
  submittedMachine.value = true;

  // VALIDACIÓN DE CAMPOS VACÍOS
  // tipoVehiculo solo es obligatorio si es vehículo
  if (!formMachine.TipoMaquina ||
      (formMachine.TipoMaquina === 'vh' && !formMachine.tipoVehiculo) ||
      !formMachine.modeloMaquina ||
      !formMachine.placaSerial ||
      !formMachine.firma) {
    mensajeMachine.value = {
      message: 'Todos los campos son obligatorios',
      type: 'error'
    };
    return; // detener submit
  }

  try {
    const response = await fetch(`${API}/api/registroIngresos/ingresoMaquina/${id_aprendiz}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoMaquina: formMachine.TipoMaquina,
        tipoVehiculo: formMachine.tipoVehiculo,
        modelo: formMachine.modeloMaquina.toUpperCase(),
        placaSerial: formMachine.placaSerial.toUpperCase(),
        firma: formMachine.firma
      })
    });

    const data = await response.json();
    console.log(data);

    // Después de fetch exitoso
    mensajeMachine.value = { message: 'Máquina ingresada con éxito', type: 'success' };

    // opcional: refrescar tabla si quieres mostrar la nueva máquina en la UI
    await HistorialIngresos();

    // Esperar un segundo antes de cerrar modal
    setTimeout(() => {
      modalMachine.value.closeModal();
      submittedMachine.value = false; // desbloquear después de cerrar
    }, 1000);

  } catch (error) {
    console.error(error);
    mensajeMachine.value = { message: 'Error al registrar la máquina', type: 'error' };
  }
 finally {
    submittedMachine.value = false; // desbloquear después
  }
};


// ================================== WATCHS =========================== //

// -- VERIFICAR SI HAY BUSQUEDA DE APRENDICES -- //
watch(queryAprendices, async (nuevoTexto) => {

  if (!nuevoTexto.trim()) {await HistorialIngresos(); return} //si no hay texto

  const data = await SearchAprendiz(nuevoTexto) // si hay texto

  aprendizData.value = data // Pasar el aprendiz encontrado en busqueda

})

watch(formMachine, () => {
  submittedMachine.value = false; // limpiar errores si el usuario cambia algo
}, { deep: true });


// Vigilar cambios en la firma
watch(
  () => formMachine.firma,
  (nuevaFirma) => {
    if (nuevaFirma) {
      console.log(nuevaFirma)
      // Si ya hay firma y el modal está abierto, cerramos
      modalFirma.value.closeModal();
    }
  }
);

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
  formMachine.firma = '';

  // También puedes resetear errores si quieres
  mensajeMachine.value = { message: '', type: 'error' };
});

// ========================== COMPUTEDS ================================= //

const errorMachine = computed(() => {
  if (!submittedMachine.value) return '' // no mostrar nada hasta que se haga submit
  if (!formMachine.TipoMaquina) return 'Ingrese un tipo de maquina'
  if (formMachine.TipoMaquina === 'vh' && !formMachine.tipoVehiculo) return 'Ingrese un tipo de vehiculo'
  if (!formMachine.modeloMaquina) return 'Digite un modelo'
  if (!formMachine.placaSerial) return 'Digite placa o serial'
  if (!formMachine.firma) return 'Digite la firma'

  return ''
})

const displayMachineMessage = computed(() => {
  return errorMachine.value || mensajeMachine.value.message;
});


</script>
<style>

</style>
