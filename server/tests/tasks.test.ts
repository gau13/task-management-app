import { describe, it, expect } from 'vitest';
import { request, app, createTestUser, authRequest } from './helpers.js';
import { Task } from '../src/models/Task.js';

describe('Tasks', () => {
  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const { token } = await createTestUser();

      const res = await authRequest(token)
        .post('/api/tasks')
        .send({
          title: 'Test Task',
          description: 'Test description',
          status: 'TODO',
          priority: 'HIGH',
          dueDate: '2026-08-20',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Task');
      expect(res.body.data.owner).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should get paginated tasks', async () => {
      const { user, token } = await createTestUser();

      await Task.create([
        { title: 'Task 1', owner: user._id, status: 'TODO', priority: 'LOW' },
        { title: 'Task 2', owner: user._id, status: 'IN_PROGRESS', priority: 'MEDIUM' },
        { title: 'Task 3', owner: user._id, status: 'COMPLETED', priority: 'HIGH' },
      ]);

      const res = await authRequest(token).get('/api/tasks?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination.total).toBe(3);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    it('should filter by status', async () => {
      const { user, token } = await createTestUser();

      await Task.create([
        { title: 'Todo Task', owner: user._id, status: 'TODO', priority: 'LOW' },
        { title: 'Done Task', owner: user._id, status: 'COMPLETED', priority: 'LOW' },
      ]);

      const res = await authRequest(token).get('/api/tasks?status=TODO');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe('TODO');
    });

    it('should filter by priority', async () => {
      const { user, token } = await createTestUser();

      await Task.create([
        { title: 'High Task', owner: user._id, status: 'TODO', priority: 'HIGH' },
        { title: 'Low Task', owner: user._id, status: 'TODO', priority: 'LOW' },
      ]);

      const res = await authRequest(token).get('/api/tasks?priority=HIGH');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].priority).toBe('HIGH');
    });

    it('should search tasks', async () => {
      const { user, token } = await createTestUser();

      await Task.create([
        { title: 'React project', description: 'Build app', owner: user._id, status: 'TODO', priority: 'LOW' },
        { title: 'Other task', description: 'Something else', owner: user._id, status: 'TODO', priority: 'LOW' },
      ]);

      const res = await authRequest(token).get('/api/tasks?search=react');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('React project');
    });

    it('should sort tasks', async () => {
      const { user, token } = await createTestUser();

      await Task.create([
        { title: 'B Task', owner: user._id, status: 'TODO', priority: 'LOW' },
        { title: 'A Task', owner: user._id, status: 'TODO', priority: 'LOW' },
      ]);

      const res = await authRequest(token).get('/api/tasks?sortBy=title&sortOrder=asc');

      expect(res.status).toBe(200);
      expect(res.body.data[0].title).toBe('A Task');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a single task', async () => {
      const { user, token } = await createTestUser();
      const task = await Task.create({
        title: 'Single Task',
        owner: user._id,
        status: 'TODO',
        priority: 'MEDIUM',
      });

      const res = await authRequest(token).get(`/api/tasks/${task._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Single Task');
    });

    it('should return 404 for non-existent task', async () => {
      const { token } = await createTestUser();

      const res = await authRequest(token).get('/api/tasks/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update a task', async () => {
      const { user, token } = await createTestUser();
      const task = await Task.create({
        title: 'Original',
        owner: user._id,
        status: 'TODO',
        priority: 'LOW',
      });

      const res = await authRequest(token)
        .patch(`/api/tasks/${task._id}`)
        .send({ title: 'Updated', status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('should set completedAt when status is COMPLETED', async () => {
      const { user, token } = await createTestUser();
      const task = await Task.create({
        title: 'To Complete',
        owner: user._id,
        status: 'TODO',
        priority: 'LOW',
      });

      const res = await authRequest(token)
        .patch(`/api/tasks/${task._id}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(200);
      expect(res.body.data.completedAt).toBeDefined();
    });

    it('should clear completedAt when status changes from COMPLETED', async () => {
      const { user, token } = await createTestUser();
      const task = await Task.create({
        title: 'Completed Task',
        owner: user._id,
        status: 'COMPLETED',
        priority: 'LOW',
        completedAt: new Date(),
      });

      const res = await authRequest(token)
        .patch(`/api/tasks/${task._id}`)
        .send({ status: 'TODO' });

      expect(res.status).toBe(200);
      expect(res.body.data.completedAt).toBeNull();
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const { user, token } = await createTestUser();
      const task = await Task.create({
        title: 'To Delete',
        owner: user._id,
        status: 'TODO',
        priority: 'LOW',
      });

      const res = await authRequest(token).delete(`/api/tasks/${task._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Task.findById(task._id);
      expect(deleted).toBeNull();
    });
  });
});

describe('Authorization', () => {
  it('User A cannot access User B task', async () => {
    const { user: userA, token: tokenA } = await createTestUser({ email: 'usera@test.com' });
    const { user: userB } = await createTestUser({ email: 'userb@test.com' });

    const task = await Task.create({
      title: 'User B Task',
      owner: userB._id,
      status: 'TODO',
      priority: 'LOW',
    });

    const res = await authRequest(tokenA).get(`/api/tasks/${task._id}`);
    expect(res.status).toBe(404);
  });

  it('User A cannot modify User B task', async () => {
    const { token: tokenA } = await createTestUser({ email: 'usera2@test.com' });
    const { user: userB } = await createTestUser({ email: 'userb2@test.com' });

    const task = await Task.create({
      title: 'User B Task',
      owner: userB._id,
      status: 'TODO',
      priority: 'LOW',
    });

    const res = await authRequest(tokenA)
      .patch(`/api/tasks/${task._id}`)
      .send({ title: 'Hacked' });

    expect(res.status).toBe(404);
  });

  it('User A cannot delete User B task', async () => {
    const { token: tokenA } = await createTestUser({ email: 'usera3@test.com' });
    const { user: userB } = await createTestUser({ email: 'userb3@test.com' });

    const task = await Task.create({
      title: 'User B Task',
      owner: userB._id,
      status: 'TODO',
      priority: 'LOW',
    });

    const res = await authRequest(tokenA).delete(`/api/tasks/${task._id}`);
    expect(res.status).toBe(404);
  });

  it('User cannot manipulate task ownership via create', async () => {
    const { user, token } = await createTestUser();
    const { user: otherUser } = await createTestUser({ email: 'other@test.com' });

    const res = await authRequest(token)
      .post('/api/tasks')
      .send({
        title: 'Task with fake owner',
        owner: otherUser._id.toString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.data.owner.toString()).toBe(user._id.toString());
  });
});
