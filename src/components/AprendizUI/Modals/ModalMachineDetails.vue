<template>
  <BaseModal @close="close" ref="modalRef" title="Máquinas registradas">
    <div class="grid gap-4">

      <!-- ENCABEZADO Y BOTON AGREGAR MÁS EQUIPOS -->
      <div class="flex justify-between items-center rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider text-emerald-800">Equipos de la Sesión</p>
          <p class="text-xs text-slate-500">
            {{ maquinaDetalle?.items?.length || 0 }} {{ (maquinaDetalle?.items?.length || 0) === 1 ? 'equipo registrado' : 'equipos registrados' }}
          </p>
        </div>
        <BaseButtonOpen
          text="➕ Agregar más equipos/vehículos"
          variant="green"
          class-button="min-h-0 text-xs px-3 py-2 font-bold"
          @click="handleAddMore"
        />
      </div>

      <!-- LISTA DE EQUIPOS DE LA SESION -->
      <div
        v-for="(item, index) in maquinaDetalle?.items"
        :key="item.id_detallemaquina || index"
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid gap-3"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-2">
          <span class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
            Equipo #{{ index + 1 }}
          </span>
          <span
            :class="item.estado_equipo === 'retirado' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
            class="inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
          >
            {{ item.estado_equipo === 'retirado' ? 'Retirado' : 'Dentro del centro' }}
          </span>
        </div>

        <!-- PC -->
        <div v-if="item.pc" class="rounded-xl bg-slate-50 p-3">
          <BaseText v-if="estadoUI.text" :type="estadoUI.type" :text="estadoUI.text" />
          <h4 class="font-robotoSlab text-base font-bold text-slate-900">Computador</h4>
          <BaseText type="success" :text="`Marca: ${item.pc.marca}`" />
          <BaseText type="success" :text="`Serial: ${item.pc.serial}`" />
          <BaseText
            v-if="showOwner && item.aprendices.owner.name"
            type="error"
            :text="`PERTENECE A: ${item.aprendices.owner.name}`"
          />
        </div>

        <!-- VEHICULO -->
        <div v-if="item.vh" class="rounded-xl bg-slate-50 p-3">
          <BaseText v-if="estadoUI.text" :type="estadoUI.type" :text="estadoUI.text" />
          <h4 class="font-robotoSlab text-base font-bold text-slate-900">Vehículo</h4>
          <BaseText type="success" :text="`Tipo: ${normalizeVehicleType(item.vh.tipo_vehiculo)}`" />
          <BaseText type="success" :text="`Marca: ${item.vh.marca}`" />
          <BaseText type="success" :text="`Placa: ${item.vh.placa}`" />
          <BaseText
            v-if="showOwner && item.aprendices.owner.name"
            type="error"
            :text="`PERTENECE A: ${item.aprendices.owner.name}`"
          />
        </div>

        <!-- FIRMA INGRESO -->
        <div v-if="item.firma" class="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-3">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-senaColor">Firma de ingreso</p>
          <img :src="item.firma" class="mt-2 max-h-28 rounded-lg border bg-white p-1" alt="Firma de ingreso" />
        </div>

        <!-- FIRMA DE SALIDA -->
        <div v-if="item.firma_salida && item.firma_salida !== 'Sin firma de salida'" class="rounded-xl border border-dashed border-slate-300 bg-slate-100 p-3">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Firma de salida</p>
          <p v-if="item.hora_retiro_equipo" class="text-[11px] text-slate-500 mb-1">Retirado en: {{ formatDateTime(item.hora_retiro_equipo) }}</p>
          <img :src="item.firma_salida" class="max-h-28 rounded-lg border bg-white p-1" alt="Firma de salida" />
        </div>

        <!-- BOTON REGISTRAR RETIRO DE ESTE ACTIVO ESPECÍFICO -->
        <div v-if="item.estado_equipo !== 'retirado' && activeRetiroId !== item.id_detallemaquina" class="flex justify-end pt-1">
          <BaseButtonOpen
            text="Registrar retiro de equipo"
            variant="green"
            class-button="min-h-0 text-xs px-3 py-1.5 font-bold"
            @click="activeRetiroId = item.id_detallemaquina"
          />
        </div>

        <!-- CANVAS FIRMA RETIRO PARA ESTE ACTIVO ESPECÍFICO -->
        <div v-if="activeRetiroId === item.id_detallemaquina" class="rounded-xl border border-dashed border-emerald-200 bg-emerald-50 p-3">
          <h4 class="font-semibold text-slate-900 text-sm">Firma de salida requerida</h4>
          <p class="mb-2 text-xs text-slate-500">Capture la firma del aprendiz para retirar este equipo</p>
          <SignaturePad @update:signature="(sig) => registrarFirmaSalidaItem(item.id_detallemaquina, sig)" />
          <button type="button" class="mt-2 text-xs font-semibold text-slate-500 hover:underline" @click="activeRetiroId = null">Cancelar</button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/Modals/BaseModal.vue'
import BaseText from '@/components/Text/BaseText.vue'
import BaseButtonOpen from '@/components/Buttons/BaseButtonOpen.vue'
import SignaturePad from '@/components/Library/SignaturePad.vue'
import { useMachineService } from '@/composables/API/useMachineService'
import { useMachineDetailStatus } from '@/composables/useMachineDetailStatus'
import { normalizeVehicleType } from '@/utils/vehicleType'
import { formatDateTime } from '@/utils/formatDate'
import type { MaquinaDetalleUI } from '@/types/machineDetails.types'
import { API_URL } from '@/config/network'

const emit = defineEmits<{
  (e: 'retired'): void
  (e: 'close'): void
  (e: 'add-more-machines'): void
}>()

const { getDetalleMaquina } = useMachineService()

const maquinaDetalle = ref<MaquinaDetalleUI | null>(null)
const modalRef = ref()
const activeRetiroId = ref<number | null>(null)
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
  activeRetiroId.value = null
  maquinaDetalle.value = await getDetalleMaquina(ID)
}

const handleAddMore = () => {
  emit('add-more-machines')
  close()
}

const registrarFirmaSalidaItem = async (idDetalle: number | null, firma: string) => {
  if (!idDetalle) return

  try {
    const response = await fetch(
      `${API_URL}/api/registroSalidas/retirarEquipo/${idDetalle}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firma_salida: firma })
      }
    )

    if (response.ok) {
      activeRetiroId.value = null
      if (currentID.value !== null) {
        await load(currentID.value)
      }
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
