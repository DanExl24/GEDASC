import { Request, Response } from 'express'
import { pool } from '../config/db'

// controlador de testeo del servidor
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
