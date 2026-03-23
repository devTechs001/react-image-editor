// backend/src/controllers/projectController.js
const Project = require('../models/Project');
const {
  AppError
} = require('../middleware/errorHandler');
const crypto = require('crypto');

// Get all projects
exports.getProjects = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-updatedAt',
      type,
      status = 'active',
      search
    } = req.query;
    const query = {
      user: req.user._id,
      status
    };
    if (type) {
      query.type = type;
    }
    if (search) {
      query.$text = {
        $search: search
      };
    }
    const projects = await Project.find(query).sort(sort).skip((page - 1) * limit).limit(parseInt(limit)).select('-layers -history');
    const total = await Project.countDocuments(query);
    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single project
exports.getProject = async (req, res, next) => {
  try {
    const project = req.resource;
    res.json({
      success: true,
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create project
exports.createProject = async (req, res, next) => {
  try {
    const {
      name,
      type,
      canvas,
      description,
      template
    } = req.body;
    let projectData = {
      user: req.user._id,
      name,
      type,
      canvas,
      description
    };

    // If creating from template
    if (template) {
      const Template = require('../models/Template');
      const templateDoc = await Template.findById(template);
      if (templateDoc) {
        projectData.layers = templateDoc.layers;
        projectData.canvas = templateDoc.canvas;
        await templateDoc.incrementUses();
      }
    }
    const project = await Project.create(projectData);
    res.status(201).json({
      success: true,
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update project
exports.updateProject = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'description', 'canvas', 'layers', 'adjustments', 'filters', 'settings', 'tags', 'thumbnail'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    res.json({
      success: true,
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, {
      status: 'deleted'
    });
    res.json({
      success: true,
      message: 'Project deleted'
    });
  } catch (error) {
    next(error);
  }
};

// Duplicate project
exports.duplicateProject = async (req, res, next) => {
  try {
    const original = req.resource.toObject();
    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;
    original.name = `${original.name} (Copy)`;
    original.sharing = {
      isPublic: false
    };
    original.collaborators = [];
    const duplicate = await Project.create(original);
    res.status(201).json({
      success: true,
      data: {
        project: duplicate
      }
    });
  } catch (error) {
    next(error);
  }
};

// Share project
exports.shareProject = async (req, res, next) => {
  try {
    const {
      isPublic,
      password,
      expiresIn
    } = req.body;
    const project = req.resource;
    if (isPublic) {
      project.sharing.isPublic = true;
      project.sharing.shareLink = project.generateShareLink();
      if (password) {
        project.sharing.sharePassword = password;
      }
      if (expiresIn) {
        project.sharing.expiresAt = new Date(Date.now() + expiresIn * 1000);
      }
    } else {
      project.sharing = {
        isPublic: false
      };
    }
    await project.save();
    res.json({
      success: true,
      data: {
        shareLink: project.sharing.shareLink ? `${process.env.FRONTEND_URL}/shared/${project.sharing.shareLink}` : null,
        isPublic: project.sharing.isPublic
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get shared project
exports.getSharedProject = async (req, res, next) => {
  try {
    const {
      shareLink
    } = req.params;
    const {
      password
    } = req.query;
    const project = await Project.findOne({
      'sharing.shareLink': shareLink,
      'sharing.isPublic': true
    }).select('-layers.data');
    if (!project) {
      return next(new AppError('Project not found or no longer shared', 404));
    }

    // Check expiry
    if (project.sharing.expiresAt && new Date() > project.sharing.expiresAt) {
      return next(new AppError('Share link has expired', 403));
    }

    // Check password
    if (project.sharing.sharePassword && project.sharing.sharePassword !== password) {
      return next(new AppError('Invalid password', 403));
    }
    res.json({
      success: true,
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update layers
exports.updateLayers = async (req, res, next) => {
  try {
    const {
      layers
    } = req.body;
    const project = req.resource;
    project.layers = layers;
    project.addToHistory('layers_update', {
      layerCount: layers.length
    });
    await project.save();
    res.json({
      success: true,
      data: {
        layers: project.layers
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update adjustments
exports.updateAdjustments = async (req, res, next) => {
  try {
    const {
      adjustments
    } = req.body;
    const project = req.resource;
    project.adjustments = {
      ...project.adjustments,
      ...adjustments
    };
    project.addToHistory('adjustments_update', adjustments);
    await project.save();
    res.json({
      success: true,
      data: {
        adjustments: project.adjustments
      }
    });
  } catch (error) {
    next(error);
  }
};

// Auto-save
exports.autoSave = async (req, res, next) => {
  try {
    const updates = req.body;
    await Project.findByIdAndUpdate(req.params.id, {
      ...updates,
      lastEditedAt: new Date()
    });
    res.json({
      success: true,
      message: 'Auto-saved'
    });
  } catch (error) {
    next(error);
  }
};

// Add collaborator
exports.addCollaborator = async (req, res, next) => {
  try {
    const {
      email,
      role
    } = req.body;
    const project = req.resource;
    const User = require('../models/User');
    const user = await User.findOne({
      email
    });
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    if (user._id.toString() === req.user._id.toString()) {
      return next(new AppError('Cannot add yourself as collaborator', 400));
    }
    const existingCollab = project.collaborators.find(c => c.user.toString() === user._id.toString());
    if (existingCollab) {
      existingCollab.role = role;
    } else {
      project.collaborators.push({
        user: user._id,
        role
      });
    }
    await project.save();
    res.json({
      success: true,
      data: {
        collaborators: project.collaborators
      }
    });
  } catch (error) {
    next(error);
  }
};

// Remove collaborator
exports.removeCollaborator = async (req, res, next) => {
  try {
    const {
      userId
    } = req.params;
    const project = req.resource;
    project.collaborators = project.collaborators.filter(c => c.user.toString() !== userId);
    await project.save();
    res.json({
      success: true,
      data: {
        collaborators: project.collaborators
      }
    });
  } catch (error) {
    next(error);
  }
};