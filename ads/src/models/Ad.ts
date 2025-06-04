import mongoose from 'mongoose';

export interface IAd extends mongoose.Document {
  title: string;
  media: string;
  link: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  media: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Ad = mongoose.model<IAd>('Ad', adSchema); 