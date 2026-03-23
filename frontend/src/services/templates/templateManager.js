// frontend/src/services/templates/templateManager.js
/**
 * Template Manager Service
 * Manages templates for quick image transformations
 */

export const TemplateCategory = {
  SOCIAL_MEDIA: 'social-media',
  MARKETING: 'marketing',
  PORTRAIT: 'portrait',
  PRODUCT: 'product',
  ARTISTIC: 'artistic',
  BUSINESS: 'business',
  EVENT: 'event',
  EDUCATION: 'education'
};

export const TemplateType = {
  BACKGROUND_REPLACE: 'background-replace',
  FRAME: 'frame',
  OVERLAY: 'overlay',
  TEXT_LAYOUT: 'text-layout',
  COLLAGE: 'collage',
  EFFECT: 'effect',
  FILTER: 'filter',
  TRANSFORM: 'transform'
};

/**
 * Template definitions with transformation logic
 */
export const templates = {
  // Social Media Templates
  'instagram-post': {
    id: 'instagram-post',
    name: 'Instagram Post',
    category: TemplateCategory.SOCIAL_MEDIA,
    type: TemplateType.TRANSFORM,
    dimensions: { width: 1080, height: 1080 },
    description: 'Square format for Instagram posts',
    thumbnail: '/templates/instagram-post.jpg',
    transformations: [
      { type: 'resize', width: 1080, height: 1080, fit: 'cover' },
      { type: 'filter', name: 'vibrant', intensity: 0.7 },
      { type: 'adjustment', brightness: 1.05, contrast: 1.1, saturation: 1.15 }
    ],
    tags: ['social', 'square', 'instagram', 'popular']
  },
  
  'instagram-story': {
    id: 'instagram-story',
    name: 'Instagram Story',
    category: TemplateCategory.SOCIAL_MEDIA,
    type: TemplateType.TRANSFORM,
    dimensions: { width: 1080, height: 1920 },
    description: 'Vertical format for Instagram Stories',
    thumbnail: '/templates/instagram-story.jpg',
    transformations: [
      { type: 'resize', width: 1080, height: 1920, fit: 'cover' },
      { type: 'gradient-overlay', colors: ['#6366f1', '#8b5cf6'], opacity: 0.3 }
    ],
    tags: ['social', 'vertical', 'story', 'instagram']
  },
  
  'youtube-thumbnail': {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    category: TemplateCategory.SOCIAL_MEDIA,
    type: TemplateType.TRANSFORM,
    dimensions: { width: 1280, height: 720 },
    description: 'Eye-catching thumbnail for YouTube videos',
    thumbnail: '/templates/youtube-thumbnail.jpg',
    transformations: [
      { type: 'resize', width: 1280, height: 720, fit: 'cover' },
      { type: 'filter', name: 'dramatic', intensity: 0.8 },
      { type: 'adjustment', contrast: 1.2, saturation: 1.3, sharpness: 1.2 },
      { type: 'vignette', intensity: 0.4 }
    ],
    tags: ['social', 'youtube', 'thumbnail', 'video']
  },
  
  'tiktok-video': {
    id: 'tiktok-video',
    name: 'TikTok Video',
    category: TemplateCategory.SOCIAL_MEDIA,
    type: TemplateType.TRANSFORM,
    dimensions: { width: 1080, height: 1920 },
    description: 'Full vertical format for TikTok',
    thumbnail: '/templates/tiktok-video.jpg',
    transformations: [
      { type: 'resize', width: 1080, height: 1920, fit: 'cover' },
      { type: 'filter', name: 'trendy', intensity: 0.6 }
    ],
    tags: ['social', 'tiktok', 'vertical', 'video']
  },
  
  // Portrait Templates
  'professional-headshot': {
    id: 'professional-headshot',
    name: 'Professional Headshot',
    category: TemplateCategory.PORTRAIT,
    type: TemplateType.TRANSFORM,
    dimensions: { width: 1000, height: 1000 },
    description: 'Clean professional portrait enhancement',
    thumbnail: '/templates/professional-headshot.jpg',
    transformations: [
      { type: 'face-detect', enhance: true },
      { type: 'background-blur', intensity: 0.7 },
      { type: 'adjustment', brightness: 1.1, contrast: 1.05 },
      { type: 'skin-smooth', intensity: 0.4 },
      { type: 'eye-enhance', intensity: 0.5 }
    ],
    tags: ['portrait', 'professional', 'headshot', 'business']
  },
  
  'portrait-bokeh': {
    id: 'portrait-bokeh',
    name: 'Portrait with Bokeh',
    category: TemplateCategory.PORTRAIT,
    type: TemplateType.BACKGROUND_REPLACE,
    dimensions: { width: 1000, height: 1500 },
    description: 'Beautiful bokeh background effect',
    thumbnail: '/templates/portrait-bokeh.jpg',
    backgroundOptions: [
      '/backgrounds/bokeh-1.jpg',
      '/backgrounds/bokeh-2.jpg',
      '/backgrounds/bokeh-3.jpg',
      '/backgrounds/bokeh-4.jpg'
    ],
    transformations: [
      { type: 'subject-segmentation' },
      { type: 'background-replace', blur: 0.8 },
      { type: 'color-grade', preset: 'warm' }
    ],
    tags: ['portrait', 'bokeh', 'background', 'artistic']
  },
  
  'vintage-portrait': {
    id: 'vintage-portrait',
    name: 'Vintage Portrait',
    category: TemplateCategory.PORTRAIT,
    type: TemplateType.EFFECT,
    dimensions: { width: 1000, height: 1000 },
    description: 'Classic vintage film look',
    thumbnail: '/templates/vintage-portrait.jpg',
    transformations: [
      { type: 'filter', name: 'vintage', intensity: 0.8 },
      { type: 'grain', intensity: 0.3 },
      { type: 'vignette', intensity: 0.5 },
      { type: 'color-grade', preset: 'sepia' },
      { type: 'light-leak', intensity: 0.2 }
    ],
    tags: ['portrait', 'vintage', 'retro', 'film']
  },
  
  // Product Templates
  'product-white-bg': {
    id: 'product-white-bg',
    name: 'Product on White',
    category: TemplateCategory.PRODUCT,
    type: TemplateType.BACKGROUND_REPLACE,
    dimensions: { width: 1500, height: 1500 },
    description: 'Clean white background for e-commerce',
    thumbnail: '/templates/product-white-bg.jpg',
    transformations: [
      { type: 'subject-segmentation' },
      { type: 'background-remove' },
      { type: 'background-color', color: '#ffffff' },
      { type: 'shadow', type: 'drop', opacity: 0.3, blur: 20, offsetY: 10 },
      { type: 'adjustment', brightness: 1.1, contrast: 1.05 }
    ],
    tags: ['product', 'ecommerce', 'white', 'clean']
  },
  
  'product-lifestyle': {
    id: 'product-lifestyle',
    name: 'Product Lifestyle',
    category: TemplateCategory.PRODUCT,
    type: TemplateType.BACKGROUND_REPLACE,
    dimensions: { width: 1500, height: 1500 },
    description: 'Product in lifestyle setting',
    thumbnail: '/templates/product-lifestyle.jpg',
    backgroundOptions: [
      '/backgrounds/lifestyle-1.jpg',
      '/backgrounds/lifestyle-2.jpg',
      '/backgrounds/lifestyle-3.jpg',
      '/backgrounds/lifestyle-4.jpg'
    ],
    transformations: [
      { type: 'subject-segmentation' },
      { type: 'background-remove' },
      { type: 'background-replace', matchLighting: true },
      { type: 'color-match' },
      { type: 'shadow', type: 'contact', opacity: 0.4 }
    ],
    tags: ['product', 'lifestyle', 'background', 'ecommerce']
  },
  
  'product-showcase': {
    id: 'product-showcase',
    name: 'Product Showcase',
    category: TemplateCategory.PRODUCT,
    type: TemplateType.FRAME,
    dimensions: { width: 1500, height: 1500 },
    description: 'Elegant product presentation frame',
    thumbnail: '/templates/product-showcase.jpg',
    frameOverlay: '/overlays/showcase-frame.png',
    transformations: [
      { type: 'resize', width: 1200, height: 1200, fit: 'contain' },
      { type: 'center' },
      { type: 'overlay', src: '/overlays/showcase-frame.png', blend: 'normal' },
      { type: 'text', content: 'PREMIUM', position: 'bottom', style: 'elegant' }
    ],
    tags: ['product', 'showcase', 'premium', 'frame']
  },
  
  // Artistic Templates
  'cyberpunk-transform': {
    id: 'cyberpunk-transform',
    name: 'Cyberpunk Transform',
    category: TemplateCategory.ARTISTIC,
    type: TemplateType.TRANSFORM,
    dimensions: { width: 1000, height: 1000 },
    description: 'Futuristic cyberpunk aesthetic',
    thumbnail: '/templates/cyberpunk-transform.jpg',
    transformations: [
      { type: 'filter', name: 'cyberpunk', intensity: 0.9 },
      { type: 'color-grade', preset: 'neon' },
      { type: 'glow', color: '#00ffff', intensity: 0.5 },
      { type: 'chromatic-aberration', intensity: 0.3 },
      { type: 'scanlines', intensity: 0.2 }
    ],
    tags: ['artistic', 'cyberpunk', 'neon', 'futuristic']
  },
  
  'anime-style': {
    id: 'anime-style',
    name: 'Anime Style',
    category: TemplateCategory.ARTISTIC,
    type: TemplateType.TRANSFORM,
    dimensions: { width: 1000, height: 1000 },
    description: 'Transform to anime/manga style',
    thumbnail: '/templates/anime-style.jpg',
    transformations: [
      { type: 'style-transfer', style: 'anime', intensity: 0.8 },
      { type: 'edge-enhance', intensity: 0.5 },
      { type: 'color-simplify', levels: 8 },
      { type: 'eye-enlarge', intensity: 0.3 }
    ],
    tags: ['artistic', 'anime', 'manga', 'style-transfer']
  },
  
  'oil-painting': {
    id: 'oil-painting',
    name: 'Oil Painting',
    category: TemplateCategory.ARTISTIC,
    type: TemplateType.TRANSFORM,
    dimensions: { width: 1000, height: 1000 },
    description: 'Classic oil painting effect',
    thumbnail: '/templates/oil-painting.jpg',
    transformations: [
      { type: 'filter', name: 'oil-paint', intensity: 0.8 },
      { type: 'texture', src: '/textures/canvas.png', blend: 'overlay', opacity: 0.3 },
      { type: 'brush-stroke', intensity: 0.5 }
    ],
    tags: ['artistic', 'painting', 'oil', 'classic']
  },
  
  'double-exposure': {
    id: 'double-exposure',
    name: 'Double Exposure',
    category: TemplateCategory.ARTISTIC,
    type: TemplateType.TRANSFORM,
    dimensions: { width: 1000, height: 1500 },
    description: 'Artistic double exposure effect',
    thumbnail: '/templates/double-exposure.jpg',
    blendImageOptions: [
      '/overlays/nature-1.jpg',
      '/overlays/city-1.jpg',
      '/overlays/abstract-1.jpg'
    ],
    transformations: [
      { type: 'subject-segmentation' },
      { type: 'blend', mode: 'screen', opacity: 0.7 },
      { type: 'mask', type: 'silhouette' },
      { type: 'color-grade', preset: 'moody' }
    ],
    tags: ['artistic', 'double-exposure', 'creative', 'blend']
  },
  
  // Marketing Templates
  'sale-promo': {
    id: 'sale-promo',
    name: 'Sale Promotion',
    category: TemplateCategory.MARKETING,
    type: TemplateType.TEXT_LAYOUT,
    dimensions: { width: 1080, height: 1080 },
    description: 'Eye-catching sale promotion template',
    thumbnail: '/templates/sale-promo.jpg',
    transformations: [
      { type: 'resize', width: 1080, height: 1080, fit: 'cover' },
      { type: 'gradient-overlay', colors: ['#ef4444', '#f97316'], opacity: 0.8 },
      { type: 'text', content: 'SALE', position: 'center-top', style: 'bold-large' },
      { type: 'text', content: '50% OFF', position: 'center', style: 'price' },
      { type: 'badge', type: 'starburst', position: 'top-right' }
    ],
    tags: ['marketing', 'sale', 'promo', 'discount']
  },
  
  'quote-card': {
    id: 'quote-card',
    name: 'Quote Card',
    category: TemplateCategory.MARKETING,
    type: TemplateType.TEXT_LAYOUT,
    dimensions: { width: 1080, height: 1080 },
    description: 'Beautiful quote presentation',
    thumbnail: '/templates/quote-card.jpg',
    transformations: [
      { type: 'resize', width: 1080, height: 1080, fit: 'cover' },
      { type: 'overlay', color: '#000000', opacity: 0.5 },
      { type: 'text', content: 'Quote text here', position: 'center', style: 'quote' },
      { type: 'text', content: '- Author', position: 'bottom', style: 'attribution' },
      { type: 'decorative', type: 'quotes', position: 'corners' }
    ],
    tags: ['marketing', 'quote', 'text', 'social']
  },
  
  // Collage Templates
  'photo-collage-4': {
    id: 'photo-collage-4',
    name: '4-Photo Collage',
    category: TemplateCategory.SOCIAL_MEDIA,
    type: TemplateType.COLLAGE,
    dimensions: { width: 1080, height: 1080 },
    description: 'Grid layout for 4 photos',
    thumbnail: '/templates/photo-collage-4.jpg',
    layout: {
      type: 'grid',
      rows: 2,
      columns: 2,
      gap: 10,
      padding: 10
    },
    transformations: [
      { type: 'collage', layout: '2x2', gap: 10 },
      { type: 'border', color: '#ffffff', width: 10 },
      { type: 'shadow', type: 'drop', opacity: 0.3 }
    ],
    tags: ['collage', 'grid', 'multiple', 'photos']
  },
  
  'before-after': {
    id: 'before-after',
    name: 'Before/After',
    category: TemplateCategory.MARKETING,
    type: TemplateType.COLLAGE,
    dimensions: { width: 1500, height: 1000 },
    description: 'Side-by-side comparison',
    thumbnail: '/templates/before-after.jpg',
    layout: {
      type: 'split',
      direction: 'horizontal',
      label: true
    },
    transformations: [
      { type: 'split', direction: 'horizontal' },
      { type: 'label', left: 'BEFORE', right: 'AFTER' },
      { type: 'divider', style: 'line' }
    ],
    tags: ['comparison', 'before-after', 'split', 'transformation']
  }
};

