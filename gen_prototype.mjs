// Generates the full citizen-ui prototype: 6 screens x (en + ar) + index + design-system.
// Run: node gen_prototype.mjs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const tokens = JSON.parse(readFileSync(join(root, 'tokens/tokens.json'), 'utf8'));

// ---------- tokens.css ----------
const flat = (obj, prefix) => Object.entries(obj).flatMap(([k, v]) =>
  typeof v === 'object' ? flat(v, `${prefix}-${k}`) : [[`--${prefix}-${k}`, v]]);
const colorCss = theme => flat(tokens.color[theme], 'color').map(([k, v]) => `  ${k}: ${v};`).join('\n');
const otherCss = ['type', 'space', 'radius']
  .map(g => flat(tokens[g], g).map(([k, v]) => `  ${k}: ${v};`).join('\n')).join('\n');
writeFileSync(join(root, 'tokens/tokens.css'), `/* Generated from tokens.json - do not edit by hand */
:root {
${colorCss('light')}
${otherCss}
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${colorCss('dark')}
  }
}
[data-theme="dark"] {
${colorCss('dark')}
}
`);

// ---------- shared css ----------
writeFileSync(join(root, 'prototype/style.css'), `/* shared prototype styles - colours come from tokens/tokens.css */
*{box-sizing:border-box}
body{margin:0;font-family:var(--type-fontFamily-base);background:var(--color-bg);color:var(--color-text);font-size:var(--type-size-md)}
.phone{max-width:420px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:var(--color-bg)}
header{padding:var(--space-lg) var(--space-md) var(--space-md);display:flex;justify-content:space-between;align-items:center;gap:8px}
main{flex:1;padding:0 var(--space-md) var(--space-md);display:flex;flex-direction:column;gap:var(--space-md)}
h1{font-size:var(--type-size-xl);margin:0}
h2{font-size:var(--type-size-lg);margin:0 0 6px}
.lede{font-size:var(--type-size-md);line-height:1.6;color:var(--color-text)}
.sub{color:var(--color-text-muted);font-size:var(--type-size-sm);margin:0}
.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-lg);display:block;text-decoration:none;color:inherit}
.card:hover{border-color:var(--color-primary)}
.card h2{margin:0 0 6px}
.card p,.card .sub{margin:0;color:var(--color-text-muted);font-size:var(--type-size-sm)}
.btn{display:inline-block;background:var(--color-primary);color:var(--color-on-primary);border:0;border-radius:var(--radius-full);padding:14px 28px;font-size:var(--type-size-md);font-weight:var(--type-weight-medium);min-height:44px;cursor:pointer;text-align:center;text-decoration:none}
.btn.ghost{background:transparent;color:var(--color-primary);border:1px solid var(--color-primary)}
.chat{display:flex;flex-direction:column;gap:8px}
.bubble{max-width:80%;padding:10px 14px;border-radius:var(--radius-lg);font-size:var(--type-size-sm)}
.bubble.them{background:var(--color-surface);border:1px solid var(--color-border);align-self:flex-start}
.bubble.me{background:var(--color-primary);color:var(--color-on-primary);align-self:flex-end}
.composer{display:flex;gap:8px}
.composer input{flex:1;border:1px solid var(--color-border);border-radius:var(--radius-full);padding:12px 18px;font-size:var(--type-size-md);background:var(--color-surface);color:var(--color-text);min-height:44px}
nav{display:flex;border-top:1px solid var(--color-border);background:var(--color-surface)}
nav a{flex:1;padding:14px 4px;text-align:center;font-size:var(--type-size-xs);color:var(--color-text-muted);text-decoration:none;min-height:44px}
nav a[aria-current]{color:var(--color-primary);font-weight:var(--type-weight-bold)}
.bal{font-size:40px;font-weight:var(--type-weight-bold)}
.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--color-border);font-size:var(--type-size-sm)}
.switch{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--color-border);font-size:var(--type-size-sm)}
.pill{display:inline-block;padding:4px 12px;border-radius:var(--radius-full);border:1px solid var(--color-border);font-size:var(--type-size-xs);color:var(--color-text-muted)}
.swatch{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--color-border)}
.swatch i{width:44px;height:44px;border-radius:var(--radius-md);border:1px solid var(--color-border);display:inline-block}
.swatch code{font-size:var(--type-size-xs);color:var(--color-text-muted)}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md)}
ul.toc{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:var(--space-md)}
.toolbar{display:flex;gap:8px;font-size:var(--type-size-sm)}
.toolbar a{border:1px solid var(--color-border);border-radius:var(--radius-md);color:var(--color-text-muted);padding:6px 10px;min-height:44px;display:inline-flex;align-items:center;text-decoration:none}
:focus-visible{outline:3px solid var(--color-primary);outline-offset:2px}
@media (prefers-reduced-motion:no-preference){.card,.btn{transition:border-color .15s,transform .15s}.btn:active{transform:scale(.97)}}
`);

