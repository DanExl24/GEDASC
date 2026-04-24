import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db'

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Faltan credenciales'
    })
  }

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

    //  aquí por ahora password plano (mejorable con bcrypt después)
    if (user.password !== password) {
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