/**
 * Apply template to image
 * @param {HTMLCanvasElement|HTMLImageElement} source - Source image
 * @param {string} templateId - Template ID
 * @param {Object} options - Additional options
 * @returns {Promise<HTMLCanvasElement>} - Transformed image
 */
export async function applyTemplate(source, templateId, options = {}) {
  const template = templates[templateId];
  
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  
  // Create working canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set dimensions
  canvas.width = template.dimensions.width;
  canvas.height = template.dimensions.height;
  
  // Apply each transformation
  for (const transform of template.transformations) {
    await applyTransformation(canvas, ctx, source, transform, options);
  }
  
  return canvas;
}

/**
 * Apply single transformation
 */
async function applyTransformation(canvas, ctx, source, transform, options) {
  switch (transform.type) {
    case 'resize':
      await applyResize(canvas, ctx, source, transform);
      break;
    case 'filter':
      await applyFilter(canvas, ctx, transform);
      break;
    case 'adjustment':
      await applyAdjustment(canvas, ctx, transform);
      break;
    case 'background-remove':
      await applyBackgroundRemove(canvas, ctx, source);
      break;
    case 'background-replace':
      await applyBackgroundReplace(canvas, ctx, source, transform, options);
      break;
    case 'background-color':
      await applyBackgroundColor(canvas, ctx, transform);
      break;
    case 'overlay':
      await applyOverlay(canvas, ctx, transform);
      break;
    case 'text':
      await applyText(canvas, ctx, transform);
      break;
    case 'shadow':
      await applyShadow(canvas, ctx, transform);
      break;
    case 'gradient-overlay':
      await applyGradientOverlay(canvas, ctx, transform);
      break;
    case 'vignette':
      await applyVignette(canvas, ctx, transform);
      break;
    case 'collage':
      await applyCollage(canvas, ctx, source, transform, options);
      break;
    default:
      console.warn(`Unknown transformation type: ${transform.type}`);
  }
}

