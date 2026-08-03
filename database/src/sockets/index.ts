import { Server } from "socket.io";
import { pool } from "../config/db";

const MOBILE_DEVICE_KEY = process.env.MOBILE_DEVICE_KEY || "GEDASC_PORTERIA_KEY_2026";

export default function initSockets(io: Server) {
  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado:", socket.id);

    // =========================
    // REGISTRO DE DISPOSITIVO
    // =========================
    socket.on("registrar", async ({ tipo, token: _token, deviceId, device_id, deviceKey }) => {
      socket.data.tipo = tipo;
      const targetDeviceId = deviceId || device_id || null;

      if (tipo === "movil") {
        let isAuthorized = false;

        if (targetDeviceId) {
          try {
            const check = await pool.query(
              `SELECT 1 FROM validadores_firma WHERE device_id = $1 AND activo = TRUE`,
              [targetDeviceId]
            );
            if (check.rowCount && check.rowCount > 0) {
              isAuthorized = true;
            }
          } catch (err) {
            console.error("Error al verificar validador en BD:", err);
          }
        }

        // Respaldo de clave secreta en caso de migración
        if (!isAuthorized && deviceKey && String(deviceKey).trim() === MOBILE_DEVICE_KEY) {
          isAuthorized = true;
        }

        if (isAuthorized) {
          socket.data.authorized = true;
          socket.data.deviceId = targetDeviceId;
          console.log(`✅ Socket móvil AUTORIZADO (${socket.id}) - Device: ${targetDeviceId}`);
          socket.emit("autorizacionMovil", { status: "ok", message: "Dispositivo autorizado para firma digital." });
        } else {
          socket.data.authorized = false;
          console.warn(`❌ Socket móvil DENEGADO (${socket.id}) - Device: ${targetDeviceId}`);
          socket.emit("autorizacionMovil", {
            status: "denied",
            message: "Este dispositivo no está registrado como validador de firmas activo."
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
