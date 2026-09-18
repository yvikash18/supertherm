import { chromium } from 'playwright';
const b = await chromium.launch();
const O=(n)=>new URL('../screenshots/'+n,import.meta.url).pathname;
const ctx = await b.newContext({viewport:{width:1440,height:900}, colorScheme:'dark'});
const p = await ctx.newPage();
await p.goto('http://localhost:4321/about',{waitUntil:'networkidle'}); await p.waitForTimeout(1000);
// scroll to comparison table naturally
await p.evaluate(()=>document.querySelector('table')?.scrollIntoView({block:'center',behavior:'instant'}));
await p.waitForTimeout(1200);
const tableVisible = await p.evaluate(()=>{
  const t = document.querySelector('table');
  if(!t) return 'no-table';
  const fig = t.closest('[data-reveal]');
  const cs = fig ? getComputedStyle(fig) : getComputedStyle(t);
  return 'opacity='+cs.opacity+' rows='+t.querySelectorAll('tbody tr').length;
});
console.log('COMPARISON_TABLE:', tableVisible);
await p.screenshot({path:O('about-comparison.png')});
await b.close();
