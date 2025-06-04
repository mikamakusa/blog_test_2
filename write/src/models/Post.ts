import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  title: string;
  tags: string[];
  description: string;
  content: string;
  author: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'blog_posts'
});

// Add a pre-find middleware to log queries
postSchema.pre('find', function() {
  console.log('Executing find query:', this.getQuery());
});

postSchema.pre('findOne', function() {
  console.log('Executing findOne query:', this.getQuery());
});

postSchema.pre('findById', function() {
  console.log('Executing findById query:', this.getQuery());
});

export const Post = mongoose.model<IPost>('Post', postSchema); 