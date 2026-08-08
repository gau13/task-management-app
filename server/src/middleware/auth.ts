import { NextFunction, Request, Response } from 'express';
import { User } from '../models/User.js';
import { AppError } from '../utils/apiResponse.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', 401));
    }
  }
};

export const authorizeAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    next(new AppError('Forbidden', 403));
    return;
  }
  next();
};
