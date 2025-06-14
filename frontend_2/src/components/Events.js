import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Box,
    Alert,
    Snackbar
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import EventsCalendar from './EventsCalendar';
const dotenv = require('dotenv');

dotenv.config();

const EVENTS_URI = process.env.EVENTS_URI || 'localhost:3001';

const API_BASE_URL = `http://${EVENTS_URI}/api/events`;

const Events = () => {
    const [events, setEvents] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        dateStart: new Date(),
        dateEnd: new Date(),
        callForPaperDateStart: new Date(),
        callForPaperDateEnd: new Date()
    });

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
            setError('Failed to load events. Please try again later.');
        }
    };

    const handleOpen = (event = null) => {
        if (event) {
            setSelectedEvent(event);
            setFormData({
                name: event.name,
                description: event.description,
                dateStart: new Date(event.dateStart),
                dateEnd: new Date(event.dateEnd),
                callForPaperDateStart: new Date(event.callForPaperDateStart),
                callForPaperDateEnd: new Date(event.callForPaperDateEnd)
            });
        } else {
            setSelectedEvent(null);
            setFormData({
                name: '',
                description: '',
                dateStart: new Date(),
                dateEnd: new Date(),
                callForPaperDateStart: new Date(),
                callForPaperDateEnd: new Date()
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedEvent(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = selectedEvent 
                ? `${API_BASE_URL}/${selectedEvent._id}`
                : API_BASE_URL;
            const method = selectedEvent ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save event');
            }

            await fetchEvents();
            handleClose();
        } catch (error) {
            console.error('Error saving event:', error);
            setError('Failed to save event. Please try again.');
        }
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/${eventId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error('Failed to delete event');
                }
                await fetchEvents();
            } catch (error) {
                console.error('Error deleting event:', error);
                setError('Failed to delete event. Please try again.');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Events Management</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpen()}>
                    Add New Event
                </Button>
            </Box>

            
                
                    <Paper sx={{ p: 2 }}>
                        <List>
                            {events.map((event) => (
                                <ListItem
                                    key={event._id}
                                    secondaryAction={
                                        <Box>
                                            <Button onClick={() => handleOpen(event)} sx={{ mr: 1 }}>
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleDelete(event._id)} color="error">
                                                Delete
                                            </Button>
                                        </Box>
                                    }
                                >
                                    <ListItemText
                                        primary={event.name}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2">
                                                    {new Date(event.dateStart).toLocaleDateString()} - {new Date(event.dateEnd).toLocaleDateString()}
                                                </Typography>
                                                <br />
                                                <Typography component="span" variant="body2">
                                                    {event.description}
                                                </Typography>
                                            </>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                
            

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedEvent ? 'Edit Event' : 'Add New Event'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Event Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </Grid>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Grid item xs={12} md={6}>
                                <DateTimePicker
                                    label="Start Date"
                                    value={formData.dateStart}
                                    onChange={(newValue) => setFormData({ ...formData, dateStart: newValue })}
                                    renderInput={(params) => <TextField {...params} fullWidth required />}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DateTimePicker
                                    label="End Date"
                                    value={formData.dateEnd}
                                    onChange={(newValue) => setFormData({ ...formData, dateEnd: newValue })}
                                    renderInput={(params) => <TextField {...params} fullWidth required />}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DateTimePicker
                                    label="Call for Paper Start Date"
                                    value={formData.callForPaperDateStart}
                                    onChange={(newValue) => setFormData({ ...formData, callForPaperDateStart: newValue })}
                                    renderInput={(params) => <TextField {...params} fullWidth required />}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <DateTimePicker
                                    label="Call for Paper End Date"
                                    value={formData.callForPaperDateEnd}
                                    onChange={(newValue) => setFormData({ ...formData, callForPaperDateEnd: newValue })}
                                    renderInput={(params) => <TextField {...params} fullWidth required />}
                                />
                            </Grid>
                        </LocalizationProvider>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedEvent ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Events; 