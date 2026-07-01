import { Router } from 'express'
const router = Router()

import { addExit,ExitRecord,DetectExit,SearchAprendiz,retirarEquipo} from '../controllers/exit.controller'


// crear una ruta para ver las salidas de hoy

router.post('/addExit/:documento',addExit)
router.get('/historial',ExitRecord)
router.get('/verificarSalida/:documento',DetectExit)
router.post('/firmaSalida/:documento',DetectExit)
router.get('/buscar', SearchAprendiz)
router.post('/retirarEquipo/:id_detallemaquina', retirarEquipo)
export default router
