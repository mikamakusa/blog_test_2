import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Post } from './models/Post';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-engine', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 5,
  retryWrites: true,
  retryReads: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Authentication middleware
const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Get users from users service
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Fetching users from users service...');
    const response = await axios.get('http://localhost:3002/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Users fetched successfully:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching users:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return res.status(error.response?.status || 500).json({
        message: 'Error fetching users',
        details: error.response?.data || error.message
      });
    }
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Routes
// Get all posts (public endpoint)
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find({ isActive: true })
      .populate('author', 'name email')
      .select('title description tags author createdAt');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get a single post (public endpoint)
app.get('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    console.log('Fetching post with ID:', postId);
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.log('Invalid post ID format');
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    const post = await Post.findById(postId)
      .populate('author', 'name email')
      .lean();
    console.log('Found post:', post);
    
    if (!post) {
      console.log('Post not found');
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const serializedPost = {
      ...post,
      _id: post._id.toString(),
      author: {
        ...post.author,
        _id: post.author._id.toString()
      },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
    
    res.json(serializedPost);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ 
      message: 'Error fetching post',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin routes
// Get all posts (including inactive ones)
app.get('/admin/posts', authenticateToken, async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'name email')
      .select('-__v');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Create a new post
app.post('/admin/posts', authenticateToken, async (req, res) => {
  try {
    const { title, tags, description, content, author, isActive } = req.body;
    const post = new Post({ 
      title, 
      tags, 
      description, 
      content, 
      author, 
      isActive 
    });
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name email');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});

// Update a post
app.put('/admin/posts/:id', authenticateToken, async (req, res) => {
  try {
    const { title, tags, description, content, author, isActive } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, tags, description, content, author, isActive },
      { new: true }
    ).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
});

// Delete a post
app.delete('/admin/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

app.listen(port, () => {
  console.log(`Write service listening at http://localhost:${port}`);
}); 