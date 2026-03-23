import { Server } from "socket.io";

export default function initSockets(io: Server) {
  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado");
    });
  });
}
