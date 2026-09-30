# Wanderlust — Travel Booking Website

A full-stack travel booking web application built with **React** (Vite + Tailwind CSS) and **Flask** (Python + PostgreSQL).

## Features

- 🔐 **Authentication** — Register, login, JWT tokens with auto-refresh
- 🌍 **Destinations** — Browse and search 10+ curated global destinations
- 🏨 **Hotel Booking** — View details, select rooms, book with date picker
- 🎟️ **Ticket Booking** — Tours, transport, and attraction tickets
- 👤 **Guide Booking** — Hire expert local travel guides
- 🗺️ **Interactive Map** — Leaflet + OpenStreetMap with clickable markers
- 📋 **My Bookings** — View all bookings grouped by type
- 📧 **Contact Form** — Validated form with backend storage
- 🎨 **Premium UI** — Dark mode, glassmorphism, Framer Motion animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS, Framer Motion, React Router, React Query, Axios |
| Backend | Flask, SQLAlchemy, Marshmallow, Flask-JWT-Extended, bcrypt |
| Database | PostgreSQL |
| Maps | Leaflet + OpenStreetMap |
| DevOps | Docker, docker-compose |

## Quick Start

### With Docker (recommended)

```bash
cd travel-booking
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Database: PostgreSQL on port 5432

### Without Docker

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
# Set DATABASE_URL and JWT_SECRET_KEY in environment
flask init-db           # Create tables and seed data
flask run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET | `/api/destinations` | Search/list destinations |
| GET | `/api/hotels` | List hotels |
| GET | `/api/hotels/:id` | Hotel detail with rooms |
| GET | `/api/tickets` | List tickets |
| GET | `/api/guides` | List guides |
| POST | `/api/bookings/hotel` | Book hotel (auth required) |
| POST | `/api/bookings/ticket` | Book ticket (auth required) |
| POST | `/api/bookings/guide` | Book guide (auth required) |
| GET | `/api/bookings/me` | My bookings (auth required) |
| GET | `/api/map/points` | Map markers |
| POST | `/api/contact` | Contact form |

## Environment Variables

See `.env` file for all configuration options.
