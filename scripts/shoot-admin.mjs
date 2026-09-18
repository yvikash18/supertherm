import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1200,height:800}});
const p = await ctx.newPage();
await p.goto('http://localhost:4321/admin',{waitUntil:'networkidle'});
await p.waitForTimeout(1000);
await p.screenshot({path:new URL('../screenshots/admin.png',import.meta.url).pathname});
await b.close(); console.log('done');
