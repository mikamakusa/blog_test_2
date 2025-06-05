const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Media = require('../models/Media');
const { minioClient, BUCKET_NAME } = require('../config/minio');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
        }
    }
});

// Get all media files
router.get('/', async (req, res) => {
    try {
        const { folder } = req.query;
        const query = folder ? { folder } : {};
        const medias = await Media.find(query).sort({ createdAt: -1 });
        res.json(medias);
    } catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ message: error.message });
    }
});

// Upload new media file
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { folder = 'default' } = req.body;
        const file = req.file;
        const filename = `${Date.now()}-${file.originalname}`;
        const filePath = `${folder}/${filename}`;

        // Upload to MinIO
        await minioClient.putObject(
            BUCKET_NAME,
            filePath,
            file.buffer,
            file.size,
            { 'Content-Type': file.mimetype }
        );

        // Create media record in MongoDB
        const media = new Media({
            filename: filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            folder: folder,
            url: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${filePath}`
        });

        const savedMedia = await media.save();
        res.status(201).json(savedMedia);
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete media file
router.delete('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Delete from MinIO
        const filePath = `${media.folder}/${media.filename}`;
        await minioClient.removeObject(BUCKET_NAME, filePath);

        // Delete from MongoDB
        await Media.findByIdAndDelete(req.params.id);
        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get folders
router.get('/folders', async (req, res) => {
    try {
        const folders = await Media.distinct('folder');
        res.json(folders);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 