import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db'
import bcrypt from 'bcryptjs'

import { loginSchema } from '../schemas/auth.schema'

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@gedasc.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Credenciales inválidas o incompletas
 */
export const loginController = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    })
  }

  const { email, password } = result.data

  try {
    const { rows } = await pool.query(
      `
      SELECT
        u.id_usuario,
        u.email,
        u.password,
        u.id_rol,
        r.nombre AS rol
      FROM usuarios u
      JOIN roles r ON r.id_rol = u.id_rol
      WHERE u.email = $1
      `,
      [email]
    )

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      })
    }

    const user = rows[0]

    // Comparar contraseña usando bcrypt
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta'
      })
    }
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET no está definido en el .env')
  }
    const token = jwt.sign(
      {
        id: user.id_usuario,
        email: user.email,
        rol: user.rol
      },
      secret,
      { expiresIn: '1d' }
    )

    return res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id_usuario,
          email: user.email,
          rol: user.rol
        }
      }
    })

  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Error en login'
    })
  }
}