// ---------- i18n ----------
const T = {
  en: {
    brand: 'Kognai', tagline: 'citizen app', backHome: 'prototype index', toggle: 'ar',
    nav: { lobby: 'Lobby', chat: 'Chat', services: 'Services', wallet: 'Wallet', settings: 'Settings' },
    screens: {
      'first-run': { title: 'Welcome', h: 'Your citizen, your keys, your earnings.', p: 'Kognai helps - it never holds. Create a citizen identity to start.', cta: 'Create my citizen', alt: 'I already have one' },
      lobby: { title: 'Lobby', h: 'Citizen lobby', p: 'Your citizens, their standing and what needs you today.', cta: 'Open chat', alt: 'Register another citizen' },
      chat: { title: 'Chat', h: 'Talk to your citizen', p: 'A direct line to your citizen. Ask, brief or debrief.', cta: 'Send', alt: 'Type a message' },
      services: { title: 'Services', h: 'Learn. Create. Earn.', p: 'The hub for what your citizen can do for you.', cta: 'Browse offers', alt: 'See requests' },
      wallet: { title: 'Wallet', h: 'Credits and wallet', p: 'Your balance, settlement history and payout addresses.', cta: 'Withdraw', alt: 'Top up' },
      settings: { title: 'Settings', h: 'Settings', p: 'Identity, notifications, theme and privacy controls.', cta: 'Save changes', alt: 'Export my data' },
    },
  },
  ar: {
    brand: 'كوغناي', tagline: 'تطبيق المواطن', backHome: 'فهرس النموذج', toggle: 'en',
    nav: { lobby: 'الردهة', chat: 'الدردشة', services: 'الخدمات', wallet: 'المحفظة', settings: 'الإعدادات' },
    screens: {
      'first-run': { title: 'مرحباً', h: 'مواطنك، مفاتيحك، أرباحك.', p: 'كوغناي يساعد ولا يحتفظ. أنشئ هوية مواطنك للبدء.', cta: 'أنشئ مواطني', alt: 'لديّ واحد بالفعل' },
      lobby: { title: 'الردهة', h: 'ردهة المواطنين', p: 'مواطنوك ومكانتهم وما يحتاجك اليوم.', cta: 'افتح الدردشة', alt: 'سجّل مواطناً آخر' },
      chat: { title: 'الدردشة', h: 'تحدث مع مواطنك', p: 'خط مباشر مع مواطنك. اسأل أو وجّه أو استفسر.', cta: 'أرسل', alt: 'اكتب رسالة' },
      services: { title: 'الخدمات', h: 'تعلّم. أنشئ. اكسب.', p: 'مركز ما يمكن لمواطنك فعله من أجلك.', cta: 'تصفح العروض', alt: 'اطلع على الطلبات' },
      wallet: { title: 'المحفظة', h: 'الرصيد والمحفظة', p: 'رصيدك وسجل التسويات وعناوين الدفع.', cta: 'سحب', alt: 'إيداع' },
      settings: { title: 'الإعدادات', h: 'الإعدادات', p: 'الهوية والإشعارات والمظهر والخصوصية.', cta: 'احفظ التغييرات', alt: 'صدّر بياناتي' },
    },
  },
};

// ---------- render ----------
const order = ['lobby', 'chat', 'services', 'wallet', 'settings'];
const navHtml = (t, cur) => `<nav aria-label="primary">${order.map(k =>
  `<a href="${k}.html"${k === cur ? ' aria-current="page"' : ''}>${t.nav[k]}</a>`).join('')}</nav>`;

