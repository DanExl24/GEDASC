import { Router } from 'express'
const router = Router()
import { HistoryRecord, DateRecord, SearchMachine, DataMachine, DataRegister, GetOptionsFormaciones } from '../controllers/history.controller'
// crear una ruta para ver ingresos de hoy
router.get('/historial', HistoryRecord)
router.post('/historialMaquinas', DataMachine)
router.post('/historialGeneral', DataRegister)
router.get('/historialFechas', DateRecord)
router.get('/historialMaquinas/:id_detallemaquina', SearchMachine)
router.get('/opcionesFiltros', GetOptionsFormaciones)
export default router
