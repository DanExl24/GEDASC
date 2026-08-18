import { Router } from 'express'
const router = Router()

import {
  getAllAprendicesController,
  createAprendizController,
  bulkCreateAprendicesController,
  updateAprendizController,
  deleteAprendizController,
  toggleAprendizStatusController,
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
  deleteProgramaController,
  getHorariosController,
  createHorarioController,
  updateHorarioController,
  deleteHorarioController,
  getAllFormacionesController,
  createFormacionController,
  updateFormacionController,
  deleteFormacionController,
  getFormacionAprendicesController,
  desvincularTodosFormacionController,
  importarAprendicesMasivoController,
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
  updateCeladorSchema,
  createAprendizSchema,
  updateAprendizSchema,
  bulkCreateAprendicesSchema
} from '../schemas/admin.schema'

router.post('/simularHora', validateRequest({ body: simularHoraSchema }), setSimulationTimeController)
router.get('/simularHora', getSimulationTimeController)

router.use(authMiddleware)
router.use(requireRole(['ADMIN']))

router.get('/aprendices', getAllAprendicesController)
router.post('/aprendices', validateRequest({ body: createAprendizSchema }), createAprendizController)
router.post('/aprendices/masivo', validateRequest({ body: bulkCreateAprendicesSchema }), bulkCreateAprendicesController)
router.put('/aprendices/:id_aprendiz', validateRequest({ body: updateAprendizSchema }), updateAprendizController)
router.patch('/aprendices/:id_aprendiz/toggle-status', toggleAprendizStatusController)
router.delete('/aprendices/:id_aprendiz', deleteAprendizController)
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
router.delete('/programas/:id_programa', deleteProgramaController)

router.get('/horarios', getHorariosController)
router.post('/horarios', validateRequest({ body: createHorarioSchema }), createHorarioController)
router.put('/horarios/:id_horario', updateHorarioController)
router.delete('/horarios/:id_horario', deleteHorarioController)

router.get('/formaciones', getAllFormacionesController)
router.post('/formaciones', validateRequest({ body: createFormacionSchema }), createFormacionController)
router.put('/formaciones/:id_formacion', updateFormacionController)
router.delete('/formaciones/:id_formacion', deleteFormacionController)
router.get('/formaciones/:id_formacion/aprendices', getFormacionAprendicesController)
router.post('/formaciones/:id_formacion/aprendices/masivo', importarAprendicesMasivoController)
router.delete('/formaciones/:id_formacion/aprendices/todos', desvincularTodosFormacionController)

// Rutas exclusivas para Gestión de Celadores
router.get('/celadores', getCeladoresController)
router.post('/celadores', validateRequest({ body: createCeladorSchema }), createCeladorController)
router.put('/celadores/:id_usuario', validateRequest({ body: updateCeladorSchema }), updateCeladorController)
router.patch('/celadores/:id_usuario/toggle', toggleCeladorStatusController)

export default router
