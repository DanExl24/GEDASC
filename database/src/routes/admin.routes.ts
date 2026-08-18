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
  desvincularTodosFormacionController,
  setSimulationTimeController,
  getSimulationTimeController,
  getCeladoresController,
  createCeladorController,
  updateCeladorController,
  toggleCeladorStatusController
} from '../controllers/admin.controller'

import { authMiddleware } from '../middlewares/admin.middleware'
import { requireRole } from '../middlewares/admin.middleware'
import { validateRequest } from '../middlewares/validate.middleware'
import {
  simularHoraSchema,
  createProgramaSchema,
  createHorarioSchema,
  createFormacionSchema,
  createCeladorSchema,
  updateCeladorSchema
} from '../schemas/admin.schema'

router.post('/simularHora', validateRequest({ body: simularHoraSchema }), setSimulationTimeController)
router.get('/simularHora', getSimulationTimeController)

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
router.get('/statsExits', getAdminStatsController)

// Academic program, schedule & formation management routes
router.get('/programas', getProgramasController)
router.post('/programas', validateRequest({ body: createProgramaSchema }), createProgramaController)
router.put('/programas/:id_programa', updateProgramaController)

router.get('/horarios', getHorariosController)
router.post('/horarios', validateRequest({ body: createHorarioSchema }), createHorarioController)

router.get('/formaciones', getAllFormacionesController)
router.post('/formaciones', validateRequest({ body: createFormacionSchema }), createFormacionController)
router.put('/formaciones/:id_formacion', updateFormacionController)
router.delete('/formaciones/:id_formacion', deleteFormacionController)
router.get('/formaciones/:id_formacion/aprendices', getFormacionAprendicesController)
router.delete('/formaciones/:id_formacion/aprendices/todos', desvincularTodosFormacionController)

// Rutas exclusivas para Gestión de Celadores
router.get('/celadores', getCeladoresController)
router.post('/celadores', validateRequest({ body: createCeladorSchema }), createCeladorController)
router.put('/celadores/:id_usuario', validateRequest({ body: updateCeladorSchema }), updateCeladorController)
router.patch('/celadores/:id_usuario/toggle', toggleCeladorStatusController)

export default router
