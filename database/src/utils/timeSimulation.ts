// Servicio de Simulación de Tiempo para Pruebas de Administrador

let simulatedCustomTime: Date | null = null

export const setSimulatedTime = (timeString: string | null) => {
  if (!timeString) {
    simulatedCustomTime = null
    console.log('⏰ Simulación de tiempo desactivada. Usando hora real.')
    return { active: false, time: getSystemNow() }
  }

  // Aceptar formatos "HH:mm", "YYYY-MM-DD THH:mm", etc.
  const now = new Date()
  if (timeString.includes(':') && !timeString.includes('-')) {
    const [hours, minutes] = timeString.split(':').map(Number)
    now.setHours(hours, minutes, 0, 0)
    simulatedCustomTime = now
  } else {
    simulatedCustomTime = new Date(timeString)
  }

  console.log(`⏰ Hora simulada activa: ${simulatedCustomTime.toLocaleString()}`)
  return { active: true, time: simulatedCustomTime }
}

export const getSystemNow = (): Date => {
  if (simulatedCustomTime) {
    return new Date(simulatedCustomTime.getTime())
  }
  return new Date()
}

export const getSimulatedTimeState = () => {
  return {
    isSimulated: simulatedCustomTime !== null,
    simulatedTime: simulatedCustomTime ? simulatedCustomTime.toISOString() : null,
    formattedTime: getSystemNow().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }
}
