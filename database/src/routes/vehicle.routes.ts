import { Router } from 'express'
const router = Router()
import { getHistorialVehiculos } from '../controllers/vehicle.controller'
import { getPropietario } from '../controllers/vehicle.controller'

router.get('/historial',getHistorialVehiculos)
router.get('/propietario/:id_detallemaquina',getPropietario)
export default router
