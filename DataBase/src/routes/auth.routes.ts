import { Router } from 'express'
import {
  loginController,
  logoutController,
  meController,
} from '../controllers/auth.controller'
import { authMiddleware } from '../middlewares/admin.middleware'
import { csrfProtection } from '../middlewares/csrf.middleware'

const router = Router()

router.post('/login', loginController)
router.get('/me', authMiddleware, meController)
router.post('/logout', csrfProtection, logoutController)

export default router
