import { Router } from 'express'
import { TodayActivity,StatsRecord } from '../controllers/stats.controller'
const router = Router()

router.get('/historial',StatsRecord)
router.get('/actividadHoy',TodayActivity)
export default router
