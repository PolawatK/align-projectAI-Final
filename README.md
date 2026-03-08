# ALIGN — AI Posture Intelligence MVP
**Final Project · VibeCode Full-Stack · กลุ่ม 5 คน**

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)          → Vercel                  │
│  ├── /auth          Login / Register                        │
│  ├── /              Scanner + AI Recommendations            │
│  └── /dashboard     KPI Dashboard + History                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS REST API
                           │ Bearer Token (Supabase JWT)
┌──────────────────────────▼──────────────────────────────────┐
│  Backend (Express.js)             → Render                  │
│  ├── POST /api/auth/register                                │
│  ├── POST /api/auth/login                                   │
│  ├── POST /api/auth/logout                                  │
│  ├── GET  /api/auth/me                                      │
│  ├── POST /api/sessions/submit    ← API Endpoint 1          │
│  ├── GET  /api/sessions/history   ← API Endpoint 2          │
│  ├── GET  /api/sessions/stats                               │
│  ├── PUT  /api/sessions/:id/feedback                        │
│  └── POST /api/ai/recommend       ← Gemini AI               │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  Supabase (PostgreSQL)                                      │
│  ├── auth.users    (built-in Supabase Auth)                 │
│  ├── profiles      (display_name, total_sessions, avg_score)│
│  └── posture_sessions (score, spine_deg, neck_deg, ai_recs) │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Dev)

### 1. Clone & Install
```bash
git clone <your-repo>

# Backend
cd backend && npm install
cp .env.example .env   # Fill in your keys

# Frontend
cd ../frontend && npm install
cp .env.example .env   # Set VITE_API_URL=http://localhost:4000
```

### 2. Supabase Setup
1. สร้าง project ที่ https://supabase.com
2. ไปที่ **SQL Editor** → วาง SQL จากไฟล์ `backend/schema.sql` → Run
3. ไปที่ **Project Settings → API**:
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Gemini API Key (ฟรี)
1. ไปที่ https://aistudio.google.com/apikey
2. Sign in ด้วย Google → กด **Create API Key**
3. Copy key → `GEMINI_API_KEY`

### 4. Run
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
# เปิด http://localhost:5173
```

---

## 🌐 Deploy

### Backend → Render
1. Push code ขึ้น GitHub
2. ไปที่ https://render.com → New → Web Service
3. Connect repo → **Root Directory**: `backend`
4. Build: `npm install` · Start: `npm start`
5. **Environment Variables** (ใส่ใน Render dashboard):
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   GEMINI_API_KEY=AIzaSy...
   FRONTEND_URL=https://your-app.vercel.app
   ```
6. Deploy → Copy URL (เช่น `https://align-backend.onrender.com`)

### Frontend → Vercel
1. ไปที่ https://vercel.com → Import Git Repository
2. **Root Directory**: `frontend`
3. **Environment Variables**:
   ```
   VITE_API_URL=https://align-backend.onrender.com
   ```
4. Deploy → Done!

---

## ✅ Requirements Checklist

| Requirement | Status | Detail |
|-------------|--------|--------|
| Frontend 2 หน้า | ✓ | `/auth` + `/` (scanner) + `/dashboard` |
| Backend API /submit | ✓ | `POST /api/sessions/submit` |
| Backend API /history | ✓ | `GET /api/sessions/history` |
| Database 1 ตาราง | ✓ | `posture_sessions` + `profiles` |
| Demo ≤ 3 นาที | ✓ | Happy path ≈ 2:30 นาที |
| AI Recommendation | ✓ | Gemini 1.5 Flash → 3 recs |
| Rule + AI | ✓ | Rule-based ≥ 1 + AI-generated |
| Guardrail | ✓ | Medical disclaimer + min frames check |
| HITL 2 จุด | ✓ | Save confirmation + Review modal |
| KPI วัดได้ | ✓ | Score, Good Rate, Feedback Rate |
| Login/Register | ✓ | Supabase Auth + JWT |
| ไม่มี key ใน frontend | ✓ | Keys อยู่ใน backend .env เท่านั้น |

---

## 🤖 Tools Used

| Tool | การใช้งาน |
|------|----------|
| Claude AI (Anthropic) | Vibe coding — สร้าง code ทั้งหมด |
| Google Gemini 1.5 Flash | AI Recommendation engine (ฟรี) |
| MediaPipe Pose | CV skeleton landmark detection |
| Supabase | Auth + PostgreSQL database |
| Express.js | Backend REST API |
| React + Vite | Frontend framework |
| Vercel | Frontend hosting |
| Render | Backend hosting |
