import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  'mailto:cedric@ria-rentitall.de',
  process.env.VITE_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Server-side: uses SUPABASE_URL (not VITE_* prefix) + service role key for full DB access
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sanitize = (str) =>
  String(str || '')
    .replace(/[<>"'&]/g, '')
    .slice(0, 200);

// In-memory rate limiting — resets on serverless cold start by design.
// This is a best-effort defense layer; the primary security is the WEBHOOK_SECRET.
// Periodically purge expired entries to prevent unbounded memory growth.
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  // Purge stale entries every ~100 calls to avoid memory leaks
  if (rateLimitMap.size > 100) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.reset) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + 60_000 };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + 60_000;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > 30;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) return res.status(429).end();

  // Webhook secret — fail closed if env var missing
  const validSecret = process.env.WEBHOOK_SECRET;
  const secret = req.headers['x-webhook-secret'];
  if (!validSecret || secret !== validSecret) return res.status(401).end();

  const { record } = req.body;
  if (!record?.to_user_id) return res.status(400).end();

  // Validate UUID format to prevent malformed queries
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(record.to_user_id)) return res.status(400).json({ error: 'Invalid to_user_id format' });

  // Alle Push-Subscriptions des Empfängers laden
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('subscription')
    .eq('user_id', record.to_user_id);

  if (!subs?.length) return res.status(200).json({ sent: 0 });

  const payload = JSON.stringify({
    title: `ria — Nachricht von ${sanitize(record.from_name || 'jemand')}`,
    body: sanitize(record.text || ''),
  });

  const results = await Promise.allSettled(
    subs.map(({ subscription }) =>
      webpush.sendNotification(subscription, payload).catch(async (err) => {
        // Abgelaufene Subscriptions entfernen
        if (err.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', record.to_user_id)
            .eq('subscription', subscription);
        }
      })
    )
  );

  return res.status(200).json({ sent: results.filter((r) => r.status === 'fulfilled').length });
}
