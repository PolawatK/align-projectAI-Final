import supabase from '../lib/supabase.js';

/**
 * Middleware: ตรวจสอบ JWT Token จาก Supabase Auth
 * Token มาใน Header: Authorization: Bearer <token>
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ตรวจสอบ token กับ Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // ผนวก user ไว้ใน request สำหรับ routes อื่น
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
}
