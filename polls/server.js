require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const pollsRouter = require('./routes/polls');

const app = express();
const port = process.env.PORT || 5006;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/';

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


const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MongoDB database connection established successfully');
});

// Routes
app.use('/api/polls', pollsRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
}); 