import { Router } from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth.js";
import { retrieveContext } from "../data/knowledge.js";

const router = Router();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const SYSTEM_PROMPT = `
คุณคือ ALIGN Assistant
ผู้ช่วยด้านท่าทางและ Office Syndrome
ตอบภาษาไทย
`;

router.post("/", requireAuth, async (req, res) => {

  const { message, history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "message required" });
  }

  const relevant = retrieveContext(message, 3);

  const contextBlock = relevant.length
    ? relevant.map(e => `${e.title}\n${e.content}`).join("\n\n")
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
      category: e.category
    }));

    res.json({ reply, sources });

  } catch (err) {

    console.error("Chat error:", err);

    res.status(500).json({
      error: "AI service unavailable",
      reply: "ระบบ AI ขัดข้องชั่วคราว"
    });

  }

});

router.get("/topics", requireAuth, (req, res) => {

  const { knowledgeBase } = require("../data/knowledge.js");

  const topics = knowledgeBase.map(e => ({
    id: e.id,
    title: e.title,
    category: e.category
  }));

  res.json({ topics });

});

export default router;