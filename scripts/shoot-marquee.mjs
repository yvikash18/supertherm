import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
// count broken images across page
const broken = await p.evaluate(()=>{
  const imgs=[...document.querySelectorAll('img')];
  return imgs.filter(i=>i.complete && i.naturalWidth===0).map(i=>i.src.split('/').pop());
});
console.log('BROKEN_IMAGES:', JSON.stringify(broken));
await p.evaluate(()=>document.querySelector('.marquee-track')?.scrollIntoView({block:'center'}));
await p.waitForTimeout(800);
await p.screenshot({path:new URL('../screenshots/marquee-final.png',import.meta.url).pathname});
await b.close();
