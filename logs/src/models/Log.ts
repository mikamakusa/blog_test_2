import mongoose from 'mongoose';

export interface ILog extends mongoose.Document {
  level: 'info' | 'warn' | 'error';
  message: string;
  service: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warn', 'error'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient querying
logSchema.index({ timestamp: -1 });
logSchema.index({ service: 1, level: 1 });

export const Log = mongoose.model<ILog>('Log', logSchema); 