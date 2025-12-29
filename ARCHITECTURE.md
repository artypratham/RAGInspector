# RAG Inspector - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                    http://localhost:5173                         │
│                   (or Vercel deployment)                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Components:                                             │  │
│  │  • UploadPanel (schema + output inputs)                  │  │
│  │  • RecordList (extraction results)                       │  │
│  │  • FieldAnnotation (human corrections)                   │  │
│  │  • MetricsDashboard (analytics)                          │  │
│  │  • ErrorAnalysis (diagnostics)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  State Management (Recoil):                              │  │
│  │  • schemaInputAtom                                        │  │
│  │  • outputJsonAtom                                         │  │
│  │  • recordsAtom                                            │  │
│  │  • annotationsAtom                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Logic:                                                   │  │
│  │  • parser.ts (JSON parsing)                              │  │
│  │  • transformer.ts (data transformation)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API Calls
                             │ (JWT Bearer Token)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND API (Express.js)                       │
│                    http://localhost:5000                         │
│                   (or Render/Railway deployment)                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes:                                                  │  │
│  │  • POST   /api/auth/signup                               │  │
│  │  • POST   /api/auth/login                                │  │
│  │  • GET    /api/auth/me                                   │  │
│  │  • GET    /api/extractions                               │  │
│  │  • POST   /api/extractions                               │  │
│  │  • GET    /api/extractions/:id                           │  │
│  │  • PUT    /api/extractions/:id                           │  │
│  │  • DELETE /api/extractions/:id                           │  │
│  │  • GET    /api/annotations?extractionId=xxx              │  │
│  │  • POST   /api/annotations                               │  │
│  │  • PUT    /api/annotations/:id                           │  │
│  │  • DELETE /api/annotations/:id                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware:                                              │  │
│  │  • CORS (frontend origin only)                           │  │
│  │  • JSON body parser (10mb limit)                         │  │
│  │  • authenticate() - JWT verification                      │  │
│  │  • validate() - Zod schema validation                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Controllers:                                             │  │
│  │  • auth.controller.ts                                     │  │
│  │  • extraction.controller.ts                               │  │
│  │  • annotation.controller.ts                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Prisma ORM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL - NeonDB)                      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    users     │  │ extractions  │  │  annotations │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ id           │  │ id           │  │ id           │         │
│  │ email        │◄─┤ userId  (FK) │◄─┤ extractionId │         │
│  │ password     │  │ title        │  │ fieldName    │         │
│  │ name         │  │ schemaInput  │  │ recordId     │         │
│  │ createdAt    │  │ outputJson   │  │ originalVal  │         │
│  │ updatedAt    │  │ createdAt    │  │ correctedVal │         │
│  └──────────────┘  │ updatedAt    │  │ comment      │         │
│                    └──────────────┘  │ flagType     │         │
│                           │          │ createdAt    │         │
│                           │          │ updatedAt    │         │
│                           │          └──────────────┘         │
│                           │                                     │
│                           │          ┌──────────────┐         │
│                           │          │   records    │         │
│                           │          ├──────────────┤         │
│                           └─────────►│ id           │         │
│                                      │ extractionId │         │
│                                      │ recordId     │         │
│                                      │ docId        │         │
│                                      │ success      │         │
│                                      │ recordData   │         │
│                                      │ createdAt    │         │
│                                      └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Signup/Login Flow
```
User Browser
    │
    ├─► Enter email/password
    │
    ▼
Frontend
    │
    ├─► POST /api/auth/signup or /api/auth/login
    │   Body: { email, password, name? }
    │
    ▼
Backend Middleware
    │
    ├─► Zod validation (validate email format, password length)
    │
    ▼
Auth Controller
    │
    ├─► Check if user exists (signup)
    ├─► Hash password with bcrypt
    ├─► Create user in database
    ├─► Generate JWT token
    │
    ▼
Database (Prisma)
    │
    ├─► INSERT INTO users (email, password, name)
    │
    ▼
Response
    │
    ├─► { user: {...}, token: "eyJhbG..." }
    │
    ▼
Frontend
    │
    ├─► Store token in localStorage
    └─► Redirect to main app
```

### 2. Create Extraction Flow
```
User Browser
    │
    ├─► Paste schema in left input
    ├─► Paste output JSON in right input
    ├─► Click "Parse & Analyze"
    │
    ▼
Frontend (UploadPanel)
    │
    ├─► parseSeparateInputs(schemaInput, outputJson)
    ├─► transformToRecords(pairs)
    ├─► Display results
    │
    └─► POST /api/extractions
        Headers: { Authorization: Bearer <token> }
        Body: { title, schemaInput, outputJson }
    │
    ▼
Backend Middleware
    │
    ├─► authenticate() - verify JWT token
    ├─► validate() - check required fields
    │
    ▼
Extraction Controller
    │
    ├─► Extract userId from token
    ├─► Create extraction record
    │
    ▼
Database
    │
    ├─► INSERT INTO extractions
    │
    ▼
Response
    │
    └─► { extraction: {...} }
```

### 3. View Extraction History Flow (To Be Implemented)
```
User Browser
    │
    ├─► Click on sidebar/history button
    │
    ▼
Frontend
    │
    ├─► GET /api/extractions
    │   Headers: { Authorization: Bearer <token> }
    │
    ▼
Backend
    │
    ├─► authenticate() - verify user
    ├─► Query extractions for this user
    ├─► Include related annotations and records
    │
    ▼
Database
    │
    ├─► SELECT * FROM extractions WHERE userId = ?
    │   WITH annotations, records
    │
    ▼
Response
    │
    └─► { extractions: [...], pagination: {...} }
    │
    ▼
Frontend
    │
    ├─► Display list in sidebar
    └─► Click to load specific extraction
```