function shell(t, lang, dir, cur, body) {
  const other = dir === 'rtl' ? `../${cur}.html` : `ar/${cur}.html`;
  return `<!doctype html>
<html lang="${lang}"${dir === 'rtl' ? ' dir="rtl"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.screens[cur].title} - ${t.brand}</title>
<link rel="stylesheet" href="${dir === 'rtl' ? '../' : ''}../tokens/tokens.css">
<link rel="stylesheet" href="${dir === 'rtl' ? '../' : ''}style.css">
</head>
<body>
<div class="phone">
<header>
  <div><h1>${t.brand}</h1><p class="sub">${t.tagline} - ${t.screens[cur].title}</p></div>
  <div class="toolbar">
    <a href="${dir === 'rtl' ? '../' : ''}index.html">${t.backHome}</a>
    <a href="${other}">${t.toggle}</a>
  </div>
</header>
<main>
${body}
</main>
${navHtml(t, cur)}
</div>
</body>
</html>
`;
}

function body(t, cur) {
  const s = t.screens[cur];
  switch (cur) {
    case 'first-run': return `  <h2>${s.h}</h2>
  <p class="lede">${s.p}</p>
  <a class="btn" href="lobby.html">${s.cta}</a>
  <a class="btn ghost" href="lobby.html">${s.alt}</a>
  <div class="card"><h2>What you control</h2><p>Keys stay in your wallet. Credits settle to your payout address. You can leave any time.</p></div>`;
    case 'lobby': return `  <h2>${s.h}</h2>
  <p class="lede">${s.p}</p>
  <a class="card" href="chat.html"><h2>Citizen Aida</h2><p>Standing 8.1 - two offers need review</p></a>
  <a class="card" href="chat.html"><h2>Citizen Boreas</h2><p>Standing 6.4 - idle, ready for work</p></a>
  <a class="btn" href="chat.html">${s.cta}</a>
  <a class="btn ghost" href="first-run.html">${s.alt}</a>`;
    case 'chat': return `  <h2>${s.h}</h2>
  <div class="chat" aria-live="polite">
    <div class="bubble them">Good morning. Two offers match your price floor: a KOG snapshot tool and a docs audit.</div>
    <div class="bubble me">Show me the snapshot one.</div>
    <div class="bubble them">60 USDC, deadline Nov 9, tests required. Shall I bid 55?</div>
  </div>
  <form class="composer" onsubmit="return false">
    <input type="text" aria-label="${s.alt}" placeholder="${s.alt}">
    <button class="btn" type="submit">${s.cta}</button>
  </form>`;
    case 'services': return `  <h2>${s.h}</h2>
  <p class="lede">${s.p}</p>
  <div class="grid">
    <a class="card" href="chat.html"><h2>Learn</h2><p>Courses, briefs, how-tos</p></a>
    <a class="card" href="chat.html"><h2>Create</h2><p>Docs, code, designs</p></a>
    <a class="card" href="chat.html"><h2>Earn</h2><p>Offers, bounties, tenders</p></a>
    <a class="card" href="chat.html"><h2>Review</h2><p>Audit, verify, test</p></a>
  </div>
  <a class="btn" href="lobby.html">${s.cta}</a>
  <a class="btn ghost" href="lobby.html">${s.alt}</a>`;
    case 'wallet': return `  <h2>${s.h}</h2>
  <div class="card"><p class="sub">Available balance</p><div class="bal">412.60</div><p class="sub">KOG credits</p></div>
  <div class="card">
    <div class="row"><span>Settled payout</span><span>0.10 USDC</span></div>
    <div class="row"><span>Pending settlement</span><span>55.00 KOG</span></div>
    <div class="row"><span>Payout address</span><span>0x7a3D...910C</span></div>
  </div>
  <a class="btn" href="wallet.html">${s.cta}</a>
  <a class="btn ghost" href="wallet.html">${s.alt}</a>`;
    case 'settings': return `  <h2>${s.h}</h2>
  <div class="card">
    <div class="switch"><span>Identity</span><span class="pill">did:kog:aida</span></div>
    <div class="switch"><span>Notifications</span><span class="pill">on</span></div>
    <div class="switch"><span>Theme</span><span class="pill">system</span></div>
    <div class="switch"><span>Language</span><span class="pill">auto</span></div>
    <div class="switch"><span>Data sharing</span><span class="pill">off</span></div>
  </div>
  <a class="btn" href="settings.html">${s.cta}</a>
  <a class="btn ghost" href="settings.html">${s.alt}</a>`;
  }
}

