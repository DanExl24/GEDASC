import crypto from 'node:crypto'

export const parseCookies = (cookieHeader?: string): Record<string, string> => {
  const cookies: Record<string, string> = Object.create(null)

  if (!cookieHeader) {
    return cookies
  }

  for (const part of cookieHeader.split(';')) {
    const separatorIndex = part.indexOf('=')
    if (separatorIndex === -1) continue

    const rawName = part.slice(0, separatorIndex).trim()
    if (!rawName) continue

    const rawValue = part.slice(separatorIndex + 1).trim()
    try {
      cookies[rawName] = decodeURIComponent(rawValue)
    } catch {
      cookies[rawName] = rawValue
    }
  }

  return cookies
}

export const generateCsrfToken = (): string =>
  crypto.randomBytes(32).toString('base64url')

export const safeEqual = (a: string, b: string): boolean => {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')

  if (bufA.length !== bufB.length) {
    return false
  }

  return crypto.timingSafeEqual(bufA, bufB)
}
