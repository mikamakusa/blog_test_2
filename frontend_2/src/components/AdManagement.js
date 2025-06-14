import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Checkbox,
    IconButton,
    Box,
    Alert,
    Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
const dotenv = require('dotenv');

dotenv.config();

const ADS_URI = process.env.ADS_URI || 'localhost:5003';

const AdManagement = () => {
    const [ads, setAds] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        image: null,
        isActive: true
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const response = await axios.get(`http://${ADS_URI}/api/ads`);
            setAds(response.data);
        } catch (error) {
            console.error('Error fetching ads:', error);
            setError('Failed to fetch ads');
        }
    };

    const handleOpen = (ad = null) => {
        if (ad) {
            setEditingAd(ad);
            setFormData({
                title: ad.title,
                url: ad.url,
                image: null,
                isActive: ad.isActive
            });
        } else {
            setEditingAd(null);
            setFormData({
                title: '',
                url: '',
                image: null,
                isActive: true
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingAd(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('url', formData.url);
            formDataToSend.append('isActive', formData.isActive);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            if (editingAd) {
                await axios.put(`http://${ADS_URI}/api/ads/${editingAd._id}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setSuccess('Ad updated successfully');
            } else {
                await axios.post(`http://${ADS_URI}/api/ads`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setSuccess('Ad created successfully');
            }
            await fetchAds();
            handleClose();
        } catch (error) {
            console.error('Error saving ad:', error);
            setError(error.response?.data?.message || 'Failed to save ad');
        }
    };

    const handleDelete = async (adId) => {
        if (window.confirm('Are you sure you want to delete this ad?')) {
            try {
                await axios.delete(`http://${ADS_URI}/api/ads/${adId}`);
                setSuccess('Ad deleted successfully');
                await fetchAds();
            } catch (error) {
                console.error('Error deleting ad:', error);
                setError('Failed to delete ad');
            }
        }
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 4 }}>
                <Typography variant="h4">
                    Ad Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/admin')}
                >
                    Back to Dashboard
                </Button>
            </Box>

            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar 
                open={!!success} 
                autoHideDuration={6000} 
                onClose={() => setSuccess('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="success" onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            </Snackbar>

            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen()}
                sx={{ mb: 2 }}
            >
                Add New Ad
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>URL</TableCell>
                            <TableCell>Image</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ads.map((ad) => (
                            <TableRow key={ad._id}>
                                <TableCell>{ad.title}</TableCell>
                                <TableCell>{ad.url}</TableCell>
                                <TableCell>
                                    <img 
                                        src={`http://${ADS_URI}${ad.image}`}
                                        alt={ad.title}
                                        style={{ maxWidth: '100px', maxHeight: '50px' }}
                                    />
                                </TableCell>
                                <TableCell>
                                    {ad.isActive ? 'Active' : 'Inactive'}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(ad)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(ad._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={open} 
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {editingAd ? 'Edit Ad' : 'Add New Ad'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Title"
                        fullWidth
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="URL"
                        fullWidth
                        required
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                        style={{ marginTop: '1rem' }}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                        }
                        label="Active"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="primary"
                        disabled={!formData.title || !formData.url || (!editingAd && !formData.image)}
                    >
                        {editingAd ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdManagement; 