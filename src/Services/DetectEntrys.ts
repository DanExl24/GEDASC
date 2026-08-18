const API = import.meta.env.VITE_API_URL

import type { DetectRegisterStatus } from "@/types/register.types";
import type { VerificationScheduleContext } from "@/types/aprendiz.types";

export const DetectEntry = async (
  documento: string
): Promise<{
  status: DetectRegisterStatus
  es_monitor?: boolean
  activeSession?: boolean
  hasMachine?: boolean
  id_detallemaquina?: number
  id_ingreso?: number
  id_aprendiz?: number
  isReentry?: boolean
  isEarlyExit?: boolean
  hora_fin?: string | null
  schedule?: VerificationScheduleContext
}> => {

  if (!documento) return { status: 'error' };

  try {
    const response = await fetch(`${API}/api/registroIngresos/verificarEntrada/${documento}`);

    // 🔴 PRIMERO validar status
    if (response.status === 404) {
      return { status: 'no_existe' };
    }

    if (!response.ok) {
      return { status: 'error' };
    }

    // 🟢 SOLO aquí parseas JSON
    const data = await response.json();

    return {
      status: 'ok',
      es_monitor: data.es_monitor,
      activeSession: data.activeSession,
      hasMachine: data.hasMachine,
      id_detallemaquina: data.id_detallemaquina,
      id_ingreso: data.id_ingreso,
      id_aprendiz: data.id_aprendiz,
      isReentry: data.isReentry,
      isEarlyExit: data.isEarlyExit,
      hora_fin: data.hora_fin,
      schedule: data.schedule
    };

  } catch (error) {
    console.error(error);
    return { status: 'error' };
  }
}
