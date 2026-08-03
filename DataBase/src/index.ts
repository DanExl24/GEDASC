import express from 'express'
import http from "http";
import { Server } from "socket.io";
import cors from 'cors'
import { initIO } from "./sockets/io";
import dotenv from 'dotenv'
dotenv.config()
// rutas
import testRoutes from './routes/test.routes'
import QueryId from './routes/QueryId.routes'
import EntryRecord from './routes/entry.routes'
import ExitRecord from './routes/exit.routes'
import HistoryRecord from './routes/history.routes'
import ComputerRecord from './routes/computer.routes'
import VehicleRecord from './routes/vehicle.routes'
import  StatsRecord  from './routes/stats.routes';
import adminFunction from './routes/admin.routes'
import auth from './routes/auth.routes'
import jornada from './routes/jornada.routes'
import validatorRoutes from './routes/validator.routes'
// sockets
import initSockets from "./sockets/index"

// Swagger
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'

const app = express()
const server = http.createServer(app)

// ✅ Configuración de orígenes permitidos (CORS)
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['*']

// ✅ Inicialización de Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// 🔥 inicializar IO global
initIO(io)

// 🔥 inicializar eventos
initSockets(io)

// middlewares
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (Mobile apps, Curl, Postman) o si '*' está permitido
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`[CORS Bloqueado]: ${origin}`)
      callback(null, true) // O cambiar a callback(new Error('Bloqueado por CORS')) para bloqueo estricto
    }
  },
  credentials: true
}))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// rutas
app.get('/', (req, res) => {
  res.send('Servidor activo')
})

app.use('/api', testRoutes)
app.use('/api/aprendiz', QueryId)
app.use('/api/registroIngresos', EntryRecord)
app.use('/api/registroSalidas', ExitRecord)
app.use('/api/historico', HistoryRecord)
app.use('/api/HistorialComputadores', ComputerRecord)
app.use('/api/HistorialVehiculos', VehicleRecord)
app.use('/api/estadisticas', StatsRecord)
app.use('/api/admin',adminFunction)
app.use('/api/auth',auth)
app.use('/api/jornadaTime',jornada)
app.use('/api/validador', validatorRoutes)

// error handler (debe ir después de las rutas)
import { errorMiddleware } from './middlewares/error.middleware'
app.use(errorMiddleware)

import { initDbSchema } from './config/dbInit'

// 🚀 servidor
const PORT = process.env.PORT || 3000
server.listen(PORT, async () => {
  await initDbSchema()
  console.log(`Servidor + sockets en http://localhost:${PORT}`)
})
