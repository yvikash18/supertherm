import { chromium } from 'playwright';
const b = await chromium.launch();
const O=(n)=>new URL('../screenshots/'+n,import.meta.url).pathname;
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const p = await ctx.newPage();

// DARK (default) home
await p.goto('http://localhost:4321/',{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
await p.screenshot({path:O('theme-dark-home.png')});

// toolbar present?
const hasToolbar = await p.$('[data-theme-toggle]') ? true : false;
const hasLang = await p.$('[data-lang]') ? true : false;
console.log('toolbar:', hasToolbar, 'lang:', hasLang);

// toggle LIGHT
await p.evaluate(()=>{ localStorage.setItem('theme','light'); document.documentElement.classList.add('light'); });
await p.waitForTimeout(400);
await p.screenshot({path:O('theme-light-home.png')});

// scroll down a bit to see light content sections
await p.evaluate(()=>window.scrollTo(0, window.innerHeight*1.4));
await p.waitForTimeout(1000);
await p.screenshot({path:O('theme-light-products.png')});

// inner page light (about)
await p.goto('http://localhost:4321/about',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
await p.evaluate(()=>window.scrollTo(0, 700));
await p.waitForTimeout(800);
await p.screenshot({path:O('theme-light-about.png')});

await b.close(); console.log('done');
