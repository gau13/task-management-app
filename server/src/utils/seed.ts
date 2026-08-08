import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Comment } from '../models/Comment.js';

dotenv.config();

const seed = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management');
    console.log('Connected to MongoDB for seeding');

    await Comment.deleteMany({});
    await Task.deleteMany({});
    await User.deleteMany({});

    const hashedPassword = await bcrypt.hash('Demo@12345', 12);
    const adminPassword = await bcrypt.hash('Admin@12345', 12);

    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      role: 'user',
    });

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    });

    const tasksData = [
      {
        title: 'Complete React project',
        description: 'Build the task management application frontend',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        dueDate: new Date('2026-08-20'),
        owner: demoUser._id,
      },
      {
        title: 'Set up MongoDB database',
        description: 'Configure MongoDB with proper indexes and schemas',
        status: 'COMPLETED' as const,
        priority: 'HIGH' as const,
        dueDate: new Date('2026-08-05'),
        owner: demoUser._id,
        completedAt: new Date('2026-08-04'),
      },
      {
        title: 'Implement JWT authentication',
        description: 'Add JWT-based auth with middleware',
        status: 'COMPLETED' as const,
        priority: 'HIGH' as const,
        dueDate: new Date('2026-08-06'),
        owner: demoUser._id,
        completedAt: new Date('2026-08-06'),
      },
      {
        title: 'Write unit tests',
        description: 'Create comprehensive test suite for backend and frontend',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date('2026-08-25'),
        owner: demoUser._id,
      },
      {
        title: 'Design dashboard UI',
        description: 'Create visually appealing dashboard with statistics',
        status: 'IN_PROGRESS' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date('2026-08-15'),
        owner: demoUser._id,
      },
      {
        title: 'Fix login bug',
        description: 'Resolve issue with token expiration handling',
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        dueDate: new Date('2026-08-01'),
        owner: demoUser._id,
      },
      {
        title: 'Add comment feature',
        description: 'Allow users to add comments on tasks',
        status: 'COMPLETED' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date('2026-08-10'),
        owner: demoUser._id,
        completedAt: new Date('2026-08-09'),
      },
      {
        title: 'Optimize API queries',
        description: 'Add indexes and use lean queries for performance',
        status: 'TODO' as const,
        priority: 'LOW' as const,
        dueDate: new Date('2026-08-30'),
        owner: demoUser._id,
      },
      {
        title: 'Create API documentation',
        description: 'Document all endpoints in docs/API.md',
        status: 'IN_PROGRESS' as const,
        priority: 'LOW' as const,
        dueDate: new Date('2026-08-18'),
        owner: demoUser._id,
      },
      {
        title: 'Review admin panel',
        description: 'Admin review of user management features',
        status: 'TODO' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date('2026-08-22'),
        owner: adminUser._id,
      },
      {
        title: 'Deploy to staging',
        description: 'Prepare staging environment configuration',
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        dueDate: new Date('2026-09-01'),
        owner: adminUser._id,
      },
      {
        title: 'User onboarding flow',
        description: 'Design welcome experience for new users',
        status: 'IN_PROGRESS' as const,
        priority: 'MEDIUM' as const,
        dueDate: new Date('2026-08-28'),
        owner: demoUser._id,
      },
    ];

    const tasks = await Task.insertMany(tasksData);

    const commentsData = [
      {
        task: tasks[0]._id,
        user: demoUser._id,
        content: 'Started working on the React components today.',
      },
      {
        task: tasks[0]._id,
        user: adminUser._id,
        content: 'Make sure to follow the design system guidelines.',
      },
      {
        task: tasks[1]._id,
        user: demoUser._id,
        content: 'MongoDB indexes are configured and working well.',
      },
      {
        task: tasks[4]._id,
        user: demoUser._id,
        content: 'Dashboard cards layout looks good so far.',
      },
      {
        task: tasks[5]._id,
        user: demoUser._id,
        content: 'This is overdue - need to prioritize.',
      },
      {
        task: tasks[6]._id,
        user: demoUser._id,
        content: 'Comment feature is fully implemented and tested.',
      },
      {
        task: tasks[9]._id,
        user: adminUser._id,
        content: 'Will review this week.',
      },
    ];

    await Comment.insertMany(commentsData);

    console.log('Seed completed successfully!');
    console.log('\nDevelopment credentials (DO NOT use in production):');
    console.log('  Demo User: demo@example.com / Demo@12345');
    console.log('  Admin User: admin@example.com / Admin@12345');
    console.log(`\nCreated ${tasks.length} tasks and ${commentsData.length} comments.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
