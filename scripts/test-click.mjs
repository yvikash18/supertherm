import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1000,height:900}});
const p = await ctx.newPage();
await p.goto('http://localhost:4321/contact',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
// try clicking + typing in the name input
await p.click('#name');
await p.type('#name','Test User');
const val = await p.$eval('#name', el=>el.value);
const focused = await p.evaluate(()=>document.activeElement?.id);
console.log('INPUT_VALUE:', JSON.stringify(val), 'FOCUSED:', focused);
await b.close();
