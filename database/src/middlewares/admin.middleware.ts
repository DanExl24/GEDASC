import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

type UserToken = JwtPayload & {
  id: string
  rol: 'ADMIN' | 'CELADOR'
}

interface AuthRequest extends Request {
  user?: UserToken
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserToken
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

export const requireRole = (roles: ('ADMIN' | 'CELADOR')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' })
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permisos' })
    }

    next()
  }
}