// Transformation implementations
async function applyResize(canvas, ctx, source, transform) {
  const { width, height, fit = 'cover' } = transform;
  
  let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
  
  if (fit === 'cover') {
    const sourceRatio = source.width / source.height;
    const targetRatio = width / height;
    
    if (sourceRatio > targetRatio) {
      drawHeight = height;
      drawWidth = source.width * (height / source.height);
      offsetX = (width - drawWidth) / 2;
    } else {
      drawWidth = width;
      drawHeight = source.height * (width / source.width);
      offsetY = (height - drawHeight) / 2;
    }
  } else if (fit === 'contain') {
    const sourceRatio = source.width / source.height;
    const targetRatio = width / height;
    
    if (sourceRatio > targetRatio) {
      drawWidth = width;
      drawHeight = source.height * (width / source.width);
      offsetY = (height - drawHeight) / 2;
    } else {
      drawHeight = height;
      drawWidth = source.width * (height / source.height);
      offsetX = (width - drawWidth) / 2;
    }
  } else {
    drawWidth = width;
    drawHeight = height;
  }
  
  ctx.drawImage(source, offsetX, offsetY, drawWidth, drawHeight);
}

async function applyFilter(canvas, ctx, transform) {
  const { name, intensity = 1 } = transform;
  
  // Apply CSS-like filters
  const filters = {
    vibrant: `contrast(1.1) saturate(1.3) brightness(1.05)`,
    dramatic: `contrast(1.3) saturate(0.9) brightness(0.95)`,
    vintage: `sepia(0.4) contrast(1.1) saturate(0.8)`,
    cyberpunk: `saturate(1.5) contrast(1.2) hue-rotate(10deg)`,
    'oil-paint': `contrast(1.1) saturate(1.2)`
  };
  
  const filter = filters[name] || '';
  ctx.filter = filter;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';
}

