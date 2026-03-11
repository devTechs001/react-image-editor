// backend/src/controllers/templateController.js
const Template = require('../models/Template');
const { AppError } = require('../middleware/errorHandler');

// Get all templates
exports.getTemplates = async (req, res, next) => {
  try {
    const { category, type, search, page = 1, limit = 20 } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }

    const templates = await Template.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Template.countDocuments(query);

    res.json({
      success: true,
      data: {
        templates,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get template by ID
exports.getTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return next(new AppError('Template not found', 404));
    }

    // Increment uses count
    template.uses += 1;
    await template.save();

    res.json({
      success: true,
      data: { template }
    });
  } catch (error) {
    next(error);
  }
};

// Create template
exports.createTemplate = async (req, res, next) => {
  try {
    const templateData = {
      ...req.body,
      user: req.user._id
    };

    const template = await Template.create(templateData);

    res.status(201).json({
      success: true,
      data: { template }
    });
  } catch (error) {
    next(error);
  }
};

// Update template
exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return next(new AppError('Template not found', 404));
    }

    // Check ownership or admin
    if (template.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to update this template', 403));
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: { template: updatedTemplate }
    });
  } catch (error) {
    next(error);
  }
};

// Delete template
exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return next(new AppError('Template not found', 404));
    }

    // Check ownership or admin
    if (template.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to delete this template', 403));
    }

    await template.deleteOne();

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get template categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Template.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

// Get featured templates
exports.getFeatured = async (req, res, next) => {
  try {
    const templates = await Template.find({ featured: true })
      .sort({ uses: -1 })
      .limit(10);

    res.json({
      success: true,
      data: { templates }
    });
  } catch (error) {
    next(error);
  }
};

// Get trending templates
exports.getTrending = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const templates = await Template.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
      .sort({ uses: -1 })
      .limit(10);

    res.json({
      success: true,
      data: { templates }
    });
  } catch (error) {
    next(error);
  }
};
