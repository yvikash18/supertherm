import { chromium } from 'playwright';
const BASE='https://supertherm-corporations.pages.dev';
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
for (const path of ['/','/products','/about','/branches','/contact','/gallery','/clients']) {
  try {
    const resp = await p.goto(BASE+path,{waitUntil:'domcontentloaded',timeout:30000});
    console.log(path, '->', resp?.status());
  } catch(e){ console.log(path,'-> ERR', e.message.slice(0,40)); }
}
await p.goto(BASE+'/',{waitUntil:'networkidle',timeout:40000}); await p.waitForTimeout(2000);
await p.screenshot({path:new URL('../screenshots/live-home.png',import.meta.url).pathname});
const title = await p.title();
console.log('TITLE:', title);
await b.close(); console.log('done');
