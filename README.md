# NOVA — Team Productivity Platform

A full-stack project management application built for the Sankar Group Full Stack Development Internship assignment.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT + bcrypt
- API: REST

## Core features
- User registration/login
- JWT-protected application
- Create and view projects
- Add project members
- Create, assign, update and delete tasks
- Task statuses: TODO / IN_PROGRESS / DONE
- Project progress tracking
- Dashboard with project/task counts

## Run locally
### 1. Database
Create a PostgreSQL database, then run `database/schema.sql`.

### 2. Backend
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend defaults to `http://localhost:5173`; backend to `http://localhost:5000`.

See `backend/.env.example` for configuration.