### 4. Add Annotation Flow
```
User Browser
    │
    ├─► Click on field to annotate
    ├─► Enter correction/comment
    │
    ▼
Frontend (FieldAnnotation)
    │
    ├─► POST /api/annotations
    │   Headers: { Authorization: Bearer <token> }
    │   Body: {
    │     extractionId,
    │     fieldName,
    │     recordId,
    │     originalValue,
    │     correctedValue,
    │     comment
    │   }
    │
    ▼
Backend
    │
    ├─► authenticate()
    ├─► validate() with Zod schema
    ├─► Verify extraction belongs to user
    │
    ▼
Annotation Controller
    │
    ├─► Create annotation
    │
    ▼
Database
    │
    ├─► INSERT INTO annotations
    │
    ▼
Response
    │
    └─► { annotation: {...} }
```

## Security Architecture

```
┌─────────────────────────────────────────────┐
│           Security Layers                   │
├─────────────────────────────────────────────┤
│                                             │
│  1. CORS Protection                         │
│     ✓ Only allow requests from frontend     │
│     ✓ Credentials: true                     │
│                                             │
│  2. Input Validation (Zod)                  │
│     ✓ Validate all request bodies           │
│     ✓ Type checking                          │
│     ✓ Format validation (email, etc.)       │
│                                             │
│  3. Authentication (JWT)                     │
│     ✓ Token-based authentication            │
│     ✓ 7-day expiration                      │
│     ✓ Bearer token in headers               │
│                                             │
│  4. Password Security (bcrypt)               │
│     ✓ 10 salt rounds                        │
│     ✓ One-way hashing                       │
│     ✓ Never store plain text                │
│                                             │
│  5. Data Ownership                           │
│     ✓ User can only access own data         │
│     ✓ Verify userId on all operations       │
│                                             │
│  6. SQL Injection Protection                 │
│     ✓ Prisma parameterized queries          │
│     ✓ No raw SQL                            │
│                                             │
└─────────────────────────────────────────────┘
```

## Tech Stack Breakdown

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Recoil** - State management
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icons

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **Zod** - Validation
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Database
- **PostgreSQL** - Database
- **NeonDB** - Serverless hosting
- **Prisma Client** - Type-safe queries

### Deployment
- **Frontend**: Vercel
- **Backend**: Render.com or Railway
- **Database**: NeonDB (already hosted)

## File Structure

```
RAGInspector/
├── backend/                      # Backend API
│   ├── src/
│   │   ├── config/              # Configuration
│   │   │   ├── database.ts      # Prisma client
│   │   │   └── env.ts           # Env validation
│   │   ├── controllers/         # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── extraction.controller.ts
│   │   │   └── annotation.controller.ts
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.ts          # JWT verification
│   │   │   └── validate.ts      # Zod validation
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── extraction.routes.ts
│   │   │   └── annotation.routes.ts
│   │   ├── types/               # TypeScript types
│   │   │   └── validation.ts    # Zod schemas
│   │   ├── utils/               # Utilities
│   │   │   ├── jwt.ts
│   │   │   └── password.ts
│   │   └── index.ts             # App entry point
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── package.json
│
├── src/                         # Frontend
│   ├── components/
│   │   ├── common/
│   │   │   └── UploadPanel.tsx
│   │   ├── records/
│   │   │   ├── RecordList.tsx
│   │   │   ├── RecordCard.tsx
│   │   │   └── FieldAnnotation.tsx
│   │   ├── metrics/
│   │   │   └── MetricsDashboard.tsx
│   │   └── analysis/
│   │       └── ErrorAnalysis.tsx
│   ├── logic/
│   │   ├── parser.ts
│   │   └── transformer.ts
│   ├── state/
│   │   └── atom.ts
│   └── types/
│
└── Documentation
    ├── BACKEND_SUMMARY.md       # This summary
    ├── DEPLOYMENT.md            # Deployment guide
    ├── QUICK_START.md           # Getting started
    └── ARCHITECTURE.md          # This file
```

## API Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Auth Response
```json
{
  "message": "Login successful",
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Performance Considerations

### Database Indexes
- ✅ Primary keys (id) on all tables
- ✅ Unique index on users.email
- ✅ Index on extractions.userId
- ✅ Index on annotations.extractionId
- ✅ Index on annotations.recordId
- ✅ Index on records.extractionId

### Query Optimization
- ✅ Use `select` to limit returned fields
- ✅ Use `include` for efficient joins
- ✅ Pagination on list endpoints
- ✅ Connection pooling with Prisma

### Caching Strategy (Future)
- Could add Redis for session storage
- Cache frequently accessed extractions
- Cache user data after login

## Scalability

### Current Setup (Free Tier)
- Handles ~100 requests/minute
- Database: 512MB storage
- Backend: 512MB RAM
- Auto-scaling on both platforms

### When to Scale
- More than 1000 users
- Heavy database operations
- Need for real-time features
- Multi-region deployment

## Next Steps for Full Integration

1. **Frontend API Client** - Create service to call backend
2. **Auth UI** - Login/signup pages
3. **Protected Routes** - Redirect if not authenticated
4. **Save Extractions** - Call API when parsing
5. **History Sidebar** - Show list of past extractions
6. **Load Extraction** - Click to view previous work
7. **Persist Annotations** - Save to backend
8. **User Profile** - Display user info, logout

This architecture provides a solid foundation for a production-ready RAG inspection tool with full user management and data persistence!
