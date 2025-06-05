import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Box,
    Paper,
    Grid
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <Container>
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Admin Dashboard
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Welcome, {user?.name || 'User'}!
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            User Management
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Manage user accounts, permissions, and access levels.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/users')}
                        >
                            Manage Users
                        </Button>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Post Management
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Create, edit, and manage blog posts.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/posts')}
                        >
                            Manage Posts
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminDashboard; 