import { Router } from 'express'
// importar funcion
import { AddEntry, SearchMachine } from '../controllers/entry.controller'
import { EntryRecord } from '../controllers/entry.controller'
import { DetectEntry } from '../controllers/entry.controller'
import { EntryManual } from '../controllers/entry.controller'
import { SearchAprendiz } from '../controllers/entry.controller'
import { AddMachine } from '../controllers/entry.controller'
import { UpdateMachine } from '../controllers/entry.controller'
const router = Router()

// crear una ruta para ver ingresos de hoy
router.post('/addEntry/:documento', AddEntry)
router.get('/historial', EntryRecord)
router.get('/verificarEntrada/:documento',DetectEntry)
router.get('/ingresoManual/:documento',EntryManual)
router.get('/buscar', SearchAprendiz)
router.post('/ingresoMaquina/:id',AddMachine)
router.post('/ingresoDobleMaquina/:id_aprendiz',UpdateMachine)
router.get('/detalleMaquinas/:id_aprendiz',SearchMachine)
router.get('/firmaIngreso/:id_aprendiz',SearchMachine)

export default router
