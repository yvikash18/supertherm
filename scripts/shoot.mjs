import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:4321';
const OUT = new URL('../screenshots/', import.meta.url).pathname;
await fs.mkdir(OUT, { recursive: true });

const shots = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/products', name: 'products' },
  { path: '/gallery', name: 'gallery' },
  { path: '/branches', name: 'branches' },
  { path: '/clients', name: 'clients' },
  { path: '/contact', name: 'contact' },
];

const browser = await chromium.launch();

// Desktop
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const s of shots) {
  const page = await desk.newPage();
  await page.goto(BASE + s.path, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: OUT + `desk-${s.name}.png` });
  // full page for home
  if (s.name === 'home') await page.screenshot({ path: OUT + 'desk-home-full.png', fullPage: true });
  await page.close();
  console.log('shot desk', s.name);
}

// Mobile
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
for (const s of shots) {
  const page = await mob.newPage();
  await page.goto(BASE + s.path, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: OUT + `mob-${s.name}.png` });
  await page.close();
  console.log('shot mob', s.name);
}

await browser.close();
console.log('done');
