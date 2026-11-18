import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'

import { parseCookies, generateCsrfToken, safeEqual } from '../dist/utils/cookies.js'
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  SESSION_COOKIE_NAME,
  getCsrfCookieOptions,
  getSessionCookieOptions,
  isOriginAllowed,
} from '../dist/config/security.js'
import { authMiddleware } from '../dist/middlewares/admin.middleware.js'
import { csrfProtection } from '../dist/middlewares/csrf.middleware.js'
import { logoutController, meController } from '../dist/controllers/auth.controller.js'

const createMockRes = () => {
  const state = {
    statusCode: 200,
    body: null,
    cookies: [],
    clearedCookies: [],
  }

  const res = {
    status(code) {
      state.statusCode = code
      return res
    },
    json(payload) {
      state.body = payload
      return res
    },
    cookie(name, value, options) {
      state.cookies.push({ name, value, options })
      return res
    },
    clearCookie(name, options) {
      state.clearedCookies.push({ name, options })
      return res
    },
  }

  return { res, state }
}

const createMockReq = ({ method = 'GET', cookie = '', headers = {}, user = undefined } = {}) => {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v])
  )
  return {
    method,
    headers: {
      ...normalizedHeaders,
      ...(cookie ? { cookie } : {}),
    },
    user,
    get(name) {
      return normalizedHeaders[name.toLowerCase()]
    },
  }
}

test('parseCookies, generateCsrfToken y safeEqual funcionan correctamente', () => {
  const parsed = parseCookies('a=1; gedasc_csrf=abc%2B123; empty=')
  assert.equal(parsed.a, '1')
  assert.equal(parsed.gedasc_csrf, 'abc+123')
  assert.equal(parsed.empty, '')

  const token = generateCsrfToken()
  assert.ok(token.length >= 32)
  assert.equal(safeEqual(token, token), true)
  assert.equal(safeEqual(token, `${token}x`), false)
  assert.equal(safeEqual(token, 'x'.repeat(token.length)), false)
})

test('política de cookies y CORS respeta HttpOnly, Secure en producción y sin comodín', () => {
  const prevEnv = process.env.NODE_ENV
  const prevSecure = process.env.COOKIE_SECURE
  const prevSameSite = process.env.COOKIE_SAME_SITE

  try {
    process.env.NODE_ENV = 'production'
    delete process.env.COOKIE_SECURE
    delete process.env.COOKIE_SAME_SITE

    const sessionOpts = getSessionCookieOptions()
    const csrfOpts = getCsrfCookieOptions()

    assert.equal(sessionOpts.httpOnly, true)
    assert.equal(sessionOpts.secure, true)
    assert.equal(sessionOpts.sameSite, 'lax')
    assert.equal(csrfOpts.httpOnly, false)
    assert.equal(csrfOpts.secure, true)

    assert.equal(isOriginAllowed('https://evil.example.com'), false)
  } finally {
    process.env.NODE_ENV = prevEnv
    if (prevSecure === undefined) delete process.env.COOKIE_SECURE
    else process.env.COOKIE_SECURE = prevSecure
    if (prevSameSite === undefined) delete process.env.COOKIE_SAME_SITE
    else process.env.COOKIE_SAME_SITE = prevSameSite
  }
})

test('authMiddleware rechaza sin cookie y acepta JWT HS256 válido en cookie HttpOnly', () => {
  const prevSecret = process.env.JWT_SECRET
  process.env.JWT_SECRET = 'test-secret-gedasc-2026'

  try {
    // Sin cookie -> 401
    {
      const req = createMockReq()
      const { res, state } = createMockRes()
      let nextCalled = false
      authMiddleware(req, res, () => {
        nextCalled = true
      })
      assert.equal(nextCalled, false)
      assert.equal(state.statusCode, 401)
    }

    // Token inválido -> 401
    {
      const req = createMockReq({ cookie: `${SESSION_COOKIE_NAME}=invalid.token.value` })
      const { res, state } = createMockRes()
      let nextCalled = false
      authMiddleware(req, res, () => {
        nextCalled = true
      })
      assert.equal(nextCalled, false)
      assert.equal(state.statusCode, 401)
    }

    // Token HS256 válido -> next() y req.user poblado
    {
      const token = jwt.sign(
        { id: '42', email: 'admin@sena.edu.co', rol: 'ADMIN' },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '1h' }
      )
      const req = createMockReq({ cookie: `${SESSION_COOKIE_NAME}=${token}` })
      const { res } = createMockRes()
      let nextCalled = false
      authMiddleware(req, res, () => {
        nextCalled = true
      })
      assert.equal(nextCalled, true)
      assert.equal(req.user.id, '42')
      assert.equal(req.user.email, 'admin@sena.edu.co')
      assert.equal(req.user.rol, 'ADMIN')
    }
  } finally {
    if (prevSecret === undefined) delete process.env.JWT_SECRET
    else process.env.JWT_SECRET = prevSecret
  }
})

