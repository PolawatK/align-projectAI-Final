import { Router } from 'express';
import { GoogleGenAI } from "@google/genai";
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ─── Gemini Client ───────────────────────────────────────────
let genAI = null;
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
  if (!genAI) {
    // กำหนดการสร้าง instance ให้รองรับ API Key อย่างถูกต้อง
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  return genAI;
}

/**
 * POST /api/ai/recommend
 * Body: { score, spine_deg, neck_deg, good_pct, duration_sec, total_frames }
 */
router.post('/recommend', requireAuth, async (req, res) => {
  const { score, spine_deg, neck_deg, good_pct, duration_sec, total_frames } = req.body;

  if (score === undefined) {
    return res.status(400).json({ error: 'score is required' });
  }

  const isLowConfidence = (total_frames || 0) < 60;

  const prompt = `You are a professional posture correction coach. Based on these posture metrics from a real-time camera scan, provide exactly 3 specific recommendations.

USER METRICS:
- Posture Score: ${score}%
- Spine Tilt: ${spine_deg || 0}°
- Neck/Head Forward: ${neck_deg || 0}°
- Good Posture Time: ${good_pct || score}%
- Session Duration: ${duration_sec || 0} seconds

RULES:
1. Respond ONLY with valid JSON.
2. If score < 50, recommend professional consultation.
3. Include one breathing technique.

{
  "severity": "good" | "moderate" | "severe",
  "summary": "one sentence overall assessment in Thai",
  "recommendations": [
    {
      "title": "short title (Thai)",
      "type": "rule-based" | "ai-generated",
      "reason": "specific reason (Thai)",
      "steps": ["step 1", "step 2"],
      "tag": "Spine" | "Neck" | "Breathing",
      "frequency": "frequency description"
    }
  ]
}`;

  try {
    const ai = getGenAI();
    
    // เปลี่ยนเป็น gemini-1.5-flash-latest ซึ่งมักจะแก้ปัญหา 404 ในเวอร์ชัน v1beta ได้
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.4,
        maxOutputTokens: 1000,
        response_mime_type: 'application/json'
      }
    });

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    res.json({
      ...parsed,
      low_confidence: isLowConfidence,
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Gemini error:', err);
    // กรณี AI ขัดข้อง ให้ใช้ระบบกฎพื้นฐานแทน (Fallback)
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
        reason: `มุม Neck ${neckDeg}° บ่งชี้ว่าศีรษะยื่นไปข้างหน้า การทำ Chin Tuck ช่วยลดแรงกดบนกระดูกคอ`,
        steps: ['นั่งตัวตรง', 'ดึงคางตรงกลับ ไม่ก้มหัว', 'ค้างไว้ 5 วินาที', 'ทำซ้ำ 10 ครั้ง'],
        tag: 'Neck',
        frequency: 'ทุก 30 นาที'
      },
      {
        title: 'Shoulder Blade Squeeze',
        type: 'rule-based',
        reason: `Spine Tilt ${spineDeg}° แสดงถึงการเอนของลำตัว การบีบสะบักช่วยตั้งกระดูกสันหลังให้ตรง`,
        steps: ['นั่งหรือยืนตัวตรง', 'บีบสะบักเข้าหากัน', 'ค้างไว้ 5-8 วินาที', 'คลาย ทำ 15 ครั้ง'],
        tag: 'Spine',
        frequency: 'วันละ 3 เซ็ต'
      },
      {
        title: 'Box Breathing — หายใจสี่เหลี่ยม',
        type: 'ai-generated',
        reason: 'ช่วยผ่อนคลายระบบประสาทและลดการตึงเครียดของกล้ามเนื้อลำตัว',
        steps: ['หายใจเข้า 4 วิ', 'กลั้น 4 วิ', 'หายใจออก 4 วิ', 'กลั้น 4 วิ'],
        tag: 'Breathing',
        frequency: 'ทุกชั่วโมง'
      }
    ]
  };
}

export default router;