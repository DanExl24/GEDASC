import { Router } from 'express'
// importar funcion
import { getId } from '../controllers/QueryId.controller'

const router = Router()

// crear una ruta para ver la respuesta de la Query
router.get('/:documento', getId)

export default router
