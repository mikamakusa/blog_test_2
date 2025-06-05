const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { marked } = require('marked');

// Get all posts (public)
router.get('/public', async (req, res) => {
    try {
        const posts = await Post.find({ isActive: true })
            .populate('author', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching public posts:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all posts (admin)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching all posts:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        console.error('Error fetching single post:', error);
        res.status(500).json({ message: error.message });
    }
});

// Create post
router.post('/', async (req, res) => {
    try {
        const { title, description, content, author, isActive } = req.body;

        console.log('Received post creation request:', req.body); // Debug log

        // Validate required fields
        if (!title || !description || !content || !author) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { title, description, content, author }
            });
        }

        // Check if user exists
        const user = await User.findById(author);
        console.log('Found user:', user); // Debug log

        if (!user) {
            return res.status(400).json({ 
                message: 'Author not found',
                authorId: author
            });
        }

        const post = new Post({
            title: title.trim(),
            description: description.trim(),
            content: content.trim(),
            author,
            isActive: isActive !== undefined ? isActive : true
        });

        console.log('Creating new post:', post); // Debug log

        const savedPost = await post.save();
        console.log('Saved post:', savedPost); // Debug log

        const populatedPost = await Post.findById(savedPost._id)
            .populate('author', 'name');
        console.log('Populated post:', populatedPost); // Debug log

        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(400).json({ 
            message: error.message,
            details: error.stack
        });
    }
});

// Update post
router.put('/:id', async (req, res) => {
    try {
        const { title, description, content, isActive } = req.body;
        const updateData = { title, description, content, isActive };

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('author', 'name');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(400).json({ message: error.message });
    }
});

// Delete post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 