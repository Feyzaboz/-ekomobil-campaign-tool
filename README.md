# Ekomobil Campaign Tool

Internal admin panel for managing cashback offers, campaigns, and announcements.

## Structure

- `backend/` - Node.js + Express + TypeScript API
- `frontend/` - React + TypeScript + Vite
- `shared/` - Shared TypeScript types

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

### 1. Database Setup

Create a PostgreSQL database:
```bash
createdb ekomobil_campaigns
```

Or use your preferred method to create the database.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/ekomobil_campaigns
NODE_ENV=development
```

Run migrations:
```bash
npm run migrate
```

Start the backend:
```bash
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5175`

## Features

### 1. Marka Bazlı Cashback
- Manage brands and their cashback offers
- Set best offers per brand
- Filter and search brands

### 2. Kategori Bazlı Cashback
- Manage categories and default cashback rates
- Set rates per integrator

### 3. Kampanya Oluşturma
- Create event definitions (behavioral rules)
- Create campaigns based on events
- Manage campaign benefits and scheduling

### 4. Duyurular
- Create in-app announcements
- Link announcements to campaigns
- Schedule and manage announcement lifecycle

## API Endpoints

- `/api/integrators` - CRUD for integrators
- `/api/brands` - CRUD for brands
- `/api/brands/:id/offers` - CRUD for brand offers
- `/api/categories` - CRUD for categories
- `/api/categories/:id/offers` - CRUD for category offers
- `/api/events` - CRUD for event definitions
- `/api/campaigns` - CRUD for campaigns
- `/api/announcements` - CRUD for announcements
