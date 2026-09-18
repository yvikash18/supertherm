import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:412,height:915}, isMobile:true, deviceScaleFactor:2 });
const p = await ctx.newPage();
await p.goto('http://localhost:4321/', {waitUntil:'networkidle'});
await p.waitForTimeout(1500);
await p.screenshot({path:new URL('../screenshots/fix-mob-home.png',import.meta.url).pathname});
// footer
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(1200);
await p.screenshot({path:new URL('../screenshots/fix-mob-footer.png',import.meta.url).pathname});
await b.close();
console.log('done');
