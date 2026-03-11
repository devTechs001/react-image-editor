// backend/src/middleware/authorize.js
const { AppError } = require('./errorHandler');

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

// Plan-based authorization
const requirePlan = (...plans) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!plans.includes(req.user.plan)) {
      return next(new AppError('This feature requires a higher plan. Please upgrade.', 403));
    }

    next();
  };
};

// Credit check
const requireCredits = (type, amount = 1) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!req.user.hasCredits(type, amount)) {
      return next(new AppError(`Insufficient ${type} credits. Please upgrade or purchase more.`, 403));
    }

    next();
  };
};

// Resource ownership
const ownsResource = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${model}`);
      const resource = await Model.findById(req.params[paramName]);

      if (!resource) {
        return next(new AppError(`${model} not found.`, 404));
      }

      // Admin can access any resource
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check ownership
      const ownerId = resource.user?.toString() || resource.owner?.toString();
      if (ownerId !== req.user._id.toString()) {
        return next(new AppError('You do not have permission to access this resource.', 403));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authorize, requirePlan, requireCredits, ownsResource };