async function applyAdjustment(canvas, ctx, transform) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const {
    brightness = 1,
    contrast = 1,
    saturation = 1,
    hue = 0
  } = transform;
  
  const contrastFactor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
  
  for (let i = 0; i < data.length; i += 4) {
    // Brightness
    data[i] *= brightness;
    data[i + 1] *= brightness;
    data[i + 2] *= brightness;
    
    // Contrast
    data[i] = contrastFactor * (data[i] - 128) + 128;
    data[i + 1] = contrastFactor * (data[i + 1] - 128) + 128;
    data[i + 2] = contrastFactor * (data[i + 2] - 128) + 128;
    
    // Saturation
    const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray + (data[i] - gray) * saturation;
    data[i + 1] = gray + (data[i + 1] - gray) * saturation;
    data[i + 2] = gray + (data[i + 2] - gray) * saturation;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

async function applyBackgroundColor(canvas, ctx, transform) {
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = transform.color || '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over';
}

async function applyGradientOverlay(canvas, ctx, transform) {
  const { colors = ['#6366f1', '#8b5cf6'], opacity = 0.5, direction = 'diagonal' } = transform;
  
  const gradient = ctx.createLinearGradient(
    direction === 'diagonal' ? 0 : 0,
    direction === 'diagonal' ? 0 : canvas.height,
    direction === 'diagonal' ? canvas.width : 0,
    direction === 'diagonal' ? canvas.height : 0
  );
  
  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });
  
  ctx.globalAlpha = opacity;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
}

