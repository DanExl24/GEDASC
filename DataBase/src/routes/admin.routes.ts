import { Router } from 'express'
const router = Router()

import {
  getAllAprendicesController,

  getIngressEgressController,
  deleteIngresoController,
  deleteSalidaController,

  getAllComputersController,
  getAllVehiclesController,

  getBorrowedComputersController,
  getBorrowedVehiclesController,

  getTrackController,

  getAllMachinesByAprendizController,


  getStatsTrimestral,
  getStatsAnual,

  getAdminStatsController,
  toggleMonitorController,
  getFormacionesAprendizController,
  asignarFormacionController,
  desvincularFormacionController
} from '../controllers/admin.controller'

import { authMiddleware } from '../middlewares/admin.middleware'
import { requireRole } from '../middlewares/admin.middleware'


router.use(authMiddleware)
router.use(requireRole(['ADMIN']))

router.get('/aprendices', getAllAprendicesController)
router.post('/aprendices/toggleMonitor/:id_aprendiz', toggleMonitorController)
router.get('/aprendices/:id_aprendiz/formaciones', getFormacionesAprendizController)
router.post('/aprendices/:id_aprendiz/formaciones', asignarFormacionController)
router.delete('/aprendices/:id_aprendiz/formaciones/:id_formacion', desvincularFormacionController)

router.get('/ingresos', getIngressEgressController)
router.delete('/ingresos/:id', deleteIngresoController)
router.delete('/salidas/:id', deleteSalidaController)

router.get('/computers', getAllComputersController)


router.get('/vehicles', getAllVehiclesController)


router.get('/borrowed/computers', getBorrowedComputersController)
router.get('/borrowed/vehicles', getBorrowedVehiclesController)


router.get('/track', getTrackController)

router.get('/allMachines/:id', getAllMachinesByAprendizController)

router.get('/statsQuarter', getStatsTrimestral)
router.get('/statsYear', getStatsAnual)

router.get('/statsExits',getAdminStatsController)
export default router
