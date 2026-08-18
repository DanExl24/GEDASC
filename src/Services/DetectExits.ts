const API = import.meta.env.VITE_API_URL

import type { DetectRegisterStatus } from "@/types/register.types";

export interface DetectExitResult {
  status: DetectRegisterStatus
  hasActiveSession?: boolean
  hasMachine?: boolean
  isEarlyExit?: boolean
  hora_fin?: string | null
}

export const DetectExit = async (
  documento: string
): Promise<DetectRegisterStatus> => {

  if (!documento) return 'error'

  try {
    const response = await fetch(`${API}/api/registroSalidas/verificarSalida/${documento}`)

    if (response.status === 404) {
      return 'no_existe'
    }

    if (!response.ok) {
      return 'error'
    }

    const data = await response.json()

    if (!data || typeof data.yaSalio === 'undefined') {
      return 'error'
    }

    if (!data.yaSalio) {
      return 'ok'
    }

    return 'ya_registrado'

  } catch (error) {
    console.error(error)
    return 'error'
  }
}

export const DetectExitFull = async (
  documento: string
): Promise<DetectExitResult> => {
  if (!documento) return { status: 'error' }

  try {
    const response = await fetch(`${API}/api/registroSalidas/verificarSalida/${documento}`)

    if (response.status === 404) {
      return { status: 'no_existe' }
    }

    if (!response.ok) {
      return { status: 'error' }
    }

    const data = await response.json()

    if (!data || typeof data.yaSalio === 'undefined') {
      return { status: 'error' }
    }

    if (!data.yaSalio) {
      return {
        status: 'ok',
        hasActiveSession: true,
        hasMachine: data.hasMachine,
        isEarlyExit: data.isEarlyExit,
        hora_fin: data.hora_fin
      }
    }

    return { status: 'ya_registrado', hasActiveSession: false }
  } catch (error) {
    console.error(error)
    return { status: 'error' }
  }
}
