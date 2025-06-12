const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    answers: [{
        text: {
            type: String,
            required: true,
            trim: true
        },
        votes: {
            type: Number,
            default: 0
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
pollSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Poll', pollSchema); 