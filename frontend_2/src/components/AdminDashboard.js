import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Box,
    Grid,
    Paper
} from '@mui/material';
import Metrics from './Metrics';

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>
            
            <Metrics />

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            User Management
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/admin/users')}
                            fullWidth
                        >
                            Manage Users
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Post Management
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/admin/posts')}
                            fullWidth
                        >
                            Manage Posts
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Advertisement Management
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/admin/ads')}
                            fullWidth
                        >
                            Manage Ads
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Media Management
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/admin/medias')}
                            fullWidth
                        >
                            Manage Medias
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Events Management
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/admin/events')}
                            fullWidth
                        >
                            Manage Events
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Poll Management
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/admin/polls')}
                            fullWidth
                        >
                            Manage Polls
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard; 