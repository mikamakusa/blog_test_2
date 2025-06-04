import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://localhost:3002';
const WRITE_SERVICE_URL = process.env.WRITE_SERVICE_URL || 'http://localhost:3003';
const ADS_SERVICE_URL = process.env.ADS_SERVICE_URL || 'http://localhost:3004';
const LOGS_SERVICE_URL = process.env.LOGS_SERVICE_URL || 'http://localhost:3006';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-admin')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Authentication middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    req.user = response.data;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/services', authenticateToken, (req, res) => {
  res.json({
    services: [
      {
        name: 'Users',
        url: '/users',
        icon: 'users'
      },
      {
        name: 'Write',
        url: '/write',
        icon: 'edit'
      },
      {
        name: 'Ads',
        url: '/ads',
        icon: 'ad'
      },
      {
        name: 'Logs',
        url: '/logs',
        icon: 'chart'
      }
    ]
  });
});

// Proxy routes to respective services
app.use('/users', authenticateToken, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${USERS_SERVICE_URL}${req.path}`,
      data: req.body,
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.use('/write', authenticateToken, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${WRITE_SERVICE_URL}${req.path}`,
      data: req.body,
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.use('/ads', authenticateToken, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${ADS_SERVICE_URL}${req.path}`,
      data: req.body,
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.use('/logs', authenticateToken, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${LOGS_SERVICE_URL}${req.path}`,
      data: req.body,
      headers: {
        Authorization: req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Admin service listening on port ${PORT}`);
}); 