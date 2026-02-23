import { Router } from 'express'
// importar funcion
import { testDB } from '../controllers/test.controller'

const router = Router()

// crear una ruta para ver la respuesta de la Query
router.get('/db-test', testDB)

export default router
