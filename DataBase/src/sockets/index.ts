import { Server } from "socket.io";

export default function initSockets(io: Server) {
  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

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

    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado");
    });
  });
}
