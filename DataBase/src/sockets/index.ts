import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const MOBILE_DEVICE_KEY = process.env.MOBILE_DEVICE_KEY || "GEDASC_PORTERIA_KEY_2026";

export default function initSockets(io: Server) {
  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    // =========================
    // REGISTRO DE DISPOSITIVO
    // =========================
    socket.on("registrar", ({ tipo, token, deviceKey }) => {
      socket.data.tipo = tipo;

      if (tipo === "movil") {
        let isTokenValid = false;
        let isKeyValid = false;

        // 1. Validar Token JWT del Celador/Admin
        if (token) {
          try {
            const secret = process.env.JWT_SECRET;
            if (secret) {
              const decoded = jwt.verify(token, secret) as any;
              if (decoded && (decoded.rol === "CELADOR" || decoded.rol === "ADMIN" || decoded.rol === "SUPERADMIN")) {
                isTokenValid = true;
              }
            }
          } catch (e) {
            console.warn("Token inválido en registro de socket móvil:", e);
          }
        }

        // 2. Validar Clave de Dispositivo
        const cleanDeviceKey = deviceKey ? String(deviceKey).trim() : "";
        if (cleanDeviceKey === MOBILE_DEVICE_KEY) {
          isKeyValid = true;
        }

        if (isTokenValid && isKeyValid) {
          socket.data.authorized = true;
          console.log(`✅ Socket móvil AUTORIZADO (${socket.id})`);
          socket.emit("autorizacionMovil", { status: "ok", message: "Dispositivo autorizado para firma digital." });
        } else {
          socket.data.authorized = false;
          console.warn(`❌ Socket móvil DENEGADO (${socket.id}). TokenValido: ${isTokenValid}, ClaveValida: ${isKeyValid}`);
          socket.emit("autorizacionMovil", {
            status: "denied",
            message: "Dispositivo o sesión no autorizada para captura de firma."
          });
        }
      } else {
        console.log(`Socket registrado como ${tipo}:`, socket.id);
      }
    });

    // =========================
    // PC -> pedir firma al móvil
    // =========================
    socket.on("abrirFirmaEnMovil", ({ documento }) => {
      console.log("PC solicitó firma para:", documento);

      for (const [, s] of io.of("/").sockets) {
        if (s.data.tipo === "movil" && s.data.authorized === true) {
          s.emit("abrirFirma", { documento });
        }
      }
    });

    // =========================
    // MÓVIL -> envía firma
    // =========================
    socket.on("firmaRegistrada", ({ documento, firma }) => {
      if (socket.data.tipo === "movil" && socket.data.authorized !== true) {
        console.warn("⚠️ Intento de envío de firma desde móvil NO AUTORIZADO");
        return;
      }

      console.log("Firma recibida del móvil autorizado:", documento);

      for (const [, s] of io.of("/").sockets) {
        if (s.data.tipo === "pc") {
          s.emit("firmaRegistrada", { documento, firma });
        }
      }
    });

    // =========================
    // PC -> cerrar modal móvil
    // =========================
    socket.on("cerrarFirmaEnMovil", ({ documento }) => {
      console.log("Cerrar firma:", documento);

      for (const [, s] of io.of("/").sockets) {
        if (s.data.tipo === "movil" && s.data.authorized === true) {
          s.emit("cerrarFirma", { documento });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado");
    });
  });
}
