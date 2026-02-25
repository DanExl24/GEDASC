// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'

// funcion para traer
export const getId = async (request : Request , response : Response) => {
  try{
    // traer documento
    const { documento } = request.params
    console.log(request.params)
    if(!documento) return response.status(400).json({message:"Datos invalidos"})

    // traer id del aprendiz mediante su documento
    const result = await pool.query('SELECT id_aprendiz FROM aprendiz  WHERE documento = $1',[documento])

    // respuesta del servidor
    response.status(200).json(result.rows[0])

  } catch (error) {
    console.error(error)
    response.status(500).json({message:"Hay un error", error: error})
  }
}
