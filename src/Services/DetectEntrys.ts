// Servicio para detectar entradas

export const DetectEntry = async (documento : string) =>{
  // Evitar mandar codigo vacio
  if(!documento) return;
  // Realizar consulta
  try{
    const response = await fetch(`http://localhost:3000/api/registroIngresos/verificarEntrada/${documento}`)
    const data = await response.json()
    if(response.ok){ // Si data.yaIngresado da false, es porque no tiene un registro
      if(!data.yaIngresado){
        return true //Retornar true para que pueda ingresar
      }
      else{
        return false // Retornar false para que no pueda ingresar
      }
    }
    else{
      console.log(data)
    }
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}
