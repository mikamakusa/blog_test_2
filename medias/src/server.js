const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeBucket } = require('./config/minio');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog_engine';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        console.log('Database:', mongoose.connection.db.databaseName);
        console.log('Collections:', Object.keys(mongoose.connection.collections));
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    });

// Initialize MinIO bucket
initializeBucket()
    .then(() => console.log('MinIO bucket initialized'))
    .catch(error => {
        console.error('Failed to initialize MinIO bucket:', error);
        process.exit(1);
    });

// Routes
const mediasRouter = require('./routes/medias');
app.use('/api/medias', mediasRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5004;
app.listen(PORT, () => {
    console.log(`Medias service running on port ${PORT}`);
}); 