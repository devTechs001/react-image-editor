import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'mixed'],
      default: 'image',
    },
    canvas: {
      width: { type: Number, default: 1920 },
      height: { type: Number, default: 1080 },
      backgroundColor: { type: String, default: '#ffffff' },
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    layers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Layer',
      },
    ],
    assets: [
      {
        type: {
          type: String,
          enum: ['image', 'video', 'audio', 'text'],
        },
        url: String,
        name: String,
        size: Number,
      },
    ],
    collaborators: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['viewer', 'editor', 'admin'],
          default: 'viewer',
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
projectSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Project', projectSchema);