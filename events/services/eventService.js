const Event = require('../models/Event');

class EventService {
    async getAllEvents() {
        try {
            return await Event.find().sort({ dateStart: -1 });
        } catch (error) {
            throw new Error('Error fetching events: ' + error.message);
        }
    }

    async getEventById(id) {
        try {
            const event = await Event.findById(id);
            if (!event) {
                throw new Error('Event not found');
            }
            return event;
        } catch (error) {
            throw new Error('Error fetching event: ' + error.message);
        }
    }

    async createEvent(eventData) {
        try {
            const event = new Event(eventData);
            return await event.save();
        } catch (error) {
            throw new Error('Error creating event: ' + error.message);
        }
    }

    async updateEvent(id, eventData) {
        try {
            const event = await Event.findByIdAndUpdate(
                id,
                { ...eventData, updatedAt: Date.now() },
                { new: true, runValidators: true }
            );
            if (!event) {
                throw new Error('Event not found');
            }
            return event;
        } catch (error) {
            throw new Error('Error updating event: ' + error.message);
        }
    }

    async deleteEvent(id) {
        try {
            const event = await Event.findByIdAndDelete(id);
            if (!event) {
                throw new Error('Event not found');
            }
            return event;
        } catch (error) {
            throw new Error('Error deleting event: ' + error.message);
        }
    }
}

module.exports = new EventService(); 