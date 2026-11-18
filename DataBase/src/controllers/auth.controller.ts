import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { pool } from '../config/db'
import {
  CSRF_COOKIE_NAME,
  JWT_ALGORITHM,
  SESSION_COOKIE_NAME,
  getClearCsrfCookieOptions,
  getClearSessionCookieOptions,
  getCsrfCookieOptions,
  getSessionCookieOptions,
} from '../config/security'
import type { AuthRequest } from '../middlewares/admin.middleware'
import { generateCsrfToken, parseCookies } from '../utils/cookies'

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Faltan credenciales',
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

    const user = rows[0]

    // Nota: contraseñas en texto plano preexistentes (pendiente migrar a Argon2id/bcrypt)
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      })
    }

    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error('JWT_SECRET no está definido en el .env')
    }

    const token = jwt.sign(
      {
        id: String(user.id_usuario),
        email: user.email,
        rol: user.rol,
      },
      secret,
      { algorithm: JWT_ALGORITHM, expiresIn: '1d' }
    )

    const csrfToken = generateCsrfToken()

    res.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions())
    res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions())

    return res.json({
      success: true,
      data: {
        user: {
          id: String(user.id_usuario),
          email: user.email,
          rol: user.rol,
        },
        csrfToken,
      },
    })
  } catch (err) {
    console.error('Error en loginController:', err)
    return res.status(500).json({
      success: false,
      message: 'Error en login',
    })
  }
}

export const meController = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado',
    })
  }

  const cookies = parseCookies(req.headers.cookie)
  let csrfToken = cookies[CSRF_COOKIE_NAME]

  if (!csrfToken) {
    csrfToken = generateCsrfToken()
    res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions())
  }

  return res.json({
    success: true,
    data: {
      user: {
        id: String(req.user.id),
        email: req.user.email,
        rol: req.user.rol,
      },
      csrfToken,
    },
  })
}

export const logoutController = (_req: Request, res: Response) => {
  res.clearCookie(SESSION_COOKIE_NAME, getClearSessionCookieOptions())
  res.clearCookie(CSRF_COOKIE_NAME, getClearCsrfCookieOptions())

  return res.json({
    success: true,
    message: 'Sesión cerrada',
  })
}
