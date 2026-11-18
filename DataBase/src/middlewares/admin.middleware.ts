import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { JWT_ALGORITHM, SESSION_COOKIE_NAME } from '../config/security'
import { parseCookies } from '../utils/cookies'

export type UserToken = JwtPayload & {
  id: string
  email: string
  rol: 'ADMIN' | 'CELADOR'
}

export interface AuthRequest extends Request {
  user?: UserToken
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[SESSION_COOKIE_NAME]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado',
    })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({
      success: false,
      message: 'Error de configuración de autenticación',
    })
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    }) as UserToken
    req.user = decoded
    return next()
  } catch {
    return res.status(401).json({
      success: false,
      message: 'Sesión inválida o expirada',
    })
  }
}

export const requireRole = (roles: ('ADMIN' | 'CELADOR')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado',
      })
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos',
      })
    }

    return next()
  }
}
