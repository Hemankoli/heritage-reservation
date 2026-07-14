import type { Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { QueueEvents } from 'bullmq';
import { bookingQueue } from '../services/bookingQueue';
import { processBooking } from '../services/bookingService';
import { Reservation } from '../models/Reservation';
import { TimeSlot } from '../models/TimeSlot';
import { emitCapacityUpdate } from '../services/socketService';
import { env } from '../config/env';
import { redisClient } from '../config/redis';

let queueEvents: QueueEvents | null = null;

function getQueueEvents(): QueueEvents {
  if (!queueEvents) {
    queueEvents = new QueueEvents('bookings', { connection: { url: env.REDIS_URL } });
  }
  return queueEvents;
}

const createSchema = z.object({
  slotId: z.string().min(1),
  siteId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export async function createReservation(req: Request, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { slotId, siteId, quantity } = parsed.data;
  const params = { userId: req.user.sub, slotId, siteId, quantity };

  try {
    let result;

    if (bookingQueue && redisClient.isReady) {
      // Redis available — use queue for concurrency control
      const job = await bookingQueue.add('book', params);
      result = await job.waitUntilFinished(getQueueEvents(), 15_000);
    } else {
      // Redis unavailable — process directly with MongoDB transaction
      result = await processBooking(params);
    }

    res.status(201).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('INSUFFICIENT_CAPACITY')) {
      res.status(409).json({ error: 'Not enough tickets available for this time slot' });
    } else {
      res.status(500).json({ error: 'Booking failed. Please try again.' });
    }
  }
}

export async function cancelReservation(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const reservation = await Reservation.findById(req.params['id']);
  if (!reservation) { res.status(404).json({ error: 'Reservation not found' }); return; }

  if (reservation.user.toString() !== req.user.sub) {
    res.status(403).json({ error: 'You do not own this reservation' });
    return;
  }

  if (reservation.status === 'cancelled') {
    res.status(400).json({ error: 'Reservation already cancelled' });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    reservation.status = 'cancelled';
    await reservation.save({ session });

    const updatedSlot = await TimeSlot.findByIdAndUpdate(
      reservation.timeSlot,
      { $inc: { available_tickets: reservation.quantity } },
      { new: true, session }
    );

    await session.commitTransaction();

    if (updatedSlot) {
      emitCapacityUpdate(
        reservation.timeSlot.toString(),
        updatedSlot.available_tickets,
        reservation.site.toString()
      );
    }

    res.json({ message: 'Reservation cancelled', reservation });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}

export async function getUserReservations(req: Request, res: Response): Promise<void> {
  if (!req.user) { res.status(401).json({ error: 'Unauthorized' }); return; }
  const reservations = await Reservation.find({ user: req.user.sub, status: 'confirmed' })
    .populate('timeSlot')
    .populate('site', 'name location')
    .sort({ createdAt: -1 });
  res.json(reservations);
}
