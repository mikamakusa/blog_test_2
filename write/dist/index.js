"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Post_1 = require("./models/Post");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3003;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB connection
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-engine', {
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
mongoose_1.default.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
mongoose_1.default.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});
// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error('Token verification error:', err);
        return res.status(403).json({ message: 'Invalid token' });
    }
};
// Get users from users service
app.get('/users', authenticateToken, async (req, res) => {
    try {
        const response = await axios_1.default.get('http://localhost:3002/users', {
            headers: {
                'Authorization': `Bearer ${req.headers.authorization}`
            }
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});
// Routes
// Get all posts (public endpoint)
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post_1.Post.find({ isActive: true })
            .populate('author', 'name email')
            .select('title description tags author createdAt');
        res.json(posts);
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});
// Get a single post (public endpoint)
app.get('/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        console.log('Fetching post with ID:', postId);
        if (!mongoose_1.default.Types.ObjectId.isValid(postId)) {
            console.log('Invalid post ID format');
            return res.status(400).json({ message: 'Invalid post ID format' });
        }
        const post = await Post_1.Post.findById(postId)
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
    }
    catch (error) {
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
        const posts = await Post_1.Post.find({})
            .populate('author', 'name email')
            .select('-__v');
        res.json(posts);
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Error fetching posts' });
    }
});
// Create a new post
app.post('/admin/posts', authenticateToken, async (req, res) => {
    try {
        const { title, tags, description, content, author, isActive } = req.body;
        const post = new Post_1.Post({
            title,
            tags,
            description,
            content,
            author,
            isActive
        });
        await post.save();
        const populatedPost = await Post_1.Post.findById(post._id)
            .populate('author', 'name email');
        res.status(201).json(populatedPost);
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Error creating post' });
    }
});
// Update a post
app.put('/admin/posts/:id', authenticateToken, async (req, res) => {
    try {
        const { title, tags, description, content, author, isActive } = req.body;
        const post = await Post_1.Post.findByIdAndUpdate(req.params.id, { title, tags, description, content, author, isActive }, { new: true }).populate('author', 'name email');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    }
    catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post' });
    }
});
// Delete a post
app.delete('/admin/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post_1.Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});
app.listen(port, () => {
    console.log(`Write service listening at http://localhost:${port}`);
});
