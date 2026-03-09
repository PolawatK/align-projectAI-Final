# ALIGN — AI Posture Correction System

Web application สำหรับตรวจจับท่าทางการนั่งแบบ **real-time** และให้คำแนะนำการปรับท่าทางโดยใช้ **AI**

**Tech Stack**
- Frontend: React + MediaPipe  
- Backend: Node.js (Express)  
- Database: Supabase (PostgreSQL)  
- AI: Groq API (Llama 3.1)

**Live Demo**  
https://align-project-ai-final-449e.vercel.app

---

# Run Project (Local)

```bash
# clone repository
git clone <repo-url>

# install backend dependencies
cd backend
npm install

# install frontend dependencies
cd ../frontend
npm install

# setup environment variables
# create backend/.env
# และติดตั้ง schema.sql ลงใน Supabase database

# run backend
cd ../backend
npm run dev

# run frontend
cd ../frontend
npm run dev

---

# Team Contribution Log

**Member 1**
- พัฒนา Scanner Page
- เชื่อมต่อ MediaPipe Pose Detection
- จัดการ logic การตรวจจับ posture

**Member 2**
- พัฒนา Dashboard UI
- พัฒนา Authentication UI (Login / Register)

**Member 3**
- พัฒนา Backend API (Express)
- ออกแบบและสร้าง Database Schema (Supabase)

**Member 4**
- พัฒนา AI Recommendation System
- เชื่อมต่อ Groq API (Llama 3.1)

**Member 5**
- Deploy ระบบ (Vercel + Render)
- จัดทำ Documentation และ README