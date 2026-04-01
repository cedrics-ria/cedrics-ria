import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sanitize = (str) => escapeHtml(str).slice(0, 500);

// In-memory rate limiting — resets on cold start by design.
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  if (rateLimitMap.size > 100) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.reset) rateLimitMap.delete(key);
    }
  }
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + 60_000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60_000; }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > 20;
}

function buildEmailHtml({ status, listingTitle, ownerName, appUrl }) {
  const isAccepted = status === 'accepted';
  const accentColor = isAccepted ? '#1C3A2E' : '#C4714A';
  const statusLabel = isAccepted ? 'Buchung angenommen ✓' : 'Buchung abgelehnt';
  const headline = isAccepted
    ? `Deine Buchungsanfrage wurde angenommen!`
    : `Deine Buchungsanfrage wurde abgelehnt`;
  const body = isAccepted
    ? `<strong>${sanitize(ownerName)}</strong> hat deine Buchungsanfrage für <em>${sanitize(listingTitle)}</em> angenommen. Schreib ihnen, um die Übergabe zu koordinieren.`
    : `<strong>${sanitize(ownerName)}</strong> kann die Anfrage für <em>${sanitize(listingTitle)}</em> leider gerade nicht annehmen. Schau dir ähnliche Inserate auf ria an.`;

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${statusLabel} – ria</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #F7F3EC; color: #1A1714; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(28,58,46,0.10); border: 1px solid rgba(28,58,46,0.08); }
    .header { background: ${accentColor}; padding: 28px 32px 24px; text-align: center; }
    .header-tagline { color: rgba(255,255,255,0.55); font-size: 12px; letter-spacing: 0.06em; font-style: italic; }
    .body { padding: 32px; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 13px; font-weight: 700; margin-bottom: 18px; background: ${isAccepted ? '#EAF0EB' : '#fdf0ea'}; color: ${accentColor}; }
    .greeting { font-size: 22px; font-weight: 800; color: #1C3A2E; margin-bottom: 14px; line-height: 1.25; }
    .detail-box { background: #F7F3EC; border-radius: 12px; padding: 18px 20px; border-left: 3px solid ${accentColor}; margin-bottom: 28px; font-size: 15px; color: #1A1714; line-height: 1.65; }
    .cta-btn { display: block; background: linear-gradient(135deg, #1C3A2E, #163126); color: #ffffff; text-align: center; padding: 16px 24px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none; margin-bottom: 24px; }
    .divider { border: none; border-top: 1px solid rgba(28,58,46,0.10); margin: 24px 0; }
    .footer { padding: 20px 32px 28px; text-align: center; }
    .footer-text { font-size: 12px; color: #7A7470; line-height: 1.7; }
    .footer-link { color: #7A9E7E; text-decoration: none; }
    @media (max-width: 480px) {
      .wrapper { padding: 16px 8px; }
      .body { padding: 24px 20px; }
      .footer { padding: 16px 20px 24px; }
      .greeting { font-size: 19px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <img src="https://ria-rentitall.de/icon-192.png" width="56" height="56" alt="ria" style="border-radius:14px; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto;" />
        <div class="header-tagline">rent it all.</div>
      </div>
      <div class="body">
        <div class="status-badge">${statusLabel}</div>
        <p class="greeting">${headline}</p>
        <div class="detail-box">${body}</div>
        <a href="${appUrl}" class="cta-btn">${isAccepted ? 'Übergabe koordinieren →' : 'Andere Inserate ansehen →'}</a>
        <hr class="divider" />
        <p style="font-size:13px; color:#7A7470; line-height:1.6;">Du erhältst diese E-Mail, weil du eine Buchungsanfrage über <strong style="color:#1C3A2E;">ria</strong> gestellt hast.</p>
      </div>
      <div class="footer">
        <p class="footer-text">
          © 2026 ria · Paderborn<br />
          <a href="${appUrl}" class="footer-link">ria-rentitall.de</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) return res.status(429).end();

  const authHeader = req.headers['authorization'];

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Verify JWT
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).end();
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) return res.status(401).end();

    const { to_user_id, status, listing_title, owner_name } = req.body || {};

    if (!to_user_id || !status || !listing_title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Look up recipient email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(to_user_id);
    const recipientEmail = userData?.user?.email;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ error: 'No valid recipient email' });
    }

    const appUrl = process.env.APP_URL || 'https://ria-rentitall.de';

    const subjectMap = {
      accepted: `Buchung angenommen: ${sanitize(listing_title).slice(0, 60)} — ria`,
      declined: `Buchungsanfrage abgelehnt: ${sanitize(listing_title).slice(0, 60)} — ria`,
    };

    const { data, error } = await resend.emails.send({
      from: 'ria <hallo@ria-rentitall.de>',
      to: [sanitize(recipientEmail)],
      subject: subjectMap[status],
      html: buildEmailHtml({
        status,
        listingTitle: listing_title,
        ownerName: owner_name || 'Der Verleiher',
        appUrl,
      }),
    });

    if (error) {
      console.error('[send-booking-email] Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ sent: 1, id: data?.id });
  } catch (err) {
    console.error('[send-booking-email] Unexpected error:', err);
    return res.status(200).json({ sent: 0, warning: 'Internal error, email not sent' });
  }
}
