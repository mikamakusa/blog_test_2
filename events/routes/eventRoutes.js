const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events
router.get('/', eventController.getAllEvents);

// Get a specific event
router.get('/:id', eventController.getEventById);

// Create a new event
router.post('/', eventController.createEvent);

// Update an event
router.put('/:id', eventController.updateEvent);

// Delete an event
router.delete('/:id', eventController.deleteEvent);

module.exports = router; 