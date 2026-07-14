# Heritage Reservation Platform

A full-stack reservation system for cultural heritage sites with real-time capacity updates, concurrency-safe booking, and hardened security.

## Quick Start (Docker)

```bash
docker-compose up --build
```

- App: http://localhost
- API: http://localhost/api

**Demo accounts (after seeding):**
- Admin: `admin@heritage.com` / `Admin@1234`
- User: `user@heritage.com` / `User@1234`

## Local Development

**Prerequisites:** Node 20, MongoDB 7, Redis 7

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env      # fill in your JWT_SECRET
npm install
npm run seed              # populate DB with sample data
npm run dev               # starts on :5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev               # starts on :5173
```

## Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind 4, Redux Toolkit, React Hook Form, Socket.io-client |
| Backend | Node 20, Express 5, TypeScript, BullMQ, Socket.io |
| Database | MongoDB 7 (Mongoose, ACID transactions) |
| Cache/Queue | Redis 7, BullMQ |
| Infrastructure | Docker Compose, nginx |

### Concurrency Control — Two Independent Safety Layers

Double-booking is prevented by two independent safety mechanisms. Either one alone is sufficient; together they are bulletproof.

## API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/sites` | — | List all heritage sites |
| GET | `/api/sites/:id` | — | Get site by ID |
| GET | `/api/sites/:siteId/slots?date=YYYY-MM-DD` | — | Get time slots for a site |
| POST | `/api/reservations` | JWT | Create booking (queued) |
| DELETE | `/api/reservations/:id` | JWT (owner only) | Cancel own reservation |
| GET | `/api/reservations/my` | JWT | Get my reservations |

## Project Structure

```
reservation-concurrence-assignment/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts          # HTTP + Socket.io entry point
│       ├── app.ts             # Express factory
│       ├── config/            # env.ts, db.ts
│       ├── models/            # User, Site, TimeSlot, Reservation
│       ├── services/          # bookingQueue, socketService, jwtService
│       ├── middleware/        # authenticate, requireAdmin
│       ├── controllers/       # auth, site, slot, reservation
│       ├── routes/            # auth, sites, slots, reservations
│       └── scripts/           # seed.ts
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.ts
    └── src/
        ├── main.tsx           # Redux Provider + Router
        ├── App.tsx            # Route tree
        ├── socket.ts          # Socket.io singleton
        ├── api/               # fetch client
        ├── store/             # Redux slices
        ├── hooks/             # useAppDispatch, useSocket
        ├── components/        # Layout, SlotCard, CapacityMatrix, route guards
        ├── pages/             # Login, Register, Sites, Booking, AdminDashboard
        └── types/             # Shared TypeScript interfaces
```
