// backend/src/models/Layer.js
const mongoose = require('mongoose');

const layerSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    default: 'Layer'
  },
  type: {
    type: String,
    enum: ['image', 'text', 'shape', 'video', 'audio', 'group', 'adjustment'],
    required: true
  },
  order: {
    type: Number,
    default: 0,
    index: true
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
    default: 'normal',
    enum: ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
           'color-dodge', 'color-burn', 'hard-light', 'soft-light', 
           'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity']
  },
  transform: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    rotation: { type: Number, default: 0 },
    scaleX: { type: Number, default: 1 },
    scaleY: { type: Number, default: 1 },
    skewX: { type: Number, default: 0 },
    skewY: { type: Number, default: 0 }
  },
  size: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  data: mongoose.Schema.Types.Mixed,
  effects: {
    blur: { type: Number, default: 0 },
    brightness: { type: Number, default: 100 },
    contrast: { type: Number, default: 100 },
    saturation: { type: Number, default: 100 },
    hue: { type: Number, default: 0 },
    sepia: { type: Number, default: 0 },
    grayscale: { type: Number, default: 0 }
  },
  mask: {
    enabled: { type: Boolean, default: false },
    inverted: { type: Boolean, default: false },
    path: String,
    imageUrl: String
  },
  styles: {
    fill: String,
    stroke: String,
    strokeWidth: Number,
    shadow: {
      enabled: Boolean,
      color: String,
      blur: Number,
      offsetX: Number,
      offsetY: Number
    }
  },
  text: {
    content: String,
    fontFamily: String,
    fontSize: Number,
    fontWeight: String,
    fontStyle: String,
    textAlign: String,
    lineHeight: Number,
    letterSpacing: Number
  },
  animation: {
    enabled: { type: Boolean, default: false },
    type: String,
    duration: Number,
    delay: Number,
    easing: String,
    keyframes: [mongoose.Schema.Types.Mixed]
  },
  thumbnail: String,
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes
layerSchema.index({ project: 1, order: 1 });
layerSchema.index({ type: 1 });

// Pre-save to maintain order
layerSchema.pre('save', function(next) {
  if (this.isNew) {
    const Layer = this.constructor;
    Layer.countDocuments({ project: this.project }).then(count => {
      if (!this.order) {
        this.order = count;
      }
      next();
    });
  } else {
    next();
  }
});

module.exports = mongoose.model('Layer', layerSchema);
