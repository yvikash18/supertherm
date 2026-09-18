import { chromium } from 'playwright';
const b = await chromium.launch();
const O=(n)=>new URL('../screenshots/'+n,import.meta.url).pathname;
let ctx = await b.newContext({viewport:{width:1440,height:900}});
let p = await ctx.newPage();
await p.goto('http://localhost:4321/clients',{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
await p.evaluate(async()=>{const s=innerHeight*0.7;for(let y=0;y<document.body.scrollHeight;y+=s){scrollTo(0,y);await new Promise(r=>setTimeout(r,150));}scrollTo(0,0);});
await p.waitForTimeout(500);
await p.screenshot({path:O('clients-logos.png')});
// homepage marquee
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
await p.evaluate(()=>document.querySelector('.marquee-track')?.scrollIntoView({block:'center'}));
await p.waitForTimeout(800);
await p.screenshot({path:O('home-marquee.png')});
await b.close(); console.log('done');
