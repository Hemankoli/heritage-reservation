import mongoose, { type Document, type Model } from 'mongoose';

export interface IReservation extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  timeSlot: mongoose.Types.ObjectId;
  site: mongoose.Types.ObjectId;
  quantity: number;
  status: 'confirmed' | 'cancelled';
}

const reservationSchema = new mongoose.Schema<IReservation>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    timeSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'TimeSlot', required: true },
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
    quantity: { type: Number, required: true, min: 1, max: 10 },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

export const Reservation: Model<IReservation> = mongoose.model<IReservation>('Reservation', reservationSchema);
