import type { Server } from 'socket.io';

let _io: Server | null = null;

export function initSocket(io: Server): void {
  _io = io;
}

export function emitCapacityUpdate(slotId: string, available_tickets: number, siteId: string): void {
  if (_io) {
    _io.emit('capacity_update', { slotId, available_tickets, siteId });
  }
}
