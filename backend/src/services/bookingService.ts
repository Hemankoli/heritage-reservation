import mongoose from 'mongoose';
import { TimeSlot } from '../models/TimeSlot';
import { Reservation } from '../models/Reservation';
import { emitCapacityUpdate } from './socketService';
import { deleteCache } from '../config/redis';
import { slotCacheKey } from '../controllers/slotController';

export interface BookingParams {
  userId: string;
  slotId: string;
  siteId: string;
  quantity: number;
}

export interface BookingResult {
  reservationId: string;
  available_tickets: number;
}

export async function processBooking(params: BookingParams): Promise<BookingResult> {
  const { userId, slotId, siteId, quantity } = params;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const updatedSlot = await TimeSlot.findOneAndUpdate(
      { _id: slotId, available_tickets: { $gte: quantity } },
      { $inc: { available_tickets: -quantity } },
      { new: true, session }
    );

    if (!updatedSlot) {
      await session.abortTransaction();
      throw new Error('INSUFFICIENT_CAPACITY');
    }

    const reservation = await Reservation.create(
      [{ user: userId, timeSlot: slotId, site: siteId, quantity, status: 'confirmed' }],
      { session }
    );

    await session.commitTransaction();

    emitCapacityUpdate(slotId, updatedSlot.available_tickets, siteId);
    await deleteCache(
      slotCacheKey(siteId),
      slotCacheKey(siteId, updatedSlot.date.toISOString().slice(0, 10))
    );

    return {
      reservationId: (reservation[0]!._id as mongoose.Types.ObjectId).toString(),
      available_tickets: updatedSlot.available_tickets,
    };
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    await session.endSession();
  }
}
