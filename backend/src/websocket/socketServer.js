// backend/src/websocket/socketServer.js
const jwt = require('jsonwebtoken');
const config = require('../config/app');
const User = require('../models/User');
const logger = require('../utils/logger');

const connectedUsers = new Map();

const initializeSocketServer = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`User connected: ${userId}`);

    // Add to connected users
    connectedUsers.set(userId, socket.id);

    // Join user's room
    socket.join(`user:${userId}`);

    // Handle project room joining
    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
      logger.info(`User ${userId} joined project ${projectId}`);
      
      // Notify others in the room
      socket.to(`project:${projectId}`).emit('user:joined', {
        userId,
        name: socket.user.name,
        avatar: socket.user.avatar
      });
    });

    // Handle project room leaving
    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
      logger.info(`User ${userId} left project ${projectId}`);
      
      socket.to(`project:${projectId}`).emit('user:left', { userId });
    });

    // Handle real-time collaboration updates
    socket.on('project:update', (data) => {
      const { projectId, update, type } = data;
      
      // Broadcast to other users in the project
      socket.to(`project:${projectId}`).emit('project:updated', {
        userId,
        type,
        update,
        timestamp: Date.now()
      });
    });

    // Handle cursor position updates (for collaboration)
    socket.on('cursor:move', (data) => {
      const { projectId, position } = data;
      
      socket.to(`project:${projectId}`).emit('cursor:moved', {
        userId,
        name: socket.user.name,
        position
      });
    });

    // Handle selection updates
    socket.on('selection:change', (data) => {
      const { projectId, selection } = data;
      
      socket.to(`project:${projectId}`).emit('selection:changed', {
        userId,
        selection
      });
    });

    // Handle chat messages
    socket.on('chat:message', (data) => {
      const { projectId, message } = data;
      
      io.to(`project:${projectId}`).emit('chat:received', {
        userId,
        name: socket.user.name,
        avatar: socket.user.avatar,
        message,
        timestamp: Date.now()
      });
    });

    // Handle typing indicators
    socket.on('typing:start', (data) => {
      socket.to(`project:${data.projectId}`).emit('user:typing', {
        userId,
        name: socket.user.name
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`project:${data.projectId}`).emit('user:stopped_typing', { userId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      logger.info(`User disconnected: ${userId}`);
      
      // Notify all rooms the user was in
      socket.rooms.forEach(room => {
        if (room.startsWith('project:')) {
          socket.to(room).emit('user:left', { userId });
        }
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${userId}:`, error);
    });
  });

  // Utility function to emit to specific user
  io.emitToUser = (userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
  };

  // Utility function to emit to project room
  io.emitToProject = (projectId, event, data) => {
    io.to(`project:${projectId}`).emit(event, data);
  };

  logger.info('WebSocket server initialized');
};

module.exports = {
  initializeSocketServer,
  connectedUsers
};