test('csrfProtection permite métodos seguros, bloquea mutaciones sin token o con origen inválido y acepta Double Submit válido', () => {
  // GET sin token -> pasa
  {
    const req = createMockReq({ method: 'GET' })
    const { res } = createMockRes()
    let nextCalled = false
    csrfProtection(req, res, () => {
      nextCalled = true
    })
    assert.equal(nextCalled, true)
  }

  // DELETE sin cabecera CSRF -> 403
  {
    const token = generateCsrfToken()
    const req = createMockReq({
      method: 'DELETE',
      cookie: `${CSRF_COOKIE_NAME}=${token}`,
      headers: { origin: 'http://localhost:5173' },
    })
    const { res, state } = createMockRes()
    let nextCalled = false
    csrfProtection(req, res, () => {
      nextCalled = true
    })
    assert.equal(nextCalled, false)
    assert.equal(state.statusCode, 403)
  }

  // POST con origen no permitido -> 403
  {
    const token = generateCsrfToken()
    const req = createMockReq({
      method: 'POST',
      cookie: `${CSRF_COOKIE_NAME}=${token}`,
      headers: {
        origin: 'https://attacker.example',
        [CSRF_HEADER_NAME]: token,
      },
    })
    const { res, state } = createMockRes()
    let nextCalled = false
    csrfProtection(req, res, () => {
      nextCalled = true
    })
    assert.equal(nextCalled, false)
    assert.equal(state.statusCode, 403)
  }

  // DELETE con cookie + header CSRF coincidentes y origen permitido -> pasa
  {
    const token = generateCsrfToken()
    const req = createMockReq({
      method: 'DELETE',
      cookie: `${CSRF_COOKIE_NAME}=${token}`,
      headers: {
        origin: 'http://localhost:5173',
        [CSRF_HEADER_NAME]: token,
      },
    })
    const { res } = createMockRes()
    let nextCalled = false
    csrfProtection(req, res, () => {
      nextCalled = true
    })
    assert.equal(nextCalled, true)
  }
})

test('meController devuelve usuario + csrfToken y logoutController limpia ambas cookies', () => {
  // /me emite csrfToken si no existía cookie
  {
    const req = createMockReq({
      user: { id: '7', email: 'celador@sena.edu.co', rol: 'CELADOR' },
    })
    const { res, state } = createMockRes()
    meController(req, res)
    assert.equal(state.statusCode, 200)
    assert.equal(state.body.success, true)
    assert.equal(state.body.data.user.id, '7')
    assert.ok(state.body.data.csrfToken)
    assert.equal(state.cookies.length, 1)
    assert.equal(state.cookies[0].name, CSRF_COOKIE_NAME)
  }

  // /logout limpia gedasc_session y gedasc_csrf
  {
    const req = createMockReq({ method: 'POST' })
    const { res, state } = createMockRes()
    logoutController(req, res)
    assert.equal(state.statusCode, 200)
    assert.equal(state.body.success, true)
    assert.deepEqual(
      state.clearedCookies.map((c) => c.name),
      [SESSION_COOKIE_NAME, CSRF_COOKIE_NAME]
    )
    assert.equal(state.clearedCookies[0].options.httpOnly, true)
    assert.equal(state.clearedCookies[1].options.httpOnly, false)
  }
})
