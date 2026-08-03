import { Router } from 'express'
const router = Router()
import { getHistorialComputadores } from '../controllers/computer.controller'
import { getPropietario } from '../controllers/computer.controller'

router.get('/historial',getHistorialComputadores)
router.get('/propietario/:id_detallemaquina',getPropietario)
export default router
