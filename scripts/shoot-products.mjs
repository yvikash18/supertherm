import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4321';
const OUT = new URL('../screenshots/', import.meta.url).pathname;
const browser = await chromium.launch();

const widths = [
  { w: 1920, h: 1080, name: 'xl' },
  { w: 1440, h: 900, name: 'desk' },
  { w: 768, h: 1024, name: 'tablet' },
  { w: 390, h: 844, name: 'mob', mobile: true },
];

for (const v of widths) {
  const ctx = await browser.newContext({ viewport: { width: v.w, height: v.h }, isMobile: !!v.mobile, deviceScaleFactor: v.mobile ? 2 : 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + '/products', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: OUT + `products-${v.name}.png` });
  // Scroll through to trigger all reveal animations, then capture full page
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 180));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
  if (v.name === 'desk') await page.screenshot({ path: OUT + 'products-desk-full.png', fullPage: true });
  if (v.name === 'mob') await page.screenshot({ path: OUT + 'products-mob-full.png', fullPage: true });
  await ctx.close();
  console.log('shot', v.name);
}
await browser.close();
console.log('done');
