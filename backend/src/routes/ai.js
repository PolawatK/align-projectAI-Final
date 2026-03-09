import { Router } from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Powered by Groq (llama-3.1-8b-instant)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

router.post("/recommend", requireAuth, async (req, res) => {

  const { score, spine_deg, neck_deg, good_pct, duration_sec, total_frames } = req.body;

  if (score === undefined) {
    return res.status(400).json({ error: "score is required" });
  }

  const isLowConfidence = (total_frames || 0) < 60;

  const prompt = `
You are a professional posture correction coach trained on evidence-based physiotherapy guidelines.

Posture Metrics from ALIGN scanner:
- Posture score: ${score}/100
- Spine tilt angle: ${spine_deg}°  (ideal < 8°)
- Neck/Head angle: ${neck_deg}°    (ideal < 22°)
- Good posture rate: ${good_pct}%
- Session duration: ${duration_sec}s

Based on these metrics, provide 3 specific, actionable recommendations.
Each recommendation MUST include a "sources" array citing the clinical evidence or guideline behind the advice
(e.g., "Mayo Clinic — Spine Health", "American Physical Therapy Association", "WHO Guidelines on Physical Activity", etc.)

Respond ONLY with valid JSON. No markdown, no extra text.

{
 "severity": "good|moderate|severe",
 "summary": "ประโยคภาษาไทยสรุปท่าทาง",
 "recommendations": [
  {
   "title": "ชื่อท่า/เทคนิค (ภาษาไทย)",
   "type": "ai-generated",
   "reason": "เหตุผลเฉพาะเจาะจงจากค่าที่วัดได้ (ภาษาไทย)",
   "steps": ["ขั้นตอน 1", "ขั้นตอน 2", "ขั้นตอน 3"],
   "tag": "Spine|Neck|Breathing|Core",
   "frequency": "ความถี่ที่แนะนำ",
   "sources": ["ชื่อแหล่งอ้างอิง 1", "ชื่อแหล่งอ้างอิง 2"]
  }
 ]
}
`;

  try {

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const text = completion.choices[0].message.content.trim();

    // Strip markdown code fences if model wraps in ```json
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(clean);

    res.json({
      ...parsed,
      low_confidence: isLowConfidence,
      generated_at: new Date().toISOString(),
      // Credit metadata sent to frontend
      ai_credit: {
        model: "llama-3.1-8b-instant",
        provider: "Groq",
        note: "คำแนะนำสร้างโดย AI — ไม่ใช่การวินิจฉัยทางการแพทย์"
      }
    });

  } catch (err) {

    console.error("Groq error:", err.message);

    res.status(500).json({
      error: "AI unavailable"
    });

  }

});

export default router;