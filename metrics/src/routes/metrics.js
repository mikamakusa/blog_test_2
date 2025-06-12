const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Get all metrics
router.get('/', async (req, res) => {
    try {
        const db = mongoose.connection.db;

        // Get posts count
        const postsCount = await db.collection('blog_posts').countDocuments();

        // Get users count by status
        const usersByStatus = await db.collection('blog_users').aggregate([
            {
                $group: {
                    _id: '$isActive',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // Get ads count by status
        const adsByStatus = await db.collection('blog_ads').aggregate([
            {
                $group: {
                    _id: '$isActive',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // Get polls count by status
        const pollsByStatus = await db.collection('polls').aggregate([
            {
                $group: {
                    _id: '$isActive',
                    count: { $sum: 1}
                }
            }
        ]).toArray();

        // Format the response
        const metrics = {
            posts: {
                total: postsCount
            },
            users: {
                active: usersByStatus.find(stat => stat._id === true)?.count || 0,
                inactive: usersByStatus.find(stat => stat._id === false)?.count || 0,
                total: usersByStatus.reduce((sum, stat) => sum + stat.count, 0)
            },
            ads: {
                active: adsByStatus.find(stat => stat._id === true)?.count || 0,
                inactive: adsByStatus.find(stat => stat._id === false)?.count || 0,
                total: adsByStatus.reduce((sum, stat) => sum + stat.count, 0)
            },
            polls: {
                active: pollsByStatus.find(stat => stat._id === true)?.count || 0,
                inactive: pollsByStatus.find(stat => stat._id === false)?.count || 0,
                total: pollsByStatus.reduce((sum, stat) => sum + stat.count, 0)
            }
        };

        res.json(metrics);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 