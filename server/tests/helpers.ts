import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../src/utils/jwt.js';

export const createTestUser = async (
  overrides: Partial<{
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
  }> = {},
) => {
  const password = overrides.password || 'Test@12345';
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: overrides.name || 'Test User',
    email: overrides.email || `test-${Date.now()}@example.com`,
    password: hashedPassword,
    role: overrides.role || 'user',
  });

  const token = generateToken(user._id.toString());

  return { user, token, password };
};

export const authRequest = (token: string) => {
  const agent = request(app);
  return {
    get: (url: string) => agent.get(url).set('Authorization', `Bearer ${token}`),
    post: (url: string) => agent.post(url).set('Authorization', `Bearer ${token}`),
    patch: (url: string) => agent.patch(url).set('Authorization', `Bearer ${token}`),
    delete: (url: string) => agent.delete(url).set('Authorization', `Bearer ${token}`),
  };
};

export { request, app };
