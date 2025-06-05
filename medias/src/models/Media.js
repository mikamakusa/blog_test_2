const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    folder: {
        type: String,
        required: true,
        default: 'default'
    },
    url: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    collection: 'blog_medias'
});

module.exports = mongoose.model('Media', mediaSchema); 