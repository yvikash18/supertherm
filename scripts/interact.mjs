import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4321';
const OUT = new URL('../screenshots/', import.meta.url).pathname;
const browser = await chromium.launch();

// Mobile menu open
const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
const mp = await mob.newPage();
await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
await mp.waitForTimeout(800);
await mp.click('[data-nav-toggle]');
await mp.waitForTimeout(700);
await mp.screenshot({ path: OUT + 'mob-menu-open.png' });
console.log('mobile menu shot');

// Gallery lightbox open
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await desk.newPage();
await dp.goto(BASE + '/gallery', { waitUntil: 'networkidle' });
await dp.waitForTimeout(1500);
await dp.click('[data-gallery] .tile');
await dp.waitForTimeout(900);
await dp.screenshot({ path: OUT + 'lightbox-open.png' });
console.log('lightbox shot');

await browser.close();
console.log('done');
