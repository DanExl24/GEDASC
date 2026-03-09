import { Router } from 'express'
// importar funcion
import { AddEntry } from '../controllers/entry.controller'
import { EntryRecord } from '../controllers/entry.controller'
import { DetectEntry } from '../controllers/entry.controller'
import { EntryManual } from '../controllers/entry.controller'
import { SearchAprendiz } from '../controllers/entry.controller'
const router = Router()

// crear una ruta para ver ingresos de hoy
router.post('/addEntry/:documento', AddEntry)
router.get('/historial', EntryRecord)
router.get('/verificarEntrada/:documento',DetectEntry)
router.get('/ingresoManual/:documento',EntryManual)
router.get('/buscar', SearchAprendiz)
export default router
