"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const articleSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    featuredImage: {
        type: String,
        required: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categories: [{
            type: String,
            trim: true
        }],
    tags: [{
            type: String,
            trim: true
        }]
}, {
    timestamps: true
});
// Generate slug before saving
articleSchema.pre('save', function (next) {
    if (!this.isModified('title'))
        return next();
    this.slug = (0, slugify_1.default)(this.title, {
        lower: true,
        strict: true
    });
    next();
});
exports.Article = mongoose_1.default.model('Article', articleSchema);
