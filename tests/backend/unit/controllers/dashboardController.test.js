const request = require('supertest');
const mongoose = require('mongoose');
const { app, httpServer } = require('../../../../backend/src/app');
const User = require('../../../../backend/src/models/User');
const Project = require('../../../../backend/src/models/Project');
const Asset = require('../../../../backend/src/models/Asset');

describe('Dashboard Controller', () => {
  let authToken;
  let adminToken;
  let testUser;
  let adminUser;

  beforeAll(async () => {
    // Database connection is handled in tests/setup.js
  });

  afterAll(async () => {
    // Database cleanup is handled in tests/setup.js
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Asset.deleteMany({});

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
      plan: 'pro',
      role: 'user',
      credits: {
        ai: 100,
        storage: 1024 * 1024 * 1000,
        exports: 50
      }
    });

    // Create admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123',
      plan: 'enterprise',
      role: 'admin'
    });

    authToken = testUser.generateAccessToken();
    adminToken = adminUser.generateAccessToken();
  });

  describe('GET /api/v1/dashboard', () => {
    it('should return user dashboard with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('test@example.com');
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.quickActions).toBeDefined();
      expect(Array.isArray(res.body.data.quickActions)).toBe(true);
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard');

      expect(res.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('should return correct stats for user', async () => {
      // Create some test projects
      await Project.create([
        {
          user: testUser._id,
          name: 'Project 1',
          type: 'image',
          status: 'active'
        },
        {
          user: testUser._id,
          name: 'Project 2',
          type: 'video',
          status: 'completed'
        }
      ]);

      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.stats.totalProjects).toBe(2);
      expect(res.body.data.stats.activeProjects).toBe(1);
    });

    it('should include recent projects', async () => {
      await Project.create({
        user: testUser._id,
        name: 'Recent Project',
        type: 'image',
        status: 'active'
      });

      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.recentProjects)).toBe(true);
      expect(res.body.data.recentProjects.length).toBeGreaterThan(0);
    });

    it('should return quick actions based on user plan', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      
      const quickActions = res.body.data.quickActions;
      const actionIds = quickActions.map(a => a.id);
      
      expect(actionIds).toContain('new-project');
      expect(actionIds).toContain('upload-asset');
      expect(actionIds).toContain('browse-templates');
      
      // Pro user should have AI generate action
      expect(actionIds).toContain('ai-generate');
    });
  });

  describe('GET /api/v1/dashboard/admin', () => {
    it('should return admin dashboard with valid admin token', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.projects).toBeDefined();
      expect(res.body.data.assets).toBeDefined();
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/admin');

      expect(res.status).toBe(401);
    });

    it('should fail for non-admin user', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });

    it('should return correct user counts', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.total).toBe(2); // testUser + adminUser
    });
  });
});
