// Controlador para consultar id del aprendiz
import { Request, Response } from 'express'
import { pool } from '../config/db'

// funcion para traer
/**
 * @swagger
 * /api/aprendiz/{documento}:
 *   get:
 *     summary: Obtener el ID de un aprendiz mediante su número de documento
 *     tags: [Aprendices]
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ID del aprendiz encontrado
 */
export const getId = async (request : Request , response : Response) => {
  try{
    // traer documento
    const { documento } = request.params
    console.log(request.params)
    if(!documento) return response.status(400).json({message:"Datos invalidos"})

    // traer id del aprendiz mediante su documento
    const result = await pool.query('SELECT id_aprendiz FROM aprendiz WHERE documento = $1', [documento])

    if (result.rowCount === 0) {
      return response.status(404).json({ success: false, message: "Aprendiz no encontrado" })
    }

    // respuesta del servidor
    return response.status(200).json(result.rows[0])

  } catch (error) {
    console.error('[QueryId Error]:', error)
    return response.status(500).json({ success: false, message: "Error interno en el servidor", error: error })
  }
}
