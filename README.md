# Task Management Application

A full-stack MERN task management application similar to a simplified Jira/Trello. Users can register, authenticate, manage tasks with full CRUD operations, add comments, and view dashboard statistics — all with complete user data isolation.

## Features

- User registration and login with JWT authentication
- Protected routes and session management
- Task CRUD (create, read, update, delete)
- Task status management (TODO, IN_PROGRESS, COMPLETED)
- Priority levels (LOW, MEDIUM, HIGH)
- Due dates with overdue tracking
- Search, filter, sort, and paginate tasks
- Task comments with authorization
- Dashboard with statistics and task overview
- Responsive design (desktop sidebar, mobile top nav)
- Loading, empty, and error states
- Toast notifications and confirmation dialogs
- Backend and frontend test suites

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- Axios
- Tailwind CSS
- Lucide React
- Vitest + React Testing Library

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT + bcryptjs
- Zod validation
- Helmet, CORS, Morgan
- Vitest + Supertest

## Project Structure

```
task-management-app/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── docs/            # API documentation
├── package.json     # Root scripts
└── README.md
```

**Backend architecture:** Routes → Controllers → Services → Models

**Frontend structure:** api/, components/, features/, hooks/, layouts/, pages/, routes/, types/, utils/

## Prerequisites

- Node.js 18+
- npm
- MongoDB (local or Atlas)

## Installation

```bash
git clone <repository-url>
cd task-management-app
```

Install dependencies for both frontend and backend:

```bash
npm run install:all
```

Or install separately:

```bash
cd server && npm install
cd ../client && npm install
```

## Environment Variables

### Server (`server/.env`)

Copy from the example:

```bash
cp server/.env.example server/.env
```

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/task_management
JWT_SECRET=replace_with_secure_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)

```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### MongoDB

Start MongoDB locally:

```bash
mongod
```

Or use MongoDB Atlas and set `MONGODB_URI` in `server/.env`.

### Backend

```bash
cd server
npm run dev
```

Server runs at `http://localhost:5000`.

### Frontend

```bash
cd client
npm run dev
```

App runs at `http://localhost:5173`.

## Database Seed

Seed the database with sample users, tasks, and comments:

```bash
npm run seed
```

Or from the server directory:

```bash
cd server
npm run seed
```

## Test Credentials

**Development only — do not use in production:**

| Role  | Email              | Password     |
|-------|--------------------|--------------|
| User  | demo@example.com   | Demo@12345   |
| Admin | admin@example.com  | Admin@12345  |

## Running Tests

### Backend

```bash
cd server
npm test
```

### Frontend

```bash
cd client
npm test
```

### Build

```bash
cd server && npm run build
cd client && npm run build
```

## API Documentation

See [docs/API.md](docs/API.md) for complete endpoint documentation.

### Endpoint Summary

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | /api/health | No |
| POST | /api/auth/register | No |
| POST | /api/auth/login | No |
| GET | /api/auth/me | Yes |
| POST | /api/auth/logout | Yes |
| POST | /api/tasks | Yes |
| GET | /api/tasks | Yes |
| GET | /api/tasks/:id | Yes |
| PATCH | /api/tasks/:id | Yes |
| DELETE | /api/tasks/:id | Yes |
| POST | /api/tasks/:taskId/comments | Yes |
| GET | /api/tasks/:taskId/comments | Yes |
| DELETE | /api/tasks/:taskId/comments/:commentId | Yes |
| GET | /api/dashboard/stats | Yes |
| GET | /api/dashboard | Yes |

## License

MIT
