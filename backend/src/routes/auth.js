import { Router } from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { email, password, display_name }
 */
router.post('/register', async (req, res) => {
  const { email, password, display_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation for demo
      user_metadata: { display_name: display_name || email.split('@')[0] }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw authError;
    }

    // 2. Create profile row
    await supabase.from('profiles').upsert({
      id: authData.user.id,
      email: authData.user.email,
      display_name: display_name || email.split('@')[0],
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        display_name: display_name || email.split('@')[0]
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { access_token, user }
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, total_sessions, avg_score')
      .eq('id', data.user.id)
      .single();

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email,
        display_name: profile?.display_name || data.user.user_metadata?.display_name || email.split('@')[0],
        total_sessions: profile?.total_sessions || 0,
        avg_score: profile?.avg_score || null
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Header: Authorization: Bearer <token>
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    await supabase.auth.admin.signOut(req.token);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    // Even if signout fails, respond OK (token will expire)
    res.json({ message: 'Logged out' });
  }
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Returns current user profile
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    res.json({
      id: req.user.id,
      email: req.user.email,
      display_name: profile?.display_name || req.user.user_metadata?.display_name,
      total_sessions: profile?.total_sessions || 0,
      avg_score: profile?.avg_score || null,
      created_at: profile?.created_at
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
