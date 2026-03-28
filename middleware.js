export const config = { matcher: '/' };

const BOT_AGENTS = [
  'facebookexternalhit', 'whatsapp', 'telegrambot', 'twitterbot', 'slackbot',
  'linkedinbot', 'discordbot', 'googlebot', 'bingbot', 'applebot',
  'iframely', 'embedly', 'outbrain', 'pinterest',
];

export default function middleware(req) {
  const ua = (req.headers.get('user-agent') || '').toLowerCase();
  const isBot = BOT_AGENTS.some((b) => ua.includes(b));
  if (!isBot) return;

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>ria — rent it all</title>
  <meta name="description" content="Miete und verleihe Gegenstände lokal — direkt von Mensch zu Mensch. Nachhaltig, günstig und unkompliziert." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ria-rentitall.de/" />
  <meta property="og:title" content="ria — rent it all" />
  <meta property="og:description" content="Miete und verleihe Gegenstände lokal — direkt von Mensch zu Mensch." />
  <meta property="og:image" content="https://ria-rentitall.de/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:locale" content="de_DE" />
  <meta property="og:site_name" content="ria" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="ria — rent it all" />
  <meta name="twitter:description" content="Miete und verleihe Gegenstände lokal — direkt von Mensch zu Mensch." />
  <meta name="twitter:image" content="https://ria-rentitall.de/og-image.png" />
</head>
<body></body>
</html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
