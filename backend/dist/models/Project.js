// backend/src/models/Project.js
const mongoose = require('mongoose');
const layerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'text', 'shape', 'video', 'audio', 'group'],
    required: true
  },
  visible: {
    type: Boolean,
    default: true
  },
  locked: {
    type: Boolean,
    default: false
  },
  opacity: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  blendMode: {
    type: String,
    default: 'normal'
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  size: {
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    }
  },
  rotation: {
    type: Number,
    default: 0
  },
  scale: {
    x: {
      type: Number,
      default: 1
    },
    y: {
      type: Number,
      default: 1
    }
  },
  data: mongoose.Schema.Types.Mixed,
  // Layer-specific data
  filters: mongoose.Schema.Types.Mixed,
  effects: mongoose.Schema.Types.Mixed,
  mask: mongoose.Schema.Types.Mixed
}, {
  _id: false
});
const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [255, 'Project name cannot exceed 255 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'deleted'],
    default: 'active'
  },
  thumbnail: {
    type: String
  },
  canvas: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    dpi: {
      type: Number,
      default: 72
    }
  },
  layers: [layerSchema],
  history: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    data: mongoose.Schema.Types.Mixed
  }],
  adjustments: {
    brightness: {
      type: Number,
      default: 0
    },
    contrast: {
      type: Number,
      default: 0
    },
    saturation: {
      type: Number,
      default: 0
    },
    exposure: {
      type: Number,
      default: 0
    },
    highlights: {
      type: Number,
      default: 0
    },
    shadows: {
      type: Number,
      default: 0
    },
    temperature: {
      type: Number,
      default: 0
    },
    tint: {
      type: Number,
      default: 0
    }
  },
  filters: {
    active: String,
    intensity: {
      type: Number,
      default: 100
    },
    custom: mongoose.Schema.Types.Mixed
  },
  assets: [{
    id: String,
    name: String,
    type: String,
    url: String,
    size: Number,
    metadata: mongoose.Schema.Types.Mixed
  }],
  settings: {
    autoSave: {
      type: Boolean,
      default: true
    },
    showGrid: {
      type: Boolean,
      default: false
    },
    showGuides: {
      type: Boolean,
      default: true
    },
    snapToGrid: {
      type: Boolean,
      default: true
    }
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  sharing: {
    isPublic: {
      type: Boolean,
      default: false
    },
    shareLink: String,
    sharePassword: String,
    expiresAt: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  template: {
    isTemplate: {
      type: Boolean,
      default: false
    },
    category: String,
    uses: {
      type: Number,
      default: 0
    }
  },
  fileSize: {
    type: Number,
    default: 0
  },
  version: {
    type: Number,
    default: 1
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true
  },
  toObject: {
    virtuals: true
  }
});

// Indexes
projectSchema.index({
  user: 1,
  createdAt: -1
});
projectSchema.index({
  user: 1,
  status: 1
});
projectSchema.index({
  tags: 1
});
projectSchema.index({
  'template.isTemplate': 1,
  'template.category': 1
});
projectSchema.index({
  name: 'text',
  description: 'text'
});

// Pre-save middleware
projectSchema.pre('save', function (next) {
  this.lastEditedAt = new Date();
  if (this.isModified('layers') || this.isModified('adjustments')) {
    this.version += 1;
  }
  next();
});

// Add to history
projectSchema.methods.addToHistory = function (action, data) {
  this.history.push({
    action,
    timestamp: new Date(),
    data
  });

  // Keep only last 100 history entries
  if (this.history.length > 100) {
    this.history = this.history.slice(-100);
  }
};

// Generate share link
projectSchema.methods.generateShareLink = function () {
  const crypto = require('crypto');
  this.sharing.shareLink = crypto.randomBytes(16).toString('hex');
  return this.sharing.shareLink;
};

// Static methods
projectSchema.statics.findByUser = function (userId, options = {}) {
  const query = this.find({
    user: userId,
    status: {
      $ne: 'deleted'
    }
  });
  if (options.type) {
    query.where('type').equals(options.type);
  }
  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort('-updatedAt');
  }
  if (options.limit) {
    query.limit(options.limit);
  }
  if (options.skip) {
    query.skip(options.skip);
  }
  return query;
};
module.exports = mongoose.model('Project', projectSchema);