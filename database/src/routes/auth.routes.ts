import { Router } from 'express'
import { loginController } from '../controllers/auth.controller'
import { validateRequest } from '../middlewares/validate.middleware'
import { loginSchema } from '../schemas/auth.schema'

const router = Router()

router.post('/login', validateRequest({ body: loginSchema }), loginController)

export default router
