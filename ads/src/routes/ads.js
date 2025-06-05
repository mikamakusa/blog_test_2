const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Ad = require('../models/Ad');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Get all ads (admin)
router.get('/', async (req, res) => {
    try {
        const ads = await Ad.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (error) {
        console.error('Error fetching ads:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get active ads (public)
router.get('/public', async (req, res) => {
    try {
        const ads = await Ad.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(ads);
    } catch (error) {
        console.error('Error fetching public ads:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create ad
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, url, isActive } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const ad = new Ad({
            title,
            url,
            image: `/uploads/${req.file.filename}`,
            isActive: isActive === 'true'
        });

        const savedAd = await ad.save();
        res.status(201).json(savedAd);
    } catch (error) {
        console.error('Error creating ad:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update ad
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, url, isActive } = req.body;
        const updateData = { title, url, isActive: isActive === 'true' };

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const ad = await Ad.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!ad) {
            return res.status(404).json({ message: 'Ad not found' });
        }

        res.json(ad);
    } catch (error) {
        console.error('Error updating ad:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete ad
router.delete('/:id', async (req, res) => {
    try {
        const ad = await Ad.findByIdAndDelete(req.params.id);
        if (!ad) {
            return res.status(404).json({ message: 'Ad not found' });
        }
        res.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        console.error('Error deleting ad:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 