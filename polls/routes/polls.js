const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');

// Get all polls
router.get('/', async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        res.json(polls);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get active poll
router.get('/active', async (req, res) => {
    try {
        const poll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new poll
router.post('/', async (req, res) => {
    const poll = new Poll({
        question: req.body.question,
        answers: req.body.answers,
        isActive: req.body.isActive
    });

    try {
        const newPoll = await poll.save();
        res.status(201).json(newPoll);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a poll
router.patch('/:id', async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        if (req.body.question) poll.question = req.body.question;
        if (req.body.answers) poll.answers = req.body.answers;
        if (req.body.isActive !== undefined) poll.isActive = req.body.isActive;

        const updatedPoll = await poll.save();
        res.json(updatedPoll);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a poll
router.delete('/:id', async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        await poll.remove();
        res.json({ message: 'Poll deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Vote on a poll
router.post('/:id/vote', async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const answerIndex = req.body.answerIndex;
        if (answerIndex < 0 || answerIndex >= poll.answers.length) {
            return res.status(400).json({ message: 'Invalid answer index' });
        }

        poll.answers[answerIndex].votes += 1;
        const updatedPoll = await poll.save();
        res.json(updatedPoll);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 