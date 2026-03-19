import { Router } from 'express'
const router = Router()
import { HistoryRecord,DateRecord,SearchMachine } from '../controllers/history.controller'
// crear una ruta para ver ingresos de hoy
router.get('/historial', HistoryRecord)
router.get('/historialFechas', DateRecord)
router.get('/historialMaquinas/:id_detallemaquina', SearchMachine)
export default router
