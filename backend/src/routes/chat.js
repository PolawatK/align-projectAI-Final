import { Router } from 'express';
import { GoogleGenAI } from "@google/genai";
import { requireAuth } from '../middleware/auth.js';
import { retrieveContext } from '../data/knowledge.js';

const router = Router();

let genAI = null;
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  if (!genAI) {
    // สำหรับ @google/genai ต้องส่งเป็น object
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  return genAI;
}

const SYSTEM_PROMPT = `คุณคือ "ALIGN Assistant" — ผู้ช่วย AI ด้านท่าทางและ Office Syndrome ของแอป ALIGN... (System Prompt คงเดิม)`;

router.post('/', requireAuth, async (req, res) => {
  const { message, history = [] } = req.body;

  if (!message?.trim()) return res.status(400).json({ error: 'message is required' });
  if (message.length > 500) return res.status(400).json({ error: 'Message too long (max 500 chars)' });

  const relevant = retrieveContext(message, 3);
  const contextBlock = relevant.length > 0
    ? `\n\n📚 ข้อมูลอ้างอิงที่เกี่ยวข้อง:\n${relevant.map(e => `[${e.title}]\n${e.content}`).join('\n\n---\n\n')}`
    : '';

  const recentHistory = history.slice(-8);

  // เตรียม Contents ตามโครงสร้างของ @google/genai
  const contents = [
    {
      role: 'user',
      parts: [{ text: SYSTEM_PROMPT + contextBlock }]
    },
    {
      role: 'model',
      parts: [{ text: 'เข้าใจแล้วครับ ฉันพร้อมช่วยเรื่องท่าทางและ Office Syndrome แล้ว!' }]
    },
    ...recentHistory.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const ai = getGenAI();

    // แก้ไข: ใช้ชื่อโมเดล 'gemini-1.5-flash'
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: contents
    });

    const reply = result.response.text().trim();
    const sources = relevant.map(e => ({ title: e.title, category: e.category }));

    res.json({ reply, sources });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'AI service unavailable', reply: 'ขออภัยครับ ระบบ AI ขัดข้องชั่วคราว' });
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
