import { io, type Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_BACKEND_URL ?? '';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, { transports: ['websocket', 'polling'] });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
