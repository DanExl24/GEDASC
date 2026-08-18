import { Router } from 'express'
import {
  addExit,
  ExitRecord,
  DetectExit,
  SearchAprendiz,
  retirarEquipo
} from '../controllers/exit.controller'
import { validateRequest } from '../middlewares/validate.middleware'
import { exitParamSchema, createExitSchema } from '../schemas/exit.schema'

const router = Router()

router.post('/addExit/:documento', validateRequest({ params: exitParamSchema, body: createExitSchema }), addExit)
router.get('/historial', ExitRecord)
router.get('/verificarSalida/:documento', validateRequest({ params: exitParamSchema }), DetectExit)
router.post('/firmaSalida/:documento', validateRequest({ params: exitParamSchema }), DetectExit)
router.get('/buscar', SearchAprendiz)
router.post('/retirarEquipo/:id_detallemaquina', retirarEquipo)

export default router
