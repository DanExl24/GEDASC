import express from 'express'
import http from "http";
import { Server } from "socket.io";
import cors from 'cors'
import { initIO } from "./sockets/io";

// rutas
import testRoutes from './routes/test.routes'
import QueryId from './routes/QueryId.routes'
import EntryRecord from './routes/entry.routes'
import ExitRecord from './routes/exit.routes'
import HistoryRecord from './routes/history.routes'
import ComputerRecord from './routes/computer.routes'
import VehicleRecord from './routes/vehicle.routes'

// sockets
import initSockets from "./sockets/index"

const app = express()
const server = http.createServer(app)

// ✅ SOLO UNA instancia
const io = new Server(server, {
  cors: { origin: "*" }
})

// servidor Node + Socket.IO
io.on("connection", (socket) => {
  console.log("Nuevo socket conectado:", socket.id);

  socket.on("registrarMovil", ({ dispositivo }) => {
    socket.data.dispositivo = dispositivo; // marcar como móvil
    console.log("Socket registrado como móvil:", socket.id);
  });

  socket.on("abrirFirmaEnMovil", ({ documento }) => {
    console.log("Evento abrirFirmaEnMovil recibido para:", documento);
    for (const [, s] of io.of("/").sockets) {
      if (s.data.dispositivo === "movil") {
        console.log("Enviando abrirFirma a socket móvil:", s.id);
        s.emit("abrirFirma", { documento });
      }
    }
  });
  // Escuchar cuando el móvil envíe la firma
  socket.on("firmaRegistrada", ({ documento, firma }) => {
    console.log("Servidor recibió firma de móvil:", documento, firma);

    // Enviar solo a la PC (los sockets que NO sean móviles)
    for (const [, s] of io.of("/").sockets) {
      if (s.data.dispositivo !== "movil") {
        console.log("Enviando firma a PC socket:", s.id);
        s.emit("firmaRegistrada", { documento, firma });
      }
    }
  });
});

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

// 🚀 servidor
const PORT = 3000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor + sockets en http://localhost:${PORT}`)
})
