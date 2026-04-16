const API = import.meta.env.VITE_API_URL

import type { DetectRegisterStatus } from "@/types/register.types/register.types";

export const DetectEntry = async (
  documento: string
): Promise<DetectRegisterStatus> => {

  if (!documento) return 'error';

  try {
    const response = await fetch(`${API}/api/registroIngresos/verificarEntrada/${documento}`);

    // 🔴 PRIMERO validar status
    if (response.status === 404) {
      return 'no_existe';
    }

    if (!response.ok) {
      return 'error';
    }

    // 🟢 SOLO aquí parseas JSON
    const data = await response.json();

    if (!data.yaIngresado) {
      return 'ok';
    } else {
      return 'ya_registrado';
    }

  } catch (error) {
    console.error(error);
    return 'error';
  }
}
