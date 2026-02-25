// Funcion para consultar Documento de Aprendiz
export const QueryDocument = async (documento : string) => {
  console.log(documento)
  // Evitar mandar codigo vacio
  if(!documento) return;
  // Realizar consulta
  try{
    const response = await fetch(`http://localhost:3000/api/aprendiz/${documento}`)
    const data = await response.json()
    if(response.ok && data){
      return true
    }
    else{
      console.log(data)
    }
    console.log(data)
  } catch (error) {
    console.error(error)
  }
}
