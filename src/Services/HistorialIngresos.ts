export const HistorialIngresos = async () => {
  try {
    const response = await fetch(`${API}/api/registroIngresos/historial`)
    const data = await response.json()

    aprendizData.value = data as Aprendiz[]
  } catch (error) {
    console.error(error)
  }
}
