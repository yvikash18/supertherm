import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
await p.goto('http://localhost:4321/',{waitUntil:'domcontentloaded'});
await p.evaluate(()=>{localStorage.setItem('theme','light');document.documentElement.classList.add('light');});
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1200);
const c = await p.evaluate(()=>{
  const btns=[...document.querySelectorAll('.btn-ghost')];
  const eng=btns.find(x=>x.textContent.includes('Engineer'));
  return eng?getComputedStyle(eng).color:'none';
});
console.log('GHOST_BTN_COLOR (light, hero):', c);
await p.screenshot({path:new URL('../screenshots/hero-buttons-light.png',import.meta.url).pathname, clip:{x:0,y:400,width:700,height:220}});
await b.close();
