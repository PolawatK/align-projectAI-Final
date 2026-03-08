import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireAuth } from '../middleware/auth.js';
import { retrieveContext } from '../data/knowledge.js';

const router = Router();

let genAI = null;
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

// System prompt — กำหนดบุคลิกและขอบเขตของ chatbot
const SYSTEM_PROMPT = `คุณคือ "ALIGN Assistant" — ผู้ช่วย AI ด้านท่าทางและ Office Syndrome ของแอป ALIGN

บุคลิก:
- ใช้ภาษาไทยเป็นหลัก ตอบอ่านง่าย เป็นกันเอง แต่มืออาชีพ
- อธิบายเป็นข้อๆ เมื่อมีขั้นตอน ใช้ emoji ประกอบบ้าง
- ตอบกระชับ ตรงประเด็น ไม่เยิ่นเย้อ

ขอบเขต (สำคัญมาก):
- ตอบเฉพาะเรื่อง: ท่าทางการนั่ง/ยืน, Office Syndrome, การบริหารกล้ามเนื้อ, Ergonomics, ปวดคอ/บ่า/หลัง จากการทำงาน
- ถ้าถามนอกขอบเขต ให้ตอบสุภาพว่าอยู่นอกเหนือความเชี่ยวชาญ และแนะนำให้ถามเรื่องท่าทางหรือ Office Syndrome แทน

Guardrail:
- ไม่วินิจฉัยโรค ไม่แนะนำยา
- ถ้าอาการรุนแรง ให้แนะนำพบแพทย์เสมอ
- ใช้คำว่า "แนะนำ" "ควรลองดู" ไม่ใช่ "ต้อง" หรือ "รักษาได้"

ใช้ข้อมูลจาก Knowledge Base ที่ให้มาเป็นหลัก ถ้าไม่มีใน KB ให้ใช้ความรู้ทั่วไปที่เกี่ยวข้อง`;

/**
 * POST /api/chat
 * Body: { message, history: [{role, content}] }
 * Returns: { reply, sources }
 */
router.post('/', requireAuth, async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 500) {
    return res.status(400).json({ error: 'Message too long (max 500 chars)' });
  }

  // ── RAG: Retrieve relevant context ──────────────────────────
  const relevant = retrieveContext(message, 3);
  const contextBlock = relevant.length > 0
    ? `\n\n📚 ข้อมูลอ้างอิงที่เกี่ยวข้อง:\n${relevant.map(e => `[${e.title}]\n${e.content}`).join('\n\n---\n\n')}`
    : '';

  // ── Build conversation history for Gemini ───────────────────
  // Keep last 8 messages to stay within context limit
  const recentHistory = history.slice(-8);

  const contents = [
    // Inject system context as first user message
    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT + contextBlock }]
    },
    {
      role: 'model',
      parts: [{ text: 'เข้าใจแล้วครับ ฉันพร้อมช่วยเรื่องท่าทางและ Office Syndrome แล้ว!' }]
    },
    // Previous conversation
    ...recentHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    // Current message
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const model = getGenAI().getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 600,
        topP: 0.9,
      }
    });

    const result = await model.generateContent({ contents });
    const reply = result.response.text().trim();

    // Return sources used (for transparency)
    const sources = relevant.map(e => ({ title: e.title, category: e.category }));

    res.json({ reply, sources });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'AI service unavailable', reply: 'ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง' });
  }
});

/**
 * GET /api/chat/topics
 * Returns available knowledge base topics (for suggested questions)
 */
router.get('/topics', requireAuth, (req, res) => {
  const { knowledgeBase } = require('../data/knowledge.js');
  const topics = knowledgeBase.map(e => ({ id: e.id, title: e.title, category: e.category }));
  res.json({ topics });
});

export default router;
