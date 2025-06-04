import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { Log } from './models/Log';

dotenv.config();

const app = express();
const port = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-engine-logs')
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error: Error) => {
    logger.error('MongoDB connection error:', error);
  });

// Routes
app.post('/logs', async (req: Request, res: Response) => {
  try {
    const { level, message, service, metadata } = req.body;
    const log = new Log({
      level,
      message,
      service,
      metadata
    });
    await log.save();
    logger.log(level, message, { service, ...metadata });
    res.status(201).json(log);
  } catch (error: unknown) {
    logger.error('Error creating log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/logs', async (req: Request, res: Response) => {
  try {
    const { service, level, startDate, endDate, limit = 100 } = req.query;
    const query: any = {};

    if (service) query.service = service;
    if (level) query.level = level;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.json(logs);
  } catch (error: unknown) {
    logger.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  logger.info(`Logs service listening on port ${port}`);
}); 