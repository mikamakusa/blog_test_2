import mongoose from 'mongoose';
import slugify from 'slugify';

export interface IArticle extends mongoose.Document {
  title: string;
  content: string;
  slug: string;
  featuredImage: string;
  publishDate: Date;
  author: mongoose.Types.ObjectId;
  categories: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
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
articleSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  
  this.slug = slugify(this.title, {
    lower: true,
    strict: true
  });
  
  next();
});

export const Article = mongoose.model<IArticle>('Article', articleSchema); 