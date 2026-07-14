import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { env } from './config/env';
import { initSocket } from './services/socketService';
import { startBookingWorker } from './services/bookingQueue';

async function main() {
  await connectDB();
  await connectRedis();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: { origin: env.FRONTEND_URL, methods: ['GET', 'POST'] },
  });

  initSocket(io);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
  });

  const worker = startBookingWorker();

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });

  process.on('SIGTERM', async () => {
    await worker.close();
    httpServer.close();
    process.exit(0);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
