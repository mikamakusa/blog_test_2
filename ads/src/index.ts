import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Client } from 'minio';
import { Ad } from './models/Ad';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// MinIO client configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-ads')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.post('/ads', async (req, res) => {
  try {
    const { title, media, link } = req.body;
    const ad = new Ad({ title, media, link });
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

app.get('/ads', async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/ads/active', async (req, res) => {
  try {
    const ads = await Ad.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.put('/ads/:id', async (req, res) => {
  try {
    const { title, media, link, isActive } = req.body;
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      { title, media, link, isActive },
      { new: true }
    );
    
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.json(ad);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.delete('/ads/:id', async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Ads service listening on port ${PORT}`);
}); 