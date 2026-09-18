import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4321';
const b = await chromium.launch();

const routes = ['/', '/about', '/products', '/gallery', '/branches', '/clients', '/contact'];

// 1) Route status
console.log('=== ROUTE STATUS ===');
const ctx0 = await b.newContext();
for (const r of routes) {
  const resp = await ctx0.request.get(BASE + r);
  console.log(r, '->', resp.status());
}
await ctx0.close();

// 2) Horizontal overflow hunt at 412px (Pixel)
console.log('\n=== MOBILE OVERFLOW (412px) ===');
const ctx = await b.newContext({ viewport: { width: 412, height: 924 }, isMobile: true, deviceScaleFactor: 2 });
for (const r of routes) {
  const p = await ctx.newPage();
  await p.goto(BASE + r, { waitUntil: 'networkidle', timeout: 30000 });
  await p.waitForTimeout(1000);
  const info = await p.evaluate(() => {
    const vw = window.innerWidth;
    const docW = document.documentElement.scrollWidth;
    const offenders = [];
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 60),
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
        });
      }
    });
    return { vw, docW, overflow: docW > vw + 1, offenders: offenders.slice(0, 8) };
  });
  console.log(`\n${r}  vw=${info.vw} docW=${info.docW} OVERFLOW=${info.overflow}`);
  info.offenders.forEach((o) => console.log(`   <${o.tag}> ${o.cls} L${o.left} R${o.right} W${o.w}`));
  await p.close();
}
await ctx.close();
await b.close();
