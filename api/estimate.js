import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
// Comma-separated allowlist of emails permitted to use estimation. Empty = any logged-in user.
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Require a valid Supabase session token from the signed-in user.
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: { message: 'Not signed in' } });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: { message: 'Invalid session' } });

  const email = (user.email || '').toLowerCase();
  if (ALLOWED_EMAILS.length && !ALLOWED_EMAILS.includes(email)) {
    return res.status(403).json({ error: { message: 'This account is not authorized to use calorie estimation.' } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: { message: 'Server is missing ANTHROPIC_API_KEY' } });

  const { model, max_tokens, messages } = req.body || {};
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: { message: e.message } });
  }
}
