import { chromium } from 'playwright';
const b = await chromium.launch();
const O=(n)=>new URL('../screenshots/'+n,import.meta.url).pathname;
const ctx = await b.newContext({viewport:{width:1000,height:900}});
const p = await ctx.newPage();
await p.goto('http://localhost:4321/contact',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
// select an option and read it back (functional test)
await p.selectOption('#interest', {label:'Induction Hardening'});
const val = await p.$eval('#interest', el=>el.value);
console.log('SELECTED_VALUE:', val);
await p.$eval('#interest', el=>el.scrollIntoView({block:'center'}));
await p.waitForTimeout(400);
await p.screenshot({path:O('contact-select.png'), clip:{x:0,y:250,width:1000,height:420}});
await b.close();
