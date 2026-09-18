import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
await p.goto('http://localhost:4321/about',{waitUntil:'domcontentloaded'});
await p.evaluate(()=>{localStorage.setItem('theme','light');document.documentElement.classList.add('light');});
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1200);
await p.screenshot({path:new URL('../screenshots/about-light-fixed.png',import.meta.url).pathname, clip:{x:0,y:0,width:1440,height:520}});
await b.close(); console.log('done');
