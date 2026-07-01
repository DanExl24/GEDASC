import { Router } from 'express'
const router = Router()

import { realTimeNow, getJornadaPredominante } from '../controllers/jornada.controller'

router.get('/timeNow', realTimeNow)
router.get('/predominante/:id_aprendiz', getJornadaPredominante)

export default router