async function applyVignette(canvas, ctx, transform) {
  const { intensity = 0.5, color = '#000000' } = transform;
  
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.3,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.7
  );
  
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, color);
  
  ctx.globalAlpha = intensity;
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
}

async function applyOverlay(canvas, ctx, transform) {
  if (transform.src) {
    const overlay = await loadImage(transform.src);
    ctx.globalAlpha = transform.opacity || 1;
    ctx.globalCompositeOperation = transform.blend || 'normal';
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  } else if (transform.color) {
    ctx.globalAlpha = transform.opacity || 0.5;
    ctx.fillStyle = transform.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
}

async function applyText(canvas, ctx, transform) {
  const {
    content = '',
    position = 'center',
    style = 'default',
    color = '#ffffff',
    fontSize = 48,
    fontFamily = 'Arial'
  } = transform;
  
  ctx.fillStyle = color;
  ctx.font = `${style === 'bold-large' ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let x = canvas.width / 2;
  let y = canvas.height / 2;
  
  switch (position) {
    case 'center-top':
      y = canvas.height * 0.2;
      break;
    case 'center-bottom':
      y = canvas.height * 0.8;
      break;
    case 'top-left':
      x = canvas.width * 0.1;
      y = canvas.height * 0.1;
      ctx.textAlign = 'left';
      break;
    case 'top-right':
      x = canvas.width * 0.9;
      y = canvas.height * 0.1;
      ctx.textAlign = 'right';
      break;
  }
  
  ctx.fillText(content, x, y);
}

async function applyShadow(canvas, ctx, transform) {
  // Shadow is typically applied during other operations
  // This is a placeholder for more complex shadow implementations
}

async function applyCollage(canvas, ctx, source, transform, options) {
  const { images = [source], layout = '2x2', gap = 10 } = transform;
  
  // Simple grid collage
  const cols = 2;
  const rows = 2;
  const cellWidth = (canvas.width - gap * (cols + 1)) / cols;
  const cellHeight = (canvas.height - gap * (rows + 1)) / rows;
  
  images.forEach((img, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = gap + col * (cellWidth + gap);
    const y = gap + row * (cellHeight + gap);
    
    ctx.drawImage(img, x, y, cellWidth, cellHeight);
  });
}

async function applyBackgroundRemove(canvas, ctx, source) {
  // Would use actual background removal AI
  // This is a placeholder
  console.log('Background removal would be applied here');
}

async function applyBackgroundReplace(canvas, ctx, source, transform, options) {
  const { background } = options;
  
  if (background) {
    const bgImage = await loadImage(background);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  }
}

// Helper function
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Get template by ID
 */
export function getTemplate(templateId) {
  return templates[templateId];
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category) {
  return Object.values(templates).filter(t => t.category === category);
}

/**
 * Search templates
 */
export function searchTemplates(query) {
  const lowerQuery = query.toLowerCase();
  return Object.values(templates).filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get all categories
 */
export function getCategories() {
  return Object.values(TemplateCategory);
}

export default {
  templates,
  applyTemplate,
  getTemplate,
  getTemplatesByCategory,
  searchTemplates,
  getCategories,
  TemplateCategory,
  TemplateType
};
