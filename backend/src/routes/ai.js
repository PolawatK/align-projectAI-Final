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

You are speaking directly to the USER of a posture scanning application.
Always address the person as "ผู้ใช้งาน" or "คุณ".
Do NOT refer to them as customer, client, or patient.

Tone:
- Friendly
- Supportive
- Clear Thai language
- Explain based on the measured posture metrics

Posture Metrics from ALIGN scanner:
- Posture score: ${score}/100
- Spine tilt angle: ${spine_deg}°  (ideal < 8°)
- Neck/Head angle: ${neck_deg}°    (ideal < 22°)
- Good posture rate: ${good_pct}%
- Session duration: ${duration_sec}s

Based on these metrics, provide 3 specific, actionable recommendations.

Respond ONLY with valid JSON.

{
 "severity": "good|moderate|severe",
 "summary": "สรุปท่าทางของผู้ใช้งาน",
 "recommendations": [
  {
   "title": "ชื่อท่า",
   "type": "ai-generated",
   "reason": "อธิบายโดยอ้างอิงค่าที่วัดได้",
   "steps": ["ขั้นตอน 1", "ขั้นตอน 2", "ขั้นตอน 3"],
   "tag": "Spine|Neck|Breathing|Core",
   "frequency": "ความถี่ที่แนะนำ",
   "sources": ["แหล่งอ้างอิง 1", "แหล่งอ้างอิง 2"]
  }
 ]
}
`;

  try {

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: "You are an AI posture coach inside the ALIGN app. Speak directly to the user in Thai using the word 'คุณ'."
        },
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