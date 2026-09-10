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

## Deploy (Render)

`render.yaml` is a Render Blueprint that provisions everything in one go: a
free Postgres database, the backend as a Node web service, and the frontend
as a static site — with `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` and
`VITE_API_URL` wired between them automatically.

1. Push this repo to GitHub (already done).
2. On [Render](https://dashboard.render.com), click **New > Blueprint** and
   connect this repo.
3. Click **Apply** — Render creates `nova-db`, `nova-backend` and
   `nova-frontend` and deploys all three.
4. The schema is applied automatically on first backend boot
   (`backend/src/migrate.js` runs `database/schema.sql`, which is
   idempotent).
5. Once live, open the `nova-frontend` URL — that's the deployed app.

Free-tier services spin down after inactivity and the free Postgres
database expires after 30 days; upgrade the plan in `render.yaml` for
anything longer-lived.
