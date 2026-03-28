import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Properly escape all HTML special chars to prevent injection in email templates
const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sanitize = (str) => escapeHtml(str).slice(0, 500);

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, reset: now + 60_000 };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + 60_000;
  }
  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > 20;
}

function buildEmailHtml({ senderName, messagePreview, appUrl }) {
  const preview = sanitize(messagePreview).slice(0, 150);
  const previewDots = messagePreview && messagePreview.length > 150 ? '…' : '';

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Neue Nachricht auf ria</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: #F7F3EC; color: #1A1714; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(28,58,46,0.10); border: 1px solid rgba(28,58,46,0.08); }
    .header { background: #1C3A2E; padding: 28px 32px 24px; text-align: center; }
    .header-logo { font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: -0.04em; margin-bottom: 4px; font-style: italic; }
    .header-tagline { color: rgba(255,255,255,0.55); font-size: 12px; letter-spacing: 0.06em; font-style: italic; }
    .body { padding: 32px; }
    .greeting { font-size: 22px; font-weight: 800; color: #1C3A2E; margin-bottom: 10px; line-height: 1.2; }
    .subline { font-size: 15px; color: #7A7470; margin-bottom: 24px; line-height: 1.6; }
    .sender-badge { display: inline-block; background: #EAF0EB; color: #1C3A2E; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; margin-bottom: 20px; }
    .message-box { background: #F7F3EC; border-radius: 12px; padding: 18px 20px; border-left: 3px solid #1C3A2E; margin-bottom: 28px; }
    .message-label { font-size: 11px; font-weight: 700; color: #7A9E7E; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
    .message-text { font-size: 15px; color: #1A1714; line-height: 1.65; font-style: italic; }
    .cta-btn { display: block; background: linear-gradient(135deg, #1C3A2E, #163126); color: #ffffff; text-align: center; padding: 16px 24px; border-radius: 14px; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: -0.01em; margin-bottom: 24px; }
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
        <div class="header-logo">ria</div>
        <div class="header-tagline">rent it all.</div>
      </div>
      <div class="body">
        <p class="greeting">Du hast eine neue Nachricht!</p>
        <p class="subline">Jemand hat dir auf ria geschrieben. Melde dich an, um zu antworten.</p>
        <div class="sender-badge">von ${sanitize(senderName)}</div>
        <div class="message-box">
          <div class="message-label">Nachrichtenvorschau</div>
          <p class="message-text">${preview}${previewDots}</p>
        </div>
        <a href="${appUrl}" class="cta-btn">Nachricht ansehen →</a>
        <hr class="divider" />
        <p style="font-size:13px; color:#7A7470; line-height:1.6;">Du erhältst diese E-Mail, weil dir jemand über <strong style="color:#1C3A2E;">ria</strong> eine Nachricht geschickt hat. Falls du diese E-Mail nicht erwartet hast, kannst du sie einfach ignorieren.</p>
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

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (isRateLimited(ip)) return res.status(429).end();

  // Webhook secret validation — fail closed if env var is missing
  const validSecret = process.env.WEBHOOK_SECRET;
  const secret = req.headers['x-webhook-secret'];
  if (!validSecret || secret !== validSecret) return res.status(401).end();

  try {
    const { record } = req.body || {};

    if (!record) return res.status(400).json({ error: 'Missing record in payload' });

    const recipientEmail = sanitize(record.to_email || record.recipient_email || '');
    const senderName = sanitize(record.from_name || 'Jemand');
    const messageText = sanitize(record.text || '');

    if (!recipientEmail || !recipientEmail.includes('@')) {
      return res.status(400).json({ error: 'No valid recipient email in payload' });
    }

    const appUrl = process.env.APP_URL || 'https://ria-rentitall.de';

    const { data, error } = await resend.emails.send({
      from: 'ria <hallo@ria-rentitall.de>',
      to: [recipientEmail],
      subject: `${senderName} hat dir eine Nachricht geschickt — ria`,
      html: buildEmailHtml({
        senderName,
        messagePreview: messageText,
        appUrl,
      }),
    });

    if (error) {
      console.error('[send-message-email] Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ sent: 1, id: data?.id });
  } catch (err) {
    console.error('[send-message-email] Unexpected error:', err);
    // Never crash — return 200 to avoid Supabase webhook retries flooding
    return res.status(200).json({ sent: 0, warning: 'Internal error, email not sent' });
  }
}
