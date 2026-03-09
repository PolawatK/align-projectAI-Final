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
```
# Team Contribution Log

**นายพลวัฒน์ กระเทศ 116610905100-1**
- Prompt จัดทำ MVP เเละ Deploy ระบบบน Vercel & Render
- เชื่อมต่อ MediaPipe Pose Detection
- จัดการ logic การตรวจจับ posture

**นายบารมี มาพรม 11610905120-9**
- Tester ระบบ
- ออกแบบ UX/UI
- ทำ Rag ข้อมูล

**นายปรเมษฐ์ พลซา**
- จัดทำสไลด์
- Tester ระบบ
- ทำ Rag ข้อมูล

**นายพงศภัค เปี่ยมศิริ**
- จัดทำ Problem Statement
- Tester ระบบ
- ทำ Rag ข้อมูล

**นายรันเวย์ ไชย์วร**
- ทำ Rag ข้อมูล
- Tester ระบบ