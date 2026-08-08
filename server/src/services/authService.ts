import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { AppError } from '../utils/apiResponse.js';
import { generateToken } from '../utils/jwt.js';
import { LoginInput, RegisterInput } from '../validators/authValidator.js';

const SALT_ROUNDS = 12;

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await User.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await User.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user._id.toString());

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken(user._id.toString());

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
};
