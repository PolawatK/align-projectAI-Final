import { Router } from "express";
import OpenAI from "openai";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

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
You are a professional posture correction coach.

Metrics:
score ${score}
spine ${spine_deg}
neck ${neck_deg}

Respond ONLY JSON.

{
 "severity":"good|moderate|severe",
 "summary":"Thai sentence",
 "recommendations":[
  {
   "title":"Thai",
   "type":"ai-generated",
   "reason":"Thai",
   "steps":["step1","step2"],
   "tag":"Spine|Neck|Breathing",
   "frequency":"text"
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
    const parsed = JSON.parse(text);

    res.json({
      ...parsed,
      low_confidence: isLowConfidence,
      generated_at: new Date().toISOString()
    });

  } catch (err) {

    console.error("Groq error:", err);

    res.status(500).json({
      error: "AI unavailable"
    });

  }

});

export default router;