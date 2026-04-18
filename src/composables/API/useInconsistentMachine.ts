const permisoDeMaquina = async (quiereForzar : boolean)=> {
  if(!otherMachineAprendiz.id_aprendiz) return
  console.log(quiereForzar)
  if(quiereForzar){
    const response = await fetch(`${API}/api/registroIngresos/ingresoMaquina/${otherMachineAprendiz.id_aprendiz}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...buildMachinePayload(),
        forzarExcepcion: true
      }),
    })
    const data = await response.json()
    console.log(data)
    if(!data.excepcion){
      incosistenciaMaquina.value = true
      return
    }
    if(data.idDetallesMaquina){
      incosistenciaMaquina.value = false
      machineOtroAprendiz.value.closeModal()
      return
    }
  }
  else{
    machineOtroAprendiz.value.closeModal()
    clearMachineForm()
  }
}
const otherMachineAprendiz = reactive<{ id_aprendiz?: number }>({})


const cerrarModalFirma = () => {
  modalMachine.value.closeModal()

}
