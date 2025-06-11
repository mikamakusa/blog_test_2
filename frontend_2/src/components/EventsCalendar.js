import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { format, isSameDay } from 'date-fns';

const API_BASE_URL = 'http://localhost:3001/api/events';

const EventsCalendar = () => {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to load events');
        }
    };

    const getEventsForSelectedDate = () => {
        return events.filter(event => {
            const eventStart = new Date(event.dateStart);
            const eventEnd = new Date(event.dateEnd);
            return isSameDay(eventStart, selectedDate) || 
                   isSameDay(eventEnd, selectedDate) ||
                   (eventStart < selectedDate && eventEnd > selectedDate);
        });
    };

    const renderEventDetails = (event) => {
        const startDate = new Date(event.dateStart);
        const endDate = new Date(event.dateEnd);
        const cfpStart = new Date(event.callForPaperDateStart);
        const cfpEnd = new Date(event.callForPaperDateEnd);

        return (
            <ListItem key={event._id} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    {event.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {format(startDate, 'PPp')} - {format(endDate, 'PPp')}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    {event.description}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Call for Papers: {format(cfpStart, 'PP')} - {format(cfpEnd, 'PP')}
                </Typography>
                <Divider sx={{ width: '100%', mt: 1 }} />
            </ListItem>
        );
    };

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Events Calendar
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCalendar
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    sx={{ width: '100%' }}
                />
            </LocalizationProvider>

            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Events on {format(selectedDate, 'MMMM d, yyyy')}
                </Typography>
                <List>
                    {getEventsForSelectedDate().map(renderEventDetails)}
                    {getEventsForSelectedDate().length === 0 && (
                        <ListItem>
                            <ListItemText 
                                primary="No events scheduled for this date"
                                sx={{ textAlign: 'center', color: 'text.secondary' }}
                            />
                        </ListItem>
                    )}
                </List>
            </Box>
        </Paper>
    );
};

export default EventsCalendar; 