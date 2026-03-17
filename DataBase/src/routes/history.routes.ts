import { Router } from 'express'
const router = Router()
import { HistoryRecord,DateRecord } from '../controllers/history.controller'
// crear una ruta para ver ingresos de hoy
router.get('/historial', HistoryRecord)
router.get('/historialFechas', DateRecord)
export default router
