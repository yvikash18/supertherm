import { chromium } from 'playwright';
const BASE='https://supertherm-corporations.pages.dev';
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
for (const path of ['/','/products','/about','/branches','/contact','/gallery','/clients']) {
  const r = await ctx.request.get(BASE+path);
  console.log(path, '->', r.status());
}
// logo asset
const a = await ctx.request.get(BASE+'/assets/logo.png');
console.log('/assets/logo.png ->', a.status());
// screenshot home
await p.goto(BASE+'/',{waitUntil:'networkidle',timeout:40000}); await p.waitForTimeout(1500);
await p.screenshot({path:new URL('../screenshots/live-home.png',import.meta.url).pathname});
await b.close(); console.log('screenshot saved');
