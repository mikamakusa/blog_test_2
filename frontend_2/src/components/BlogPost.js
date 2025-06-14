import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

// Configure axios defaults
axios.defaults.timeout = 5000; // 5 seconds timeout
axios.defaults.headers.common['Cache-Control'] = 'no-cache';

const POSTS_URI = process.env.REACT_APP_POSTS_URI || 'localhost:5002';

const BlogPost = () => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(`http://${POSTS_URI}/api/posts/${id}`);
                setPost(response.data);
            } catch (error) {
                console.error('Error fetching post:', error);
                setError('Failed to load post. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!post) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="info">Post not found</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back to Blog
            </Button>
            
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    {post.title}
                </Typography>
                
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                </Typography>

                <Box sx={{ my: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        {post.description}
                    </Typography>
                </Box>

                <Box sx={{ 
                    '& img': { maxWidth: '100%', height: 'auto' },
                    '& pre': { 
                        backgroundColor: '#f5f5f5',
                        padding: '1rem',
                        borderRadius: '4px',
                        overflowX: 'auto'
                    },
                    '& code': {
                        backgroundColor: '#f5f5f5',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px'
                    }
                }}>
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </Box>
            </Paper>
        </Container>
    );
};

export default BlogPost; 