<template>
  <ModalSelectReason
    :is-open="isOpen"
    title="Salida Anticipada"
    :subtitle="scheduledEndTime ? `Fin oficial de clase: ${scheduledEndTime}` : 'Horario no finalizado'"
    label="Motivo de Egreso Anticipado"
    alert-title="⚠️ Advertencia de Horario Académico"
    alert-message="El aprendiz está registrando su salida antes del horario de finalización de su formación. Seleccione el motivo justificado."
    :options="predefinedReasons"
    variant="amber"
    size="md"
    confirm-text="Confirmar Salida"
    cancel-text="Cancelar"
    custom-label="Especifique la justificación"
    custom-placeholder="Detalle el motivo de la salida anticipada..."
    @close="$emit('close')"
    @confirm="(reason) => $emit('confirm', reason)"
  />
</template>

<script setup lang="ts">
import ModalSelectReason from '@/components/UI/ModalSelectReason.vue'

defineProps<{
  isOpen: boolean
  scheduledEndTime?: string | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'confirm', reason: string): void
}>()

const predefinedReasons = [
  'Permiso concedido por Instructor',
  'Cita médica / Salud',
  'Calamidad doméstica justificada',
  'Finalización anticipada de actividades lectivas',
  'Trámite institucional CTA',
  'Otro'
]
</script>
