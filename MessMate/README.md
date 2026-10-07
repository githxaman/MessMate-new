# MessMate – Smart Hostel Dining Management System

MessMate helps hostel mess staff prepare food according to actual demand, reducing food wastage through meal check-ins, leave tracking, and smart analytics.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express |
| Auth | Firebase Authentication |
| Database | MongoDB Atlas + Mongoose |

## Project Structure

```
MessMate/
├── backend/
│   ├── config/          # DB & Firebase Admin
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   └── server.js
└── frontend/
    └── src/
        ├── components/  # Header, Navbar, Footer, etc.
        ├── context/     # AuthContext
        ├── pages/       # All page components
        └── services/    # API client
```

## Setup

### 1. Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** authentication
3. Copy web app config to `frontend/.env`
4. Generate a service account key → add to `backend/.env`

### 2. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Copy connection string to `backend/.env` as `MONGODB_URI`

### 3. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

Server runs at `http://localhost:5000`

### 4. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env with Firebase config
npm install
npm run dev
```

App runs at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register user profile |
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update profile |
| GET/POST/PUT/DELETE | `/api/menu` | Menu CRUD |
| POST | `/api/meals/check-in` | Student meal check-in |
| GET | `/api/meals/demand` | Expected meal demand |
| POST/GET/PUT | `/api/leaves` | Leave requests |
| POST/GET | `/api/feedback` | Feedback |
| GET/POST | `/api/food-waste` | Waste records |
| GET | `/api/analytics` | Reports & analytics |

## Roles

- **student** — Check meals, view menu, apply leave, give feedback
- **staff** — Manage menus, view attendance, record waste, approve leaves
- **admin** — Full system control, user/staff management

## Food Waste Reduction Flow

1. Students register with veg/non-veg preference
2. Students check in for meals they'll attend
3. Approved leave excludes students from counts
4. Staff sees expected demand (with 5% safety margin)
5. Staff records actual waste after each meal
6. Analytics track trends and savings

© 2026 MessMate. All Rights Reserved.
