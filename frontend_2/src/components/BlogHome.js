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
    Toolbar,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../contexts/AuthContext';
import EventsCalendar from './EventsCalendar';

const MarkdownContent = ({ content }) => {
    if (!content) return null;
    
    // Ensure content is a string and truncate it
    const truncatedContent = typeof content === 'string' 
        ? content.slice(0, 200) + (content.length > 200 ? '...' : '')
        : '';

    return <ReactMarkdown>{truncatedContent}</ReactMarkdown>;
};

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: (theme.vars ?? theme).palette.text.secondary,
    ...theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }));

const BlogHome = () => {
    const [posts, setPosts] = useState([]);
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsResponse, adsResponse] = await Promise.all([
                    axios.get('http://localhost:5002/api/posts/public'),
                    axios.get('http://localhost:5003/api/ads/public')
                ]);
                setPosts(postsResponse.data);
                setAds(adsResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load content. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid size={4}>
                        <Item>
                            <EventsCalendar />
                        </Item>
                    </Grid>
                
                    <Grid size={8}>
                        <Item>
                            <Typography variant="h3" component="h1" gutterBottom align="center">
                                Blog Posts
                            </Typography>

                            <Grid container spacing={4}>
                                {posts.map((post) => (
                                    <Grid item key={post._id} xs={12} md={6}>
                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Typography variant="h5" component="h2" gutterBottom>
                                                    {post.title}
                                                </Typography>
                                                
                                                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                                    By {post.author?.name || 'Unknown'} • {new Date(post.createdAt).toLocaleDateString()}
                                                </Typography>

                                                <Typography variant="h6" gutterBottom>
                                                    {post.description}
                                                </Typography>

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
                                                    <MarkdownContent content={post.content} />
                                                </Box>
                                            </CardContent>
                                            <CardActions>
                                                <Button 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => navigate(`/blog/${post._id}`)}
                                                >
                                                    Read More
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Item>
                        <item>
                        {ads.length > 0 && (
                            <Box sx={{ mt: 8, mb: 4 }}>
                                <Typography variant="h5" gutterBottom align="center">
                                    Sponsored Content
                                </Typography>
                                <Grid container spacing={2} justifyContent="center">
                                    {ads.map((ad) => (
                                        <Grid item key={ad._id}>
                                            <a 
                                                href={ad.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <img 
                                                    src={`http://localhost:5003${ad.image}`}
                                                    alt={ad.title}
                                                    style={{ 
                                                        maxWidth: '200px',
                                                        maxHeight: '100px',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            </a>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                        </item>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default BlogHome; 