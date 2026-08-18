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
  desvincularFormacionController,
  getProgramasController,
  createProgramaController,
  updateProgramaController,
  getHorariosController,
  createHorarioController,
  getAllFormacionesController,
  createFormacionController,
  updateFormacionController,
  deleteFormacionController,
  getFormacionAprendicesController,
  setSimulationTimeController,
  getSimulationTimeController,
  getCeladoresController,
  createCeladorController,
  updateCeladorController,
  toggleCeladorStatusController
} from '../controllers/admin.controller'

router.post('/simularHora', setSimulationTimeController)
router.get('/simularHora', getSimulationTimeController)

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

// Academic program, schedule & formation management routes
router.get('/programas', getProgramasController)
router.post('/programas', createProgramaController)
router.put('/programas/:id_programa', updateProgramaController)

router.get('/horarios', getHorariosController)
router.post('/horarios', createHorarioController)

router.get('/formaciones', getAllFormacionesController)
router.post('/formaciones', createFormacionController)
router.put('/formaciones/:id_formacion', updateFormacionController)
router.delete('/formaciones/:id_formacion', deleteFormacionController)
router.get('/formaciones/:id_formacion/aprendices', getFormacionAprendicesController)

// Rutas exclusivas para Gestión de Celadores
router.get('/celadores', getCeladoresController)
router.post('/celadores', createCeladorController)
router.put('/celadores/:id_usuario', updateCeladorController)
router.patch('/celadores/:id_usuario/toggle', toggleCeladorStatusController)

export default router
