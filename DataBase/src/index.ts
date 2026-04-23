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
// sockets
import initSockets from "./sockets/index"

const app = express()
const server = http.createServer(app)

// ✅ SOLO UNA instancia
const io = new Server(server, {
  cors: { origin: "*" }
})

io.on("connection", (socket) => {
  console.log("Socket conectado:", socket.id)

  // =========================
  // REGISTRO DE DISPOSITIVO
  // =========================
  socket.on("registrar", ({ tipo }) => {
    socket.data.tipo = tipo
    console.log(`Socket registrado como ${tipo}:`, socket.id)
  })

  // =========================
  // PC -> pedir firma al móvil
  // =========================
  socket.on("abrirFirmaEnMovil", ({ documento }) => {
    console.log("PC solicitó firma para:", documento)

    for (const [, s] of io.of("/").sockets) {
      if (s.data.tipo === "movil") {
        s.emit("abrirFirma", { documento })
      }
    }
  })

  // =========================
  // MÓVIL -> envía firma
  // =========================
  socket.on("firmaRegistrada", ({ documento, firma }) => {
    console.log("Firma recibida del móvil:", documento)

    for (const [, s] of io.of("/").sockets) {
      if (s.data.tipo === "pc") {
        s.emit("firmaRegistrada", { documento, firma })
      }
    }
  })

  // =========================
  // PC -> cerrar modal móvil
  // =========================
  socket.on("cerrarFirmaEnMovil", ({ documento }) => {
    console.log("Cerrar firma:", documento)

    for (const [, s] of io.of("/").sockets) {
      if (s.data.tipo === "movil") {
        s.emit("cerrarFirma", { documento })
      }
    }
  })
})

// 🔥 inicializar IO global
initIO(io)

// 🔥 inicializar eventos
initSockets(io)

// middlewares
app.use(express.json())
app.use(cors())

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

// 🚀 servidor
const PORT = 3000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor + sockets en http://localhost:${PORT}`)
})
