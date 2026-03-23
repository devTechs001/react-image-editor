// backend/src/utils/validation.js
const Joi = require('joi');

// Common validation schemas
const schemas = {
  // ID validation
  objectId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid ID format'
  }),
  // Email validation
  email: Joi.string().email().lowercase().trim().messages({
    'string.email': 'Please provide a valid email address'
  }),
  // Password validation
  password: Joi.string().min(8).max(128).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  }),
  // Name validation
  name: Joi.string().trim().min(1).max(100).messages({
    'string.min': 'Name is required',
    'string.max': 'Name cannot exceed 100 characters'
  }),
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('-createdAt')
  }),
  // Image dimensions
  dimensions: Joi.object({
    width: Joi.number().integer().min(1).max(10000).required(),
    height: Joi.number().integer().min(1).max(10000).required()
  }),
  // Color (hex)
  hexColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).messages({
    'string.pattern.base': 'Invalid hex color format'
  }),
  // URL validation
  url: Joi.string().uri().messages({
    'string.uri': 'Invalid URL format'
  })
};

// Validate function
const validate = (data, schema) => {
  const {
    error,
    value
  } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return {
      isValid: false,
      errors,
      value: null
    };
  }
  return {
    isValid: true,
    errors: null,
    value
  };
};
module.exports = {
  schemas,
  validate,
  Joi
};