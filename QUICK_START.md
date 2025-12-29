# Quick Start Guide

Get RAG Inspector running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- PostgreSQL database (we're using NeonDB)

## 1. Clone & Setup

```bash
# Navigate to project
cd RAGInspector

# Install backend dependencies
cd backend
npm install

# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

## 2. Configure Environment

The `.env` file is already created in the backend folder with your NeonDB credentials.

Verify it contains:
```env
DATABASE_URL="postgresql://user:password@your-neon-host.neon.tech/dbname?sslmode=require"
JWT_SECRET="your-jwt-secret-here-min-32-characters"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 3. Start Backend

```bash
# From backend folder
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📝 Environment: development
🔗 Frontend URL: http://localhost:5173
```

## 4. Test Backend

Open another terminal:

```bash
# Health check
curl http://localhost:5000/health
# Should return: {"status":"ok","message":"RAG Inspector API is running"}

# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## 5. Start Frontend

Open another terminal:

```bash
# From project root
npm run dev
```

Frontend will be at: `http://localhost:5173`

## 6. Next Steps

Now you need to connect the frontend to the backend. Here's what's next:

1. **Create API client in frontend**
2. **Add authentication UI (login/signup)**
3. **Save extractions to backend**
4. **Build sidebar to show history**
5. **Add annotation persistence**

## Quick Test Flow

### Using cURL:

```bash
# 1. Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demo123",
    "name": "Demo User"
  }'

# Save the token from response

# 2. Create Extraction
curl -X POST http://localhost:5000/api/extractions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Extraction",
    "schemaInput": "{\"input_schema\": {\"name\": {\"type\": \"string\"}}}",
    "outputJson": "{\"record_id\": \"1\", \"success\": true}"
  }'

# 3. Get All Extractions
curl http://localhost:5000/api/extractions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 4. Create Annotation
curl -X POST http://localhost:5000/api/annotations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "extractionId": "EXTRACTION_ID_HERE",
    "fieldName": "name",
    "recordId": "rec_001",
    "originalValue": "John",
    "correctedValue": "Jonathan",
    "comment": "Full name"
  }'
```

## Project Structure

```
RAGInspector/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Database & env config
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Auth & validation
│   │   ├── routes/            # API routes
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Helpers (JWT, password)
│   │   └── index.ts           # App entry
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── .env                   # Environment variables
│   └── package.json
│
├── src/                       # Frontend React app
│   ├── components/
│   ├── logic/
│   ├── state/
│   └── types/
├── package.json
└── vercel.json
```

## Common Commands

### Backend

```bash
cd backend

# Development
npm run dev              # Start dev server with hot reload

# Database
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:migrate   # Create migration
npm run prisma:push      # Push schema changes

# Production
npm run build            # Build TypeScript
npm start                # Start production server
```

### Frontend

```bash
# Development
npm run dev              # Start Vite dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build
```

## Troubleshooting

### Backend won't start

**Error: Invalid environment variables**
- Check `.env` file exists in `backend/` folder
- Verify DATABASE_URL is correct

**Error: Can't connect to database**
- Verify NeonDB is active
- Check internet connection
- Ensure connection string includes `?sslmode=require`

### Frontend Issues

**Can't fetch data from backend**
- Ensure backend is running on port 5000
- Check CORS is configured correctly
- Verify API_URL in frontend code

### Database Issues

**Tables don't exist**
```bash
cd backend
npm run prisma:push
```

**Want to reset database**
```bash
cd backend
npx prisma db push --force-reset
```

**View database data**
```bash
cd backend
npm run prisma:studio
# Opens GUI at http://localhost:5555
```

## What's Working

✅ Backend API with TypeScript + Express
✅ JWT Authentication (signup/login)
✅ PostgreSQL database with Prisma
✅ Input validation with Zod
✅ CRUD operations for extractions
✅ CRUD operations for annotations
✅ Frontend with separated input boxes
✅ Schema and output parsing

## What's Next (Frontend Integration)

🔲 API client service
🔲 Authentication UI (login/signup pages)
🔲 Protected routes
🔲 Save extractions to backend
🔲 Sidebar with extraction history
🔲 Load previous extractions
🔲 Persist annotations
🔲 User profile management

## Need Help?

Check the following files:
- `backend/README.md` - Detailed backend documentation
- `DEPLOYMENT.md` - Deployment guide
- `backend/src/index.ts` - Main API file
- `backend/prisma/schema.prisma` - Database schema

## API Documentation

Base URL (local): `http://localhost:5000/api`

### Endpoints

**Auth**
- `POST /auth/signup` - Register
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (requires token)

**Extractions**
- `POST /extractions` - Create
- `GET /extractions` - List all
- `GET /extractions/:id` - Get one
- `PUT /extractions/:id` - Update
- `DELETE /extractions/:id` - Delete

**Annotations**
- `POST /annotations` - Create
- `GET /annotations?extractionId=xxx` - List
- `PUT /annotations/:id` - Update
- `DELETE /annotations/:id` - Delete

All endpoints (except auth/signup and auth/login) require:
```
Authorization: Bearer <your-jwt-token>
```
