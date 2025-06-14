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
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';

const POSTS_URI = process.env.REACT_APP_POSTS_URI || 'localhost:5002';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        isActive: true
    });
    const [preview, setPreview] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            console.log('Fetching posts from:', `http://${POSTS_URI}/api/posts`);
            const response = await axios.get(`http://${POSTS_URI}/api/posts`, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log('Posts response:', response.data);
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            setError(`Failed to fetch posts: ${error.message}`);
        }
    };

    const handleOpen = (post = null) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                description: post.description,
                content: post.content,
                isActive: post.isActive
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                description: '',
                content: '',
                isActive: true
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingPost(null);
        setPreview(false);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!user || !user._id) {
                setError('User not authenticated or missing user ID');
                return;
            }

            // Validate form data
            if (!formData.title || !formData.description || !formData.content) {
                setError('Please fill in all required fields');
                return;
            }

            console.log('Current user:', user); // Debug log
            console.log('Form data:', formData); // Debug log

            if (editingPost) {
                await axios.put(`http://${POSTS_URI}/api/posts/${editingPost._id}`, formData);
                setSuccess('Post updated successfully');
            } else {
                const postData = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    content: formData.content.trim(),
                    author: user._id,
                    isActive: formData.isActive
                };

                console.log('Post data being sent:', postData); // Debug log
                
                const response = await axios.post('http://${POSTS_URI}/api/posts', postData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Post creation response:', response.data);
                setSuccess('Post created successfully');
            }
            await fetchPosts(); // Refresh the posts list
            handleClose();
        } catch (error) {
            console.error('Error saving post:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error response status:', error.response?.status);
            const errorMessage = error.response?.data?.message || error.message;
            setError(`Failed to save post: ${errorMessage}`);
        }
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await axios.delete(`http://${POSTS_URI}/api/posts/${postId}`);
                setSuccess('Post deleted successfully');
                await fetchPosts(); // Refresh the posts list
            } catch (error) {
                console.error('Error deleting post:', error);
                setError('Failed to delete post');
            }
        }
    };

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, mb: 4 }}>
                <Typography variant="h4">
                    Post Management
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
                Add New Post
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Author</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {posts.map((post) => (
                            <TableRow key={post._id}>
                                <TableCell>{post.title}</TableCell>
                                <TableCell>{post.description}</TableCell>
                                <TableCell>{post.author?.name || 'Unknown'}</TableCell>
                                <TableCell>
                                    {post.isActive ? 'Active' : 'Inactive'}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(post)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(post._id)}>
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
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingPost ? 'Edit Post' : 'Add New Post'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2, mt: 1 }}>
                        <Button
                            variant={preview ? "outlined" : "contained"}
                            onClick={() => setPreview(!preview)}
                            sx={{ mr: 1 }}
                        >
                            {preview ? 'Edit' : 'Preview'}
                        </Button>
                    </Box>
                    {preview ? (
                        <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                            <Typography variant="h5" gutterBottom>{formData.title}</Typography>
                            <Typography variant="subtitle1" gutterBottom>{formData.description}</Typography>
                            <ReactMarkdown>{formData.content}</ReactMarkdown>
                        </Box>
                    ) : (
                        <>
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
                                label="Description"
                                fullWidth
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <TextField
                                margin="dense"
                                label="Content (Markdown)"
                                fullWidth
                                required
                                multiline
                                rows={10}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color="primary"
                        disabled={!formData.title || !formData.description || !formData.content}
                    >
                        {editingPost ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PostManagement; 