require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const eventRoutes = require('./routes/eventRoutes');
const dotenv = require('dotenv');

dotenv.config();

const FRONTEND_URI = process.env.FRONTEND_URI || 'localhost:3001'

const app = express();

// CORS configuration
app.use(cors({
    origin: `http://${FRONTEND_URI}`, // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Middleware
app.use(express.json());

// Connect to MongoDB
const MONGODB_HOST = process.env.MONGODB_HOST || 'localhost:27017';
const MONGODB_USER = process.env.MONGODB_USER || 'admin';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'password';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'database';
const MONGODB_URI = `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}`

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/events', eventRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Events service is running on port ${PORT}`);
}); 