import { Router } from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth.js";
import { retrieveContext, knowledgeBase } from "../data/knowledge.js";

const router = Router();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const SYSTEM_PROMPT = `
คุณคือ ALIGN Assistant ผู้ช่วยด้านท่าทางและ Office Syndrome
ตอบภาษาไทยเสมอ

กฎสำคัญ:
1. เมื่อให้คำแนะนำด้านสุขภาพหรือท่าทาง ให้ระบุแหล่งที่มาเสมอ เช่น "(อ้างอิง: Mayo Clinic)" หรือ "(ที่มา: ALIGN Knowledge Base)"
2. ถ้าข้อมูลมาจาก context ที่ได้รับ ให้บอกว่า "ตาม ALIGN Knowledge Base:" ก่อนคำแนะนำ
3. ถ้าเป็นความรู้ทั่วไปทางการแพทย์ ให้ระบุแหล่ง เช่น WHO, APTA, Mayo Clinic, Harvard Health
4. ท้ายคำตอบที่มีคำแนะนำสุขภาพ ให้เพิ่ม: "⚠️ คำแนะนำนี้ไม่ใช่การวินิจฉัยทางการแพทย์"
`;

router.post("/", requireAuth, async (req, res) => {

  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "message required" });
  }

  const relevant = retrieveContext(message, 3);

  const contextBlock = relevant.length
    ? "\n\n---\nข้อมูลจาก ALIGN Knowledge Base:\n\n" +
      relevant.map(e => {
        const ref = e.reference ? ` [อ้างอิง: ${e.source || 'ALIGN KB'} — ${e.reference}]` : ` [ที่มา: ${e.source || 'ALIGN Knowledge Base'}]`;
        return `**${e.title}**\n${e.content}${ref}`;
      }).join("\n\n")
    : "";

const messages = [
  { role: "system", content: SYSTEM_PROMPT + contextBlock },

  ...history
    .filter(m => m && typeof m.content === "string")
    .map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content.trim()
    })),

  { role: "user", content: message }
];

  try {

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.5,
      messages
    });

    const reply = completion.choices[0].message.content;

    const sources = relevant.map(e => ({
      title: e.title,
      category: e.category,
      source: e.source || "ALIGN Knowledge Base",
      reference: e.reference || null
    }));

    res.json({ reply, sources, ai_credit: { model: "llama-3.1-8b-instant", provider: "Groq" } });

  } catch (err) {

    console.error("Chat error:", err);

    res.status(500).json({
      error: "AI service unavailable",
      reply: "ระบบ AI ขัดข้องชั่วคราว"
    });

  }

});

router.get("/topics", requireAuth, (req, res) => {

  const topics = knowledgeBase.map(e => ({
    id: e.id,
    title: e.title,
    category: e.category,
    source: e.source || "ALIGN Knowledge Base",
    reference: e.reference || null
  }));

  res.json({ topics });

});

export default router;