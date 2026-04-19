import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { MaquinaDetalleUI } from '@/types/machineDetails.types'

export const useMachineDetailStatus = (
  detail: MaybeRefOrGetter<Pick<MaquinaDetalleUI, 'estado'>>,
) => {
  const showOwner = computed(() => toValue(detail).estado === 'PRESTADA')

  const estadoUI = computed(() => {
    const { estado } = toValue(detail)

    if (estado === 'PRESTADA') {
      return { text: 'MAQUINA PRESTADA', type: 'error' as const }
    }

    if (estado === 'NO_PRINCIPAL') {
      return { text: 'MAQUINA NO PRINCIPAL', type: 'error' as const }
    }

    return { text: '', type: 'success' as const }
  })

  return {
    showOwner,
    estadoUI,
  }
}
