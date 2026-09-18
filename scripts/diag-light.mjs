import { chromium } from 'playwright';
const b = await chromium.launch();
// Desktop light — ghost button
let ctx = await b.newContext({viewport:{width:1440,height:900}});
let p = await ctx.newPage();
await p.goto('http://localhost:4321/',{waitUntil:'domcontentloaded'});
await p.evaluate(()=>{localStorage.setItem('theme','light');document.documentElement.classList.add('light');});
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(1000);
const ghost = await p.evaluate(()=>{
  const btns=[...document.querySelectorAll('.btn-ghost')];
  const b=btns.find(x=>x.textContent.includes('Engineer'))||btns[0];
  return b?getComputedStyle(b).color:'none';
});
console.log('GHOST_BTN_COLOR (light):', ghost);
await ctx.close();
// Mobile light — open menu, check nav link colors
ctx = await b.newContext({viewport:{width:412,height:900},isMobile:true,deviceScaleFactor:2});
p = await ctx.newPage();
await p.goto('http://localhost:4321/',{waitUntil:'domcontentloaded'});
await p.evaluate(()=>{localStorage.setItem('theme','light');document.documentElement.classList.add('light');});
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(800);
await p.click('[data-nav-toggle]'); await p.waitForTimeout(600);
const nav = await p.evaluate(()=>{
  const l=[...document.querySelectorAll('[data-nav-panel] .m-link, [data-nav-panel] a')];
  const home=l.find(x=>x.textContent.trim()==='Home');
  const panelBg=getComputedStyle(document.querySelector('[data-nav-panel]')).backgroundColor;
  return {homeColor: home?getComputedStyle(home).color:'?', panelBg};
});
console.log('MOBILE_NAV:', JSON.stringify(nav));
await p.screenshot({path:new URL('../screenshots/mobile-menu-light.png',import.meta.url).pathname});
await b.close();
