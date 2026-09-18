import { chromium } from 'playwright';
const b = await chromium.launch();
const O = (n)=>new URL('../screenshots/'+n,import.meta.url).pathname;
// wide header
let ctx = await b.newContext({viewport:{width:1920,height:1080}});
let p = await ctx.newPage();
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
await p.screenshot({path:O('wide-header.png'), clip:{x:0,y:0,width:1920,height:110}});
await ctx.close();
// gallery desktop
ctx = await b.newContext({viewport:{width:1440,height:900}});
p = await ctx.newPage();
await p.goto('http://localhost:4321/gallery',{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
await p.screenshot({path:O('gallery-new.png')});
await ctx.close();
console.log('done');
await b.close();
