import mongoose, { type Document, type Model } from 'mongoose';

export interface ITimeSlot extends Document {
  _id: mongoose.Types.ObjectId;
  site: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  available_tickets: number;
  __v: number;
}

const timeSlotSchema = new mongoose.Schema<ITimeSlot>(
  {
    site: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalCapacity: { type: Number, required: true, min: 1 },
    available_tickets: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, optimisticConcurrency: true }
);

timeSlotSchema.index({ site: 1, date: 1, startTime: 1 }, { unique: true });

export const TimeSlot: Model<ITimeSlot> = mongoose.model<ITimeSlot>('TimeSlot', timeSlotSchema);
