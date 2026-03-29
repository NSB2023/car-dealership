# AutoLux — Car Dealership

Full-stack car dealership application built with Django REST Framework + React + Firebase + Tailwind CSS + shadcn/ui.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, shadcn/ui |
| State | Zustand, TanStack Query |
| Auth | Firebase Authentication |
| Storage | Firebase Storage (car images) |
| Backend | Django 5, Django REST Framework |
| Database | PostgreSQL |
| API Docs | drf-spectacular (Swagger) |

---

## Project Structure

```
car-dealership/
├── frontend/         # React + Vite app
├── backend/          # Django REST API
└── docker-compose.yml
```

---

## Getting Started

### Option A — Docker (recommended)

```bash
# 1. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Add your Firebase keys to both .env files

# 3. Start everything
docker-compose up --build
```

| Service | URL |
|---|---|
| React frontend | http://localhost:5173 |
| Django API | http://localhost:8000/api |
| Swagger docs | http://localhost:8000/api/docs |

---

### Option B — Manual

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Fill in your values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env          # Fill in your Firebase keys
npx shadcn@latest init        # Run once to set up shadcn
npm run dev
```

---

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password + Google
4. Enable **Storage** (for car images)
5. **Frontend keys**: Project Settings → Your apps → Web app → copy config to `frontend/.env`
6. **Backend key**: Project Settings → Service Accounts → Generate new private key → save as `backend/firebase-credentials.json`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/inventory/` | List all cars (filterable) |
| GET | `/api/inventory/{id}/` | Car detail |
| GET | `/api/inventory/featured/` | Featured cars |
| GET | `/api/dealerships/` | All dealerships |
| GET | `/api/reviews/?car={id}` | Reviews for a car |
| POST | `/api/reviews/` | Submit a review (auth required) |
| GET | `/api/users/me/` | Current user profile (auth required) |
| POST | `/api/users/saved/{car_id}/` | Toggle saved car (auth required) |

---

## Pages Roadmap

- [x] Homepage (hero, search, featured cars)
- [ ] Inventory page (grid + filters)
- [ ] Car detail page
- [ ] Login / Register (Firebase Auth)
- [ ] User dashboard (saved cars)
- [ ] Admin dashboard
