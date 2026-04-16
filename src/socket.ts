// src/services/socket.ts
import { io, Socket } from 'socket.io-client';

import { SOCKET_URL } from '@/config/network';

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL);
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error('Socket no inicializado');
  return socket;
};
