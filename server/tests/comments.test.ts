import { describe, it, expect } from 'vitest';
import { createTestUser, authRequest } from './helpers.js';
import { Task } from '../src/models/Task.js';
import { Comment } from '../src/models/Comment.js';

describe('Comments', () => {
  it('should add a comment', async () => {
    const { user, token } = await createTestUser();
    const task = await Task.create({
      title: 'Task with comments',
      owner: user._id,
      status: 'TODO',
      priority: 'LOW',
    });

    const res = await authRequest(token)
      .post(`/api/tasks/${task._id}/comments`)
      .send({ content: 'This is a comment' });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('This is a comment');
  });

  it('should get comments for a task', async () => {
    const { user, token } = await createTestUser();
    const task = await Task.create({
      title: 'Task',
      owner: user._id,
      status: 'TODO',
      priority: 'LOW',
    });

    await Comment.create({
      task: task._id,
      user: user._id,
      content: 'Comment 1',
    });

    const res = await authRequest(token).get(`/api/tasks/${task._id}/comments`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should delete own comment', async () => {
    const { user, token } = await createTestUser();
    const task = await Task.create({
      title: 'Task',
      owner: user._id,
      status: 'TODO',
      priority: 'LOW',
    });

    const comment = await Comment.create({
      task: task._id,
      user: user._id,
      content: 'To delete',
    });

    const res = await authRequest(token).delete(`/api/tasks/${task._id}/comments/${comment._id}`);

    expect(res.status).toBe(200);

    const deleted = await Comment.findById(comment._id);
    expect(deleted).toBeNull();
  });

  it('should prevent unauthorized comment deletion', async () => {
    const { token: tokenA } = await createTestUser({ email: 'commenta@test.com' });
    const { user: userB } = await createTestUser({ email: 'commentb@test.com' });

    const task = await Task.create({
      title: 'User B Task',
      owner: userB._id,
      status: 'TODO',
      priority: 'LOW',
    });

    const comment = await Comment.create({
      task: task._id,
      user: userB._id,
      content: 'User B comment',
    });

    const res = await authRequest(tokenA).delete(`/api/tasks/${task._id}/comments/${comment._id}`);

    expect(res.status).toBe(404);
  });

  it('should prevent empty comments', async () => {
    const { user, token } = await createTestUser();
    const task = await Task.create({
      title: 'Task',
      owner: user._id,
      status: 'TODO',
      priority: 'LOW',
    });

    const res = await authRequest(token)
      .post(`/api/tasks/${task._id}/comments`)
      .send({ content: '   ' });

    expect(res.status).toBe(400);
  });

  it('admin can delete any comment', async () => {
    const { user } = await createTestUser({ email: 'commentuser@test.com' });
    const { token: adminToken } = await createTestUser({
      email: 'commentadmin@test.com',
      role: 'admin',
    });

    const task = await Task.create({
      title: 'User Task',
      owner: user._id,
      status: 'TODO',
      priority: 'LOW',
    });

    const comment = await Comment.create({
      task: task._id,
      user: user._id,
      content: 'User comment',
    });

    const res = await authRequest(adminToken).delete(
      `/api/tasks/${task._id}/comments/${comment._id}`,
    );

    expect(res.status).toBe(200);
  });
});
