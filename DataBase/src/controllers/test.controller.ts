import { Request, Response } from 'express'
import { pool } from '../config/db'

// controlador de testeo del servidor
/**
 * @swagger
 * /api:
 *   get:
 *     summary: Probar la conexión a la base de datos
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Conexión exitosa, devuelve la hora de la DB
 */
export const testDB = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()')
    res.json(result.rows)
  } catch (error) {
    console.error('DB ERROR:', error)
    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    })
  }
}
