import { chromium } from 'playwright';
const b = await chromium.launch();
const O=(n)=>new URL('../screenshots/'+n,import.meta.url).pathname;
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();
// branches
await p.goto('http://localhost:4321/branches',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
await p.evaluate(async()=>{const s=innerHeight*0.7;for(let y=0;y<document.body.scrollHeight;y+=s){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);});
await p.waitForTimeout(400);
await p.screenshot({path:O('branches-real-full.png'), fullPage:true});
// about
await p.goto('http://localhost:4321/about',{waitUntil:'networkidle'}); await p.waitForTimeout(1000);
await p.evaluate(async()=>{const s=innerHeight*0.7;for(let y=0;y<document.body.scrollHeight;y+=s){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);});
await p.waitForTimeout(400);
await p.screenshot({path:O('about-real-full.png'), fullPage:true});
// whatsapp button present + home viewport (to see WA button)
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'}); await p.waitForTimeout(1000);
const wa = await p.$('a[aria-label="Chat with us on WhatsApp"]') ? true : false;
console.log('WHATSAPP_BUTTON:', wa);
await b.close();
