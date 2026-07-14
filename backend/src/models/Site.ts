import mongoose, { type Document, type Model } from 'mongoose';

export interface ISite extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  maxDailyCapacity: number;
}

const siteSchema = new mongoose.Schema<ISite>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    maxDailyCapacity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

export const Site: Model<ISite> = mongoose.model<ISite>('Site', siteSchema);
