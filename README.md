Event Planner - Minimal Fullstack Project
-----------------------------------------

Contents:
- backend/: Node.js + Express API using sqlite3 (file-based). JWT auth.
- frontend/: Static HTML/CSS/JS frontend (no build tools) to interact with backend.

Quick start (Linux/macOS/Windows WSL):
1. Extract ZIP
2. Backend:
   cd backend
   npm install
   cp .env.example .env
   # (edit .env if you want)
   npm run seed
   npm start
   Server runs at http://localhost:5000

3. Frontend:
   Open frontend/index.html in your browser OR run a static server:
   npx http-server frontend -p 8080
   Then open http://localhost:8080

Default seeded users:
- Admin: admin@example.com / admin123
- User: user@example.com / user123

Notes:
- RSVP statuses: going, maybe, decline
- Duplicate RSVPs prevented by UNIQUE constraint (userId + eventId)
- You can create more users via signup page
- ER (text):
  Users (id, name, email, password, role)
  Events (id, title, description, date, startTime, endTime, location)
  Rsvps (id, userId -> Users.id, eventId -> Events.id, status)

Good luck! If you need a React frontend instead, ask and I'll provide.
