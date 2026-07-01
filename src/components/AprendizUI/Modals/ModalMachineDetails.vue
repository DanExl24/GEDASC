<template>
  <BaseModal @close="close" ref="modalRef" title="Máquinas registradas">
    <div class="grid gap-4">
      <!-- PC -->
      <div
        v-if="maquinaDetalle?.pc"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <BaseText
          v-if="estadoUI.text"
          :type="estadoUI.type"
          :text="estadoUI.text"
        />

        <h3 class="font-robotoSlab text-lg font-bold text-slate-900">
          Computador
        </h3>

        <BaseText type="success" :text="`Marca: ${maquinaDetalle.pc.marca}`" />
        <BaseText type="success" :text="`Serial: ${maquinaDetalle.pc.serial}`" />
        <BaseText
          v-if="showOwner && maquinaDetalle?.aprendices.owner.name"
          type="error"
          :text="`PERTENECE A: ${maquinaDetalle.aprendices.owner.name}`"
        />
      </div>

      <!-- VEHICULO -->
      <div
        v-if="maquinaDetalle?.vh"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <BaseText
          v-if="estadoUI.text"
          :type="estadoUI.type"
          :text="estadoUI.text"
        />



        <h3 class="font-robotoSlab text-lg font-bold text-slate-900">
          Vehiculo
        </h3>

        <BaseText
          type="success"
          :text="`Tipo: ${normalizeVehicleType(maquinaDetalle.vh.tipo_vehiculo)}`"
        />
        <BaseText type="success" :text="`Marca: ${maquinaDetalle.vh.marca}`" />
        <BaseText type="success" :text="`Placa: ${maquinaDetalle.vh.placa}`" />
        <BaseText
          v-if="showOwner && maquinaDetalle?.aprendices.owner.name"
          type="error"
          :text="`PERTENECE A: ${maquinaDetalle.aprendices.owner.name}`"
        />
      </div>

      <!-- FIRMA -->
      <div
        v-if="maquinaDetalle?.firma"
        class="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4"
      >
        <h3 class="mb-2 font-semibold text-slate-900">
          Firma de ingreso del aprendiz
        </h3>

        <img
          :src="maquinaDetalle.firma"
          class="w-48 rounded-xl border bg-white"
          alt="Firma del aprendiz"
        />
      </div>

      <!-- ESTADO DEL EQUIPO -->
      <div
        v-if="maquinaDetalle"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
      >
        <h3 class="mb-2 font-robotoSlab text-lg font-bold text-slate-900">
          Estado del equipo
        </h3>
        <BaseText
          v-if="maquinaDetalle.estado_equipo === 'retirado'"
          type="success"
          text="Estado: RETIRADO DEL CENTRO"
        />
        <BaseText
          v-else
          type="error"
          text="Estado: DENTRO DEL CENTRO"
        />
        <p v-if="maquinaDetalle.hora_retiro_equipo" class="mt-1 text-xs text-slate-500">
          Retirado en: {{ maquinaDetalle.hora_retiro_equipo }}
        </p>
      </div>

      <!-- FIRMA DE SALIDA -->
      <div
        v-if="maquinaDetalle?.firma_salida && maquinaDetalle?.firma_salida !== 'Sin firma de salida'"
        class="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-4"
      >
        <h3 class="mb-2 font-semibold text-slate-900">
          Firma de salida del aprendiz
        </h3>

        <img
          :src="maquinaDetalle.firma_salida"
          class="w-48 rounded-xl border bg-white"
          alt="Firma de salida"
        />
      </div>

      <!-- BOTON REGISTRAR RETIRO -->
      <div
        v-if="maquinaDetalle && maquinaDetalle.estado_equipo !== 'retirado' && !mostrarFirmaRetiro"
        class="flex justify-center p-2"
      >
        <BaseButtonOpen
          text="Registrar retiro de equipo"
          variant="green"
          @click="mostrarFirmaRetiro = true"
        />
      </div>

      <!-- CANVAS FIRMA RETIRO -->
      <div
        v-if="mostrarFirmaRetiro"
        class="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 p-4"
      >
        <h3 class="font-semibold text-slate-900">Firma de salida requerida</h3>
        <p class="mb-2 text-xs text-slate-500">Capture la firma del aprendiz para retirar el equipo</p>
        <SignaturePad @update:signature="registrarFirmaSalida" />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'

const emit = defineEmits<{
  (e: 'retired'): void
  (e: 'close'): void
}>()
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import SignaturePad from '@/components/Library/SignaturePad.vue'
import { useMachineService } from '@/composables/API/useMachineService'
import { useMachineDetailStatus } from '@/composables/useMachineDetailStatus'
import { normalizeVehicleType } from '@/utils/vehicleType'
import type { MaquinaDetalleUI } from '@/types/machineDetails.types'
import { API_URL } from '@/config/network'

const { getDetalleMaquina } = useMachineService()

const maquinaDetalle = ref<MaquinaDetalleUI | null>(null)
const modalRef = ref()
const mostrarFirmaRetiro = ref(false)
const currentID = ref<number | null>(null)

const { showOwner, estadoUI } = useMachineDetailStatus({
  get estado() {
    return maquinaDetalle.value?.estado ?? 'NORMAL'
  }
})

/* =========================
   LOAD
========================= */

const load = async (ID: number) => {
  currentID.value = ID
  mostrarFirmaRetiro.value = false
  maquinaDetalle.value = await getDetalleMaquina(ID)
}

const registrarFirmaSalida = async (firma: string) => {
  if (!maquinaDetalle.value?.id_detallemaquina) return

  try {
    const response = await fetch(
      `${API_URL}/api/registroSalidas/retirarEquipo/${maquinaDetalle.value.id_detallemaquina}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firma_salida: firma })
      }
    )

    if (response.ok) {
      if (currentID.value !== null) {
        await load(currentID.value)
      }
      mostrarFirmaRetiro.value = false
      emit('retired')
    } else {
      console.error('Error al registrar retiro')
    }
  } catch (error) {
    console.error(error)
  }
}

/* =========================
   MODAL CONTROL
========================= */

const open = () => modalRef.value?.openModal()
const close = () => modalRef.value?.closeModal()

defineExpose({ open, close, load })
</script>
