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
  getStatsAnual
} from '../controllers/admin.controller'

import { authMiddleware } from '../middlewares/admin.middleware'
import { requireRole } from '../middlewares/admin.middleware'


router.use(authMiddleware)
router.use(requireRole(['ADMIN']))

router.get('/aprendices', getAllAprendicesController)

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
export default router