mkdirSync(join(root, 'prototype/ar'), { recursive: true });
const screens = ['first-run', 'lobby', 'chat', 'services', 'wallet', 'settings'];
for (const s of screens) {
  writeFileSync(join(root, `prototype/${s}.html`), shell(T.en, 'en', 'ltr', s, body(T.en, s)));
  writeFileSync(join(root, `prototype/ar/${s}.html`), shell(T.ar, 'ar', 'rtl', s, body(T.ar, s)));
}

// ---------- index ----------
function indexPage(t, lang, dir) {
  const pre = dir === 'rtl' ? '../' : '';
  const links = screens.map(s =>
    `<li><a class="card" href="${pre}${s}.html"><h2>${t.screens[s].title}</h2><p>${t.screens[s].h} - ${t.screens[s].p}</p></a></li>`).join('\n    ');
  return `<!doctype html>
<html lang="${lang}"${dir === 'rtl' ? ' dir="rtl"' : ''}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.brand} ${t.tagline} - ${t.backHome}</title>
<link rel="stylesheet" href="${pre}../tokens/tokens.css">
<link rel="stylesheet" href="${pre}style.css">
</head>
<body>
<div class="phone">
<header>
  <div><h1>${t.brand}</h1><p class="sub">${t.tagline} - clickable prototype</p></div>
  <div class="toolbar"><a href="${pre}design-system.html">design system</a><a href="${dir === 'rtl' ? '../index.html' : 'ar/index.html'}">${t.toggle}</a></div>
</header>
<main>
<ul class="toc">
    ${links}
    <li><a class="card" href="${pre}design-system.html"><h2>Design system</h2><p>Tokens, colours, components and contrast pairs.</p></a></li>
</ul>
</main>
</div>
</body>
</html>
`;
}
writeFileSync(join(root, 'prototype/index.html'), indexPage(T.en, 'en', 'ltr'));
writeFileSync(join(root, 'prototype/ar/index.html'), indexPage(T.ar, 'ar', 'rtl'));

// ---------- design-system ----------
const swatches = Object.entries(tokens.color.light).map(([k, v]) =>
  `<div class="swatch"><i style="background:${v}"></i><div><b>${k}</b> <code>${v} / dark ${tokens.color.dark[k]}</code></div></div>`).join('\n    ');
writeFileSync(join(root, 'prototype/design-system.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Design system - Kognai citizen app</title>
<link rel="stylesheet" href="../tokens/tokens.css">
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="phone">
<header>
  <div><h1>Kognai</h1><p class="sub">design system</p></div>
  <div class="toolbar"><a href="index.html">prototype index</a></div>
</header>
<main>
  <h2>Colour tokens</h2>
  <div class="card">${swatches}</div>
  <h2>Type &amp; space</h2>
  <div class="card">
    <div class="row"><span>font family</span><code>${tokens.type.fontFamily.base}</code></div>
    <div class="row"><span>sizes</span><code>xs 12 / sm 14 / md 16 / lg 20 / xl 28</code></div>
    <div class="row"><span>space</span><code>4 / 8 / 16 / 24 / 40</code></div>
    <div class="row"><span>radius</span><code>6 / 12 / 20 / full</code></div>
  </div>
  <h2>Components</h2>
  <div class="card"><h2>Card</h2><p>Surface, border, radius-lg. Used for list items and summaries.</p></div>
  <a class="btn" href="index.html">Primary button</a>
  <a class="btn ghost" href="index.html">Ghost button</a>
  <div class="chat">
    <div class="bubble them">Chat bubble - incoming</div>
    <div class="bubble me">Chat bubble - outgoing</div>
  </div>
</main>
</div>
</body>
</html>
`);
console.log('prototype generated: 6 screens x2, index x2, design-system, tokens.css');
