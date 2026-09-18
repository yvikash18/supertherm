import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://localhost:4321/products', { waitUntil: 'networkidle' });
await p.evaluate(async () => {
  const s = window.innerHeight * 0.7;
  for (let y = 0; y < document.body.scrollHeight; y += s) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 150));
  }
});
await p.evaluate(() => document.querySelector('#induction-forging table')?.scrollIntoView({ block: 'center' }));
await p.waitForTimeout(800);
await p.screenshot({ path: new URL('../screenshots/spec-mobile.png', import.meta.url).pathname });
const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
console.log('HORIZONTAL_OVERFLOW:', overflow);
await b.close();
