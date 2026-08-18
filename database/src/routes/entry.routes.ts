import { Router } from 'express'
import {
  AddEntry,
  SearchMachine,
  SearchPrincipalMachine,
  EntryRecord,
  DetectEntry,
  EntryManual,
  SearchAprendiz,
  AddMachine,
  UpdateMachine
} from '../controllers/entry.controller'
import { validateRequest } from '../middlewares/validate.middleware'
import { documentoParamSchema, createEntrySchema } from '../schemas/entry.schema'

const router = Router()

router.post('/addEntry/:documento', validateRequest({ params: documentoParamSchema, body: createEntrySchema }), AddEntry)
router.get('/historial', EntryRecord)
router.get('/verificarEntrada/:documento', validateRequest({ params: documentoParamSchema }), DetectEntry)
router.get('/ingresoManual/:documento', validateRequest({ params: documentoParamSchema }), EntryManual)
router.get('/buscar', SearchAprendiz)
router.post('/ingresoMaquina/:id', AddMachine)
router.post('/ingresoDobleMaquina/:id_aprendiz', UpdateMachine)
router.get('/detalleMaquinas/:id_aprendiz', SearchMachine)
router.get('/firmaIngreso/:id_aprendiz', SearchMachine)
router.get('/maquinaPrincipal/:id_aprendiz', SearchPrincipalMachine)

export default router
