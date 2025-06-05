import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Box,
    Alert,
    Snackbar
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const MediaManagement = () => {
    const [medias, setMedias] = useState([]);
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [open, setOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [newFolder, setNewFolder] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchFolders();
        fetchMedias();
    }, [selectedFolder]);

    const fetchFolders = async () => {
        try {
            const response = await axios.get('http://localhost:5004/api/medias/folders');
            setFolders(response.data);
        } catch (error) {
            console.error('Error fetching folders:', error);
            setError('Failed to fetch folders');
        }
    };

    const fetchMedias = async () => {
        try {
            const url = selectedFolder
                ? `http://localhost:5004/api/medias?folder=${selectedFolder}`
                : 'http://localhost:5004/api/medias';
            const response = await axios.get(url);
            setMedias(response.data);
        } catch (error) {
            console.error('Error fetching media:', error);
            setError('Failed to fetch media files');
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', newFolder || 'default');

        try {
            await axios.post('http://localhost:5004/api/medias', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess('File uploaded successfully');
            setOpen(false);
            setSelectedFile(null);
            setNewFolder('');
            fetchMedias();
            fetchFolders();
        } catch (error) {
            console.error('Error uploading file:', error);
            setError(error.response?.data?.message || 'Failed to upload file');
        }
    };

    const handleDelete = async (mediaId) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            try {
                await axios.delete(`http://localhost:5004/api/medias/${mediaId}`);
                setSuccess('File deleted successfully');
                fetchMedias();
            } catch (error) {
                console.error('Error deleting file:', error);
                setError('Failed to delete file');
            }
        }
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 4 }}>
                <Typography variant="h4">
                    Media Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/admin')}
                >
                    Back to Dashboard
                </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
                <TextField
                    select
                    label="Select Folder"
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    sx={{ minWidth: 200, mr: 2 }}
                >
                    <MenuItem value="">All Folders</MenuItem>
                    {folders.map((folder) => (
                        <MenuItem key={folder} value={folder}>
                            {folder}
                        </MenuItem>
                    ))}
                </TextField>

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                >
                    Upload New File
                </Button>
            </Box>

            <Grid container spacing={3}>
                {medias.map((media) => (
                    <Grid item key={media._id} xs={12} sm={6} md={4} lg={3}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="200"
                                image={media.url}
                                alt={media.originalName}
                                sx={{ objectFit: 'contain' }}
                            />
                            <CardContent>
                                <Typography variant="subtitle1" noWrap>
                                    {media.originalName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Folder: {media.folder}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Size: {(media.size / 1024).toFixed(2)} KB
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <IconButton
                                    color="error"
                                    onClick={() => handleDelete(media._id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Upload New File</DialogTitle>
                <DialogContent>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        style={{ marginTop: '1rem' }}
                    />
                    <TextField
                        margin="dense"
                        label="Folder Name"
                        fullWidth
                        value={newFolder}
                        onChange={(e) => setNewFolder(e.target.value)}
                        placeholder="Leave empty for default folder"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpload} variant="contained" color="primary">
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>

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
        </Container>
    );
};

export default MediaManagement; 