import type { Request, Response } from 'express'
import { pool } from '../config/db'
import bcrypt from 'bcryptjs'

interface AuthRequest extends Request {
  user?: {
    id?: string | number
    id_usuario?: string | number
  }
}

export const ActivarValidador = async (req: Request, res: Response) => {
  const { device_id, nombre_dispositivo, forzarDesactivacion } = req.body
  const user = (req as AuthRequest).user

  if (!device_id) {
    return res.status(400).json({ message: "ID de dispositivo obligatorio" })
  }

  const userId = user?.id || user?.id_usuario || null

  try {
    // 1. Consultar si existe otro dispositivo activo actualmente
    const activeCheck = await pool.query(
      `SELECT vf.*, u.email AS usuario_email
       FROM validadores_firma vf
       LEFT JOIN usuarios u ON u.id_usuario = vf.id_usuario
       WHERE vf.activo = TRUE
       LIMIT 1`
    )

    if (activeCheck.rowCount && activeCheck.rowCount > 0) {
      const activeDevice = activeCheck.rows[0]
      if (activeDevice.device_id !== device_id && !forzarDesactivacion) {
        return res.status(409).json({
          aviso: 'validadorExistente',
          message: 'Ya existe otro dispositivo móvil registrado como validador de firmas activo.',
          validadorActual: {
            device_id: activeDevice.device_id,
            nombre_dispositivo: activeDevice.nombre_dispositivo,
            usuario: activeDevice.usuario_email || 'Celador',
            fecha_registro: activeDevice.fecha_registro
          }
        })
      }
    }

    // 2. Desactivar cualquier validador anterior si se fuerza o se activa uno nuevo
    await pool.query(`UPDATE validadores_firma SET activo = FALSE WHERE activo = TRUE`)

    // 3. Registrar o reactivar el dispositivo actual
    await pool.query(
      `INSERT INTO validadores_firma (device_id, id_usuario, nombre_dispositivo, activo, ultimo_ping)
       VALUES ($1, $2, $3, TRUE, NOW())
       ON CONFLICT (device_id) 
       DO UPDATE SET 
         activo = TRUE,
         id_usuario = EXCLUDED.id_usuario,
         nombre_dispositivo = EXCLUDED.nombre_dispositivo,
         ultimo_ping = NOW()`,
      [device_id, userId, nombre_dispositivo || 'Dispositivo Móvil Portería']
    )

    return res.status(200).json({
      message: 'Dispositivo activado correctamente como validador de firmas',
      device_id,
      activo: true
    })
  } catch (error) {
    console.error('[ValidadorController] Error al activar validador:', error)
    return res.status(500).json({ message: 'Error interno al activar validador' })
  }
}

export const DesactivarValidador = async (req: Request, res: Response) => {
  const { device_id, password } = req.body
  const user = (req as AuthRequest).user

  if (!device_id) {
    return res.status(400).json({ message: "ID de dispositivo obligatorio" })
  }

  if (!password) {
    return res.status(400).json({ message: "La contraseña de confirmación es obligatoria" })
  }

  const userId = user?.id || user?.id_usuario

  try {
    // 1. Obtener la contraseña encriptada del usuario autenticado
    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado" })
    }

    const userQuery = await pool.query(`SELECT password FROM usuarios WHERE id_usuario = $1`, [userId])

    if (!userQuery.rowCount || userQuery.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    const dbPassword = userQuery.rows[0].password

    // 2. Verificar la contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, dbPassword)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña incorrecta. No se pudo desvincular el dispositivo." })
    }

    // 3. Desactivar el validador
    await pool.query(
      `UPDATE validadores_firma SET activo = FALSE WHERE device_id = $1`,
      [device_id]
    )

    return res.status(200).json({
      message: 'Dispositivo desvinculado correctamente',
      activo: false
    })
  } catch (error) {
    console.error('[ValidadorController] Error al desactivar validador:', error)
    return res.status(500).json({ message: 'Error interno al desactivar validador' })
  }
}

export const ObtenerEstadoValidador = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT vf.*, u.email AS usuario_email
       FROM validadores_firma vf
       LEFT JOIN usuarios u ON u.id_usuario = vf.id_usuario
       WHERE vf.activo = TRUE
       LIMIT 1`
    )

    if (result.rowCount === 0) {
      return res.status(200).json({
        activo: false,
        validador: null
      })
    }

    const validador = result.rows[0]

    return res.status(200).json({
      activo: true,
      validador: {
        device_id: validador.device_id,
        nombre_dispositivo: validador.nombre_dispositivo,
        usuario: validador.usuario_email || 'Celador',
        fecha_registro: validador.fecha_registro,
        ultimo_ping: validador.ultimo_ping
      }
    })
  } catch (error) {
    console.error('[ValidadorController] Error al obtener estado validador:', error)
    return res.status(500).json({ message: 'Error interno al consultar validador' })
  }
}
