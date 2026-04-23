import { Router } from 'express'
const router = Router()

import {realTimeNow} from '../controllers/jornada.controller'

router.get('/timeNow', realTimeNow)

export default router
