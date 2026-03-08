import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import authRouter from './routes/auth.js';
import sessionRouter from './routes/sessions.js';
import aiRouter from './routes/ai.js';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Body Parser ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ─── Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// AI endpoint gets stricter limit (Gemini quota)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { error: 'AI rate limit exceeded, wait a minute.' }
});

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/ai', aiLimiter, aiRouter);
app.use('/api/chat', aiLimiter, chatRouter);

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ALIGN Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 ALIGN Backend running on port ${PORT}`);
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? '✓ connected' : '✗ missing'}`);
  console.log(`   Gemini:   ${process.env.GEMINI_API_KEY ? '✓ configured' : '✗ missing'}`);
  console.log(`   CORS:     ${process.env.FRONTEND_URL || '*'}`);
});
