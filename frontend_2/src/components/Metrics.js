import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

const MetricCard = ({ title, value, subtitle }) => (
    <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
            {title}
        </Typography>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {value}
        </Typography>
        {subtitle && (
            <Typography variant="body2" color="text.secondary">
                {subtitle}
            </Typography>
        )}
    </Paper>
);

const Metrics = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await axios.get('http://localhost:5005/api/metrics');
                setMetrics(response.data);
            } catch (error) {
                console.error('Error fetching metrics:', error);
                setError('Failed to load metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
        // Refresh metrics every 30 seconds
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" sx={{ my: 4 }}>
                {error}
            </Typography>
        );
    }

    return (
        <Grid container spacing={3} sx={{ mb: 8 }}>
            <Grid item xs={12} md={2}>
                <MetricCard
                    title="Total Posts"
                    value={metrics?.posts?.total || 0}
                    subtitle="Published blog posts"
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <MetricCard
                    title="Users"
                    value={metrics?.users?.total || 0}
                    subtitle={`${metrics?.users?.active || 0} active, ${metrics?.users?.inactive || 0} inactive`}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <MetricCard
                    title="Advertisements"
                    value={metrics?.ads?.total || 0}
                    subtitle={`${metrics?.ads?.active || 0} active, ${metrics?.ads?.inactive || 0} inactive`}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <MetricCard
                    title="Polls"
                    value={metrics?.polls?.total || 0}
                    subtitle={`${metrics?.polls?.active || 0} active, ${metrics?.polls?.inactive || 0} inactive`}
                />
            </Grid>
        </Grid>
    );
};

export default Metrics; 