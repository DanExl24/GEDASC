import type { NextFunction, Request, Response } from 'express'
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  isOriginAllowed,
} from '../config/security'
import { parseCookies, safeEqual } from '../utils/cookies'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    return next()
  }

  const origin = req.get('origin')
  if (origin && !isOriginAllowed(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Origen no permitido para esta operación',
    })
  }

  const cookies = parseCookies(req.headers.cookie)
  const csrfCookie = cookies[CSRF_COOKIE_NAME]
  const csrfHeader = req.get(CSRF_HEADER_NAME)

  if (!csrfCookie || !csrfHeader || !safeEqual(csrfCookie, csrfHeader)) {
    return res.status(403).json({
      success: false,
      message: 'Token CSRF inválido o ausente',
    })
  }

  return next()
}
