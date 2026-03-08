import { Router } from 'express';
import { GoogleGenAI } from "@google/genai";
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── Gemini Client ───────────────────────────────────────────
let genAI = null;
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  if (!genAI) {
    // แก้ไข: ใช้ object ในการสร้าง instance สำหรับ @google/genai
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  return genAI;
}

/**
 * POST /api/ai/recommend
 * Header: Authorization: Bearer <token>
 * Body: { score, spine_deg, neck_deg, good_pct, duration_sec, total_frames }
 * Returns: 3 AI posture recommendations
 */
router.post('/recommend', requireAuth, async (req, res) => {
  const { score, spine_deg, neck_deg, good_pct, duration_sec, total_frames } = req.body;

  // Guardrail: validate input
  if (score === undefined) {
    return res.status(400).json({ error: 'score is required' });
  }

  // Guardrail: low confidence (not enough frames)
  const isLowConfidence = (total_frames || 0) < 60;

  const prompt = `You are a professional posture correction coach. Based on these posture metrics from a real-time camera scan, provide exactly 3 specific recommendations.

USER METRICS:
- Posture Score: ${score}% (Good frame ratio)
- Spine Tilt: ${spine_deg || 0}° (Good is <8°, Concerning is >15°)
- Neck/Head Forward: ${neck_deg || 0}° (Good is <22°, Concerning is >30°)
- Good Posture Time: ${good_pct || score}%
- Session Duration: ${duration_sec || 0} seconds

RULES:
1. If score >= 75: Focus on maintenance and strengthening exercises
2. If score 50-74: Provide specific corrective exercises targeting the weak areas
3. If score < 50: Urgent corrections needed, recommend professional consultation
4. Always include one breathing/mindfulness technique

IMPORTANT: Respond ONLY with valid JSON, no markdown, no code blocks, no extra text.

{
  "severity": "good" | "moderate" | "severe",
  "summary": "one sentence overall assessment in Thai",
  "recommendations": [
    {
      "title": "short title (Thai)",
      "type": "rule-based" | "ai-generated",
      "reason": "specific reason based on the exact metrics above (Thai, 2-3 sentences)",
      "steps": ["step 1", "step 2", "step 3"],
      "tag": "Spine" | "Neck" | "Breathing" | "Exercise" | "Ergonomics" | "Lifestyle",
      "frequency": "e.g. ทุก 30 นาที หรือ วันละ 3 เซ็ต"
    },
    { "same structure for rec 2" },
    { "same structure for rec 3" }
  ]
}`;

  try {
    const ai = getGenAI();
    
    // แก้ไข: ปรับโครงสร้างการเรียกใช้และชื่อโมเดลให้ถูกต้อง
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // แก้จาก gemini-1.5-flash-001
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.4,
        maxOutputTokens: 800,
        response_mime_type: 'application/json' // บังคับ format JSON จากฝั่ง AI
      }
    });

    const text = result.response.text().trim();
    const parsed = JSON.parse(text);

    res.json({
      ...parsed,
      low_confidence: isLowConfidence,
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Gemini error:', err);
    // Fallback rule-based recommendations
    res.json(getFallbackRecs(score, spine_deg, neck_deg, isLowConfidence));
  }
});

// ─── Fallback (rule-based) ───────────────────────────────────
function getFallbackRecs(score = 50, spineDeg = 0, neckDeg = 0, lowConfidence = false) {
  const severity = score >= 75 ? 'good' : score >= 50 ? 'moderate' : 'severe';
  return {
    severity,
    low_confidence: lowConfidence,
    summary: score >= 75 ? 'ท่าทางดีมาก ควรรักษาไว้และเสริมความแข็งแรง' : score >= 50 ? 'ท่าทางพอใช้ได้ ควรปรับปรุงเพิ่มเติม' : 'ท่าทางต้องปรับปรุงด่วน ควรพบผู้เชี่ยวชาญ',
    generated_at: new Date().toISOString(),
    recommendations: [
      {
        title: 'Chin Tuck — ดึงคางกลับ',
        type: 'rule-based',
        reason: `มุม Neck ${neckDeg}° บ่งชี้ว่าศีรษะยื่นไปข้างหน้า การทำ Chin Tuck ช่วยลดแรงกดบนกระดูกคอและเสริมกล้ามเนื้อลึก ซึ่งรองรับน้ำหนักศีรษะได้ดีขึ้น`,
        steps: ['นั่งตัวตรง', 'ดึงคางตรงกลับ ไม่ก้มหัว', 'ค้างไว้ 5 วินาที', 'ทำซ้ำ 10 ครั้ง'],
        tag: 'Neck',
        frequency: 'ทุก 30 นาที'
      },
      {
        title: 'Shoulder Blade Squeeze',
        type: 'rule-based',
        reason: `Spine Tilt ${spineDeg}° แสดงถึงการเอนของลำตัว การบีบสะบักช่วยเปิดหน้าอก ดึงไหล่กลับ และตั้งกระดูกสันหลังให้ตรง`,
        steps: ['นั่งหรือยืนตัวตรง', 'บีบสะบักทั้งสองเข้าหากัน', 'ค้างไว้ 5–8 วินาที', 'คลาย ทำ 15 ครั้ง'],
        tag: 'Spine',
        frequency: 'วันละ 3 เซ็ต'
      },
      {
        title: 'Box Breathing — หายใจสี่เหลี่ยม',
        type: 'ai-generated',
        reason: 'ความเครียดและลมหายใจตื้นทำให้กล้ามเนื้อลำตัวตึง ส่งผลให้ท่าทางแย่ลง Box Breathing ช่วยผ่อนคลายระบบประสาทและตั้งท่าทางได้เป็นธรรมชาติ',
        steps: ['หายใจเข้า 4 วินาที', 'กลั้น 4 วินาที', 'หายใจออก 4 วินาที', 'กลั้น 4 วินาที ทำ 4 รอบ'],
        tag: 'Breathing',
        frequency: 'ทุกชั่วโมง หรือเมื่อรู้สึกเครียด'
      }
    ]
  };
}

export default router;