import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All session routes require auth
router.use(requireAuth);

/**
 * POST /api/sessions/submit
 * Body: { score, good_pct, spine_deg, neck_deg, duration_sec, feedback_thumb, ai_recs }
 * Saves a posture session to DB
 */
router.post('/submit', async (req, res) => {
  const { score, good_pct, spine_deg, neck_deg, duration_sec, feedback_thumb, ai_recs ,max_neck_deg,
  max_spine_deg,} = req.body;

  // Validate
  if (score === undefined || duration_sec === undefined) {
    return res.status(400).json({ error: 'score and duration_sec are required' });
  }
  if (score < 0 || score > 100) {
    return res.status(400).json({ error: 'score must be between 0 and 100' });
  }
  if (duration_sec < 5) {
    return res.status(400).json({ error: 'Session too short (minimum 5 seconds)' });
  }

  try {
    const { data, error } = await supabase.from('posture_sessions').insert([{
      user_id: req.user.id,
      score: Math.round(score),
      good_pct: Math.round(good_pct || score),
      spine_deg: parseFloat(spine_deg) || 0,
      neck_deg: parseFloat(neck_deg) || 0,
      max_neck_deg: parseFloat(max_neck_deg) || 0,
      max_spine_deg: parseFloat(max_spine_deg) || 0,
      duration_sec: Math.round(duration_sec),
      feedback_thumb: feedback_thumb || null,
      ai_recs: ai_recs ? JSON.stringify(ai_recs) : null,
      created_at: new Date().toISOString()
    }]).select().single();

    if (error) throw error;

    // Update profile aggregate stats
    await updateProfileStats(req.user.id);

    res.status(201).json({
      message: 'Session saved successfully',
      session: data
    });
  } catch (err) {
    console.error('Submit session error:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

/**
 * GET /api/sessions/history
 * Query params: limit (default 50), offset (default 0)
 * Returns paginated session history for current user
 */
router.get('/history', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;

  try {
    const { data, error, count } = await supabase
      .from('posture_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      sessions: data || [],
      total: count || 0,
      limit,
      offset
    });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * GET /api/sessions/stats
 * Returns KPI summary for current user
 */
router.get('/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posture_sessions')
      .select('score, good_pct, neck_deg, spine_deg, max_neck_deg, max_spine_deg, feedback_thumb, created_at')
      .eq('user_id', req.user.id);

    if (error) throw error;
    if (!data || !data.length) {
      return res.json({ total: 0, avg_score: null, good_rate: null, positive_feedback_rate: null, sessions_today: 0 });
    }

    const total = data.length;
    const avg_score = Math.round(data.reduce((s, r) => s + (r.score || 0), 0) / total);
    const good_rate = Math.round(data.reduce((s, r) => s + (r.good_pct || 0), 0) / total);

    const withFeedback = data.filter(r => r.feedback_thumb);
    const positive = withFeedback.filter(r => ['up','helpful'].includes(r.feedback_thumb));
    const positive_feedback_rate = withFeedback.length
      ? Math.round(positive.length / withFeedback.length * 100)
      : null;

    const today = new Date().toISOString().slice(0, 10);
    const sessions_today = data.filter(r => r.created_at?.startsWith(today)).length;

    // Score trend (last 7 sessions)
    const trend = data.slice(0, 7).reverse().map(r => ({
      score: r.score,
      date: r.created_at
    }));

    res.json({ total, avg_score, good_rate, positive_feedback_rate, sessions_today, trend });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * PUT /api/sessions/:id/feedback
 * Update feedback_thumb for a specific session
 */
router.put('/:id/feedback', async (req, res) => {
  const { id } = req.params;
  const { feedback_thumb } = req.body;

  const valid = ['up', 'down', 'helpful', 'not_helpful', 'see_doctor'];
  if (!valid.includes(feedback_thumb)) {
    return res.status(400).json({ error: 'Invalid feedback value' });
  }

  try {
    const { error } = await supabase
      .from('posture_sessions')
      .update({ feedback_thumb })
      .eq('id', id)
      .eq('user_id', req.user.id); // Security: only own sessions

    if (error) throw error;
    res.json({ message: 'Feedback updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

/**
 * PATCH /api/sessions/:id/ai-recs
 * Save AI recommendation JSON to an existing session
 */
router.patch('/:id/ai-recs', async (req, res) => {
  const { id } = req.params;
  const { ai_recs } = req.body;

  if (!ai_recs) {
    return res.status(400).json({ error: 'ai_recs is required' });
  }

  try {
    const { error } = await supabase
      .from('posture_sessions')
      .update({ ai_recs: typeof ai_recs === 'string' ? ai_recs : JSON.stringify(ai_recs) })
      .eq('id', id)
      .eq('user_id', req.user.id); // Security: only own sessions

    if (error) throw error;
    res.json({ message: 'ai_recs updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update ai_recs' });
  }
});

// ── Helper ──────────────────────────────────────────────────
async function updateProfileStats(userId) {
  try {
    const { data } = await supabase
      .from('posture_sessions')
      .select('score')
      .eq('user_id', userId);

    if (!data?.length) return;
    const avg = Math.round(data.reduce((s, r) => s + (r.score || 0), 0) / data.length);

    await supabase.from('profiles').update({
      total_sessions: data.length,
      avg_score: avg
    }).eq('id', userId);
  } catch (e) {
    console.error('updateProfileStats error:', e);
  }
}

export default router;
