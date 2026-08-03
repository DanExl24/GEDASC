import { Router } from 'express'
import {
  ActivarValidador,
  DesactivarValidador,
  ObtenerEstadoValidador
} from '../controllers/validator.controller'
import { authMiddleware } from '../middlewares/admin.middleware'

const router = Router()

router.post('/activar', authMiddleware, ActivarValidador)
router.post('/desactivar', authMiddleware, DesactivarValidador)
router.get('/estado', authMiddleware, ObtenerEstadoValidador)

export default router
