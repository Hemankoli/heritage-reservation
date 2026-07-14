import { Queue, Worker, type Job } from 'bullmq';
import { env } from '../config/env';
import { processBooking } from './bookingService';

export interface BookingJobData {
  userId: string;
  slotId: string;
  siteId: string;
  quantity: number;
}

export interface BookingJobResult {
  reservationId: string;
  available_tickets: number;
}

const redisEnabled = Boolean(env.REDIS_URL);
const connection = { url: env.REDIS_URL ?? 'redis://localhost:6379' };

export const bookingQueue = redisEnabled
  ? new Queue<BookingJobData, BookingJobResult>('bookings', {
      connection,
      defaultJobOptions: { attempts: 1, removeOnComplete: 100, removeOnFail: 100 },
    })
  : null;

export function startBookingWorker(): Worker<BookingJobData, BookingJobResult> | null {
  if (!redisEnabled) return null;

  const worker = new Worker<BookingJobData, BookingJobResult>(
    'bookings',
    async (job: Job<BookingJobData, BookingJobResult>) => processBooking(job.data),
    { connection, concurrency: 1 }
  );

  worker.on('failed', (job, err) => {
    console.error(`Booking job ${job?.id} failed:`, err.message);
  });

  return worker;
}
