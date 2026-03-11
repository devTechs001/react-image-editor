// frontend/src/utils/constants/constants.js

// Application constants
export const APP_NAME = 'AI Media Editor';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'Professional AI-powered media editing platform';

// Routes
export const ROUTES = {
  HOME: '/',
  EDITOR: '/editor',
  PROJECTS: '/projects',
  TEMPLATES: '/templates',
  ASSETS: '/assets',
  PRICING: '/pricing',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP: '/help',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email'
};

// Editor defaults
export const EDITOR_DEFAULTS = {
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,
  CANVAS_BG_COLOR: '#ffffff',
  ZOOM_MIN: 0.1,
  ZOOM_MAX: 10,
  ZOOM_STEP: 0.1,
  DEFAULT_ZOOM: 1
};

// Canvas presets
export const CANVAS_PRESETS = [
  { name: 'Custom', width: 0, height: 0 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'LinkedIn Post', width: 1200, height: 627 },
  { name: 'Pinterest Pin', width: 1000, height: 1500 },
  { name: 'TikTok Video', width: 1080, height: 1920 },
  { name: 'HD Video', width: 1920, height: 1080 },
  { name: '4K Video', width: 3840, height: 2160 },
  { name: 'Letter', width: 2550, height: 3300 },
  { name: 'A4', width: 2480, height: 3508 }
];

// Tool types
export const TOOLS = {
  SELECT: 'select',
  MOVE: 'move',
  BRUSH: 'brush',
  ERASER: 'eraser',
  FILL: 'fill',
  TEXT: 'text',
  SHAPE: 'shape',
  CROP: 'crop',
  ROTATE: 'rotate',
  ZOOM: 'zoom',
  HAND: 'hand',
  MAGIC_WAND: 'magic-wand',
  CLONE: 'clone',
  HEAL: 'heal',
  BLUR: 'blur',
  SHARPEN: 'sharpen',
  DODGE: 'dodge',
  BURN: 'burn'
};

// Shape types
export const SHAPES = {
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  TRIANGLE: 'triangle',
  POLYGON: 'polygon',
  LINE: 'line',
  ARROW: 'arrow',
  STAR: 'star',
  HEART: 'heart'
};

// Blend modes
export const BLEND_MODES = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' }
];

// Export formats
export const EXPORT_FORMATS = {
  IMAGE: [
    { value: 'png', label: 'PNG', extension: '.png', mimeType: 'image/png' },
    { value: 'jpeg', label: 'JPEG', extension: '.jpg', mimeType: 'image/jpeg' },
    { value: 'webp', label: 'WebP', extension: '.webp', mimeType: 'image/webp' },
    { value: 'gif', label: 'GIF', extension: '.gif', mimeType: 'image/gif' },
    { value: 'tiff', label: 'TIFF', extension: '.tiff', mimeType: 'image/tiff' }
  ],
  VIDEO: [
    { value: 'mp4', label: 'MP4', extension: '.mp4', mimeType: 'video/mp4' },
    { value: 'webm', label: 'WebM', extension: '.webm', mimeType: 'video/webm' },
    { value: 'gif', label: 'GIF', extension: '.gif', mimeType: 'image/gif' }
  ]
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  UNDO: { key: 'z', modifiers: ['ctrl', 'meta'], label: 'Undo' },
  REDO: { key: 'z', modifiers: ['ctrl', 'meta', 'shift'], label: 'Redo' },
  SAVE: { key: 's', modifiers: ['ctrl', 'meta'], label: 'Save' },
  EXPORT: { key: 'e', modifiers: ['ctrl', 'meta', 'shift'], label: 'Export' },
  COPY: { key: 'c', modifiers: ['ctrl', 'meta'], label: 'Copy' },
  PASTE: { key: 'v', modifiers: ['ctrl', 'meta'], label: 'Paste' },
  CUT: { key: 'x', modifiers: ['ctrl', 'meta'], label: 'Cut' },
  SELECT_ALL: { key: 'a', modifiers: ['ctrl', 'meta'], label: 'Select All' },
  DELETE: { key: 'delete', modifiers: [], label: 'Delete' },
  ZOOM_IN: { key: '+', modifiers: ['ctrl', 'meta'], label: 'Zoom In' },
  ZOOM_OUT: { key: '-', modifiers: ['ctrl', 'meta'], label: 'Zoom Out' },
  RESET_ZOOM: { key: '0', modifiers: ['ctrl', 'meta'], label: 'Reset Zoom' },
  FIT_TO_SCREEN: { key: '1', modifiers: ['ctrl', 'meta'], label: 'Fit to Screen' },
  BRUSH: { key: 'b', modifiers: [], label: 'Brush Tool' },
  ERASER: { key: 'e', modifiers: [], label: 'Eraser Tool' },
  TEXT: { key: 't', modifiers: [], label: 'Text Tool' },
  SHAPE: { key: 'u', modifiers: [], label: 'Shape Tool' },
  MOVE: { key: 'v', modifiers: [], label: 'Move Tool' },
  ZOOM: { key: 'z', modifiers: [], label: 'Zoom Tool' },
  HAND: { key: 'h', modifiers: [], label: 'Hand Tool' },
  TOGGLE_SIDEBAR: { key: '\\', modifiers: ['ctrl', 'meta'], label: 'Toggle Sidebar' }
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
  PREFERENCES: 'user_preferences',
  RECENT_PROJECTS: 'recent_projects',
  CUSTOM_PRESETS: 'custom_presets',
  SHORTCUTS: 'custom_shortcuts'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/v1/auth',
  USERS: '/api/v1/users',
  PROJECTS: '/api/v1/projects',
  IMAGES: '/api/v1/images',
  VIDEOS: '/api/v1/videos',
  AUDIO: '/api/v1/audio',
  AI: '/api/v1/ai',
  TEMPLATES: '/api/v1/templates',
  ASSETS: '/api/v1/assets',
  EXPORT: '/api/v1/export',
  STORAGE: '/api/v1/storage',
  DASHBOARD: '/api/v1/dashboard'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed size.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload a supported format.',
  CREDIT_EXCEEDED: 'You have exceeded your credit limit. Please upgrade your plan.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROJECT_SAVED: 'Project saved successfully!',
  PROJECT_EXPORTED: 'Export completed successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  ASSET_UPLOADED: 'Asset uploaded successfully!'
};

// Plan features
export const PLAN_FEATURES = {
  FREE: {
    name: 'Free',
    price: 0,
    aiCredits: 10,
    storageGB: 0.5,
    exportsPerMonth: 10,
    maxResolution: '1920x1080',
    watermark: true
  },
  STARTER: {
    name: 'Starter',
    price: 9,
    aiCredits: 50,
    storageGB: 5,
    exportsPerMonth: 50,
    maxResolution: '4K',
    watermark: false
  },
  PRO: {
    name: 'Pro',
    price: 29,
    aiCredits: 500,
    storageGB: 50,
    exportsPerMonth: 500,
    maxResolution: '8K',
    watermark: false
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 99,
    aiCredits: 2000,
    storageGB: 500,
    exportsPerMonth: -1,
    maxResolution: 'Unlimited',
    watermark: false
  }
};

export default {
  APP_NAME,
  APP_VERSION,
  ROUTES,
  EDITOR_DEFAULTS,
  CANVAS_PRESETS,
  TOOLS,
  SHAPES,
  BLEND_MODES,
  EXPORT_FORMATS,
  KEYBOARD_SHORTCUTS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PLAN_FEATURES
};
