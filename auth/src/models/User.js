const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // Password is required only if not using Google OAuth
        }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    strapiUserId: {
        type: String,
        unique: true,
        sparse: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'blog_users' // Explicitly set the collection name
});

module.exports = mongoose.model('User', userSchema); 