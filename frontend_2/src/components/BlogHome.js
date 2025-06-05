import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Grid,
    Box,
    AppBar,
    Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';

const MarkdownContent = ({ content }) => {
    if (!content) return null;
    
    // Ensure content is a string and truncate it
    const truncatedContent = String(content).substring(0, 200);
    
    return (
        <Box sx={{ mt: 2 }}>
            <ReactMarkdown>
                {truncatedContent}
            </ReactMarkdown>
        </Box>
    );
};

const BlogHome = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:5002/api/posts/public');
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to load posts');
        }
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        My Blog
                    </Typography>
                    {user ? (
                        <Button color="inherit" onClick={() => navigate('/admin')}>
                            Admin Dashboard
                        </Button>
                    ) : (
                        <Button color="inherit" onClick={() => navigate('/login')}>
                            Login
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Welcome to My Blog
                </Typography>

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Grid container spacing={4}>
                    {posts.map((post) => (
                        <Grid item xs={12} md={6} key={post._id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="h2" gutterBottom>
                                        {post.title}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                        By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {post.description}
                                    </Typography>
                                    <MarkdownContent content={post.content} />
                                </CardContent>
                                <CardActions>
                                    <Button size="small" color="primary">
                                        Read More
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {posts.length === 0 && !error && (
                    <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
                        No posts available yet.
                    </Typography>
                )}
            </Container>
        </>
    );
};

export default BlogHome; 