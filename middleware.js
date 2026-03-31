const BOT_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'Slackbot',
  'Discordbot',
  'kakaotalk-scrap',
  'yeti',       // Naver
  'Googlebot',
  'bingbot',
  'TelegramBot',
  'PetalBot',
  'WhatsApp',
];

const API_BASE = 'http://54.180.179.231:8081';
const SITE_URL = 'https://recipe-web-rosy.vercel.app';

export default async function middleware(request) {
  const url = new URL(request.url);
  const ua = request.headers.get('user-agent') || '';

  // 레시피 상세 경로만 처리
  const recipeMatch = url.pathname.match(/^\/recipes\/(\d+)$/);
  if (!recipeMatch) return;

  // 봇이 아니면 패스 (SPA가 처리)
  const isBot = BOT_AGENTS.some((bot) => ua.toLowerCase().includes(bot.toLowerCase()));
  if (!isBot) return;

  const recipeId = recipeMatch[1];

  try {
    const res = await fetch(`${API_BASE}/api/recipes/${recipeId}`);
    if (!res.ok) return;

    const data = await res.json();
    const recipe = data.recipe || data;

    const title = recipe.title || 'Recipe';
    const desc = recipe.description || '맞춤 레시피 추천 플랫폼';
    const image = recipe.imageUrl || `${SITE_URL}/og-default.svg`;
    const pageUrl = `${SITE_URL}/recipes/${recipeId}`;

    const escHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Recipe" />
  <meta property="og:title" content="${escHtml(title)}" />
  <meta property="og:description" content="${escHtml(desc)}" />
  <meta property="og:image" content="${escHtml(image)}" />
  <meta property="og:url" content="${escHtml(pageUrl)}" />
  <meta property="og:locale" content="ko_KR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escHtml(title)}" />
  <meta name="twitter:description" content="${escHtml(desc)}" />
  <meta name="twitter:image" content="${escHtml(image)}" />
  <title>${escHtml(title)} — Recipe</title>
  <meta http-equiv="refresh" content="0;url=${escHtml(pageUrl)}" />
</head>
<body>
  <p><a href="${escHtml(pageUrl)}">${escHtml(title)}</a></p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    // API 호출 실패 시 기본 SPA로 폴백
    return;
  }
}

export const config = {
  matcher: '/recipes/:id',
};
