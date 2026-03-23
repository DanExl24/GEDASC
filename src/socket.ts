// src/services/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket;

export const connectSocket = () => {
  socket = io("http://192.168.1.7:3000");
  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error("Socket no inicializado");
  return socket;
};
