const eventService = require('../services/eventService');

class EventController {
    async getAllEvents(req, res) {
        try {
            const events = await eventService.getAllEvents();
            res.json(events);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getEventById(req, res) {
        try {
            const event = await eventService.getEventById(req.params.id);
            res.json(event);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async createEvent(req, res) {
        try {
            const event = await eventService.createEvent(req.body);
            res.status(201).json(event);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateEvent(req, res) {
        try {
            const event = await eventService.updateEvent(req.params.id, req.body);
            res.json(event);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteEvent(req, res) {
        try {
            await eventService.deleteEvent(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new EventController(); 