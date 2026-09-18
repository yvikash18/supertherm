// Headless crawler for superthermcorporations.com
// - Discovers same-origin pages from the nav / links
// - Saves each page's rendered HTML into scrape/html/
// - Collects every image (img src/srcset, <source>, CSS background-image, favicons)
// - Downloads all unique assets into scrape/assets/ and records a manifest
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, '..', 'scrape');
const HTML_DIR = path.join(OUT, 'html');
const ASSET_DIR = path.join(OUT, 'assets');

const ORIGIN = 'https://www.superthermcorporations.com';
const START = ORIGIN + '/';
const MAX_PAGES = 30;

const slug = (u) => {
  const p = new URL(u).pathname.replace(/\/$/, '');
  return (p === '' ? 'index' : p.replace(/^\//, '').replace(/\//g, '_')) || 'index';
};

async function main() {
  await fs.mkdir(HTML_DIR, { recursive: true });
  await fs.mkdir(ASSET_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  });
  const page = await context.newPage();

  const toVisit = [START];
  const visited = new Set();
  const assetUrls = new Set();
  const pageInfo = [];

  while (toVisit.length && visited.size < MAX_PAGES) {
    const url = toVisit.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      console.log('→ visiting', url);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1200); // let lazy content settle

      // Save HTML
      const html = await page.content();
      const name = slug(url);
      await fs.writeFile(path.join(HTML_DIR, `${name}.html`), html, 'utf8');

      // Extract links (same origin) + all image-ish asset urls
      const data = await page.evaluate((origin) => {
        const abs = (u) => {
          try { return new URL(u, location.href).href; } catch { return null; }
        };
        const links = [...document.querySelectorAll('a[href]')]
          .map((a) => abs(a.getAttribute('href')))
          .filter((u) => u && u.startsWith(origin) && !u.match(/\.(pdf|jpg|png|zip|docx?)$/i) && !u.includes('#'));

        const imgs = new Set();
        document.querySelectorAll('img').forEach((img) => {
          if (img.src) imgs.add(abs(img.src));
          const ss = img.getAttribute('srcset');
          if (ss) ss.split(',').forEach((s) => imgs.add(abs(s.trim().split(/\s+/)[0])));
        });
        document.querySelectorAll('source[srcset]').forEach((s) => {
          s.getAttribute('srcset').split(',').forEach((x) => imgs.add(abs(x.trim().split(/\s+/)[0])));
        });
        // CSS background-images from computed styles
        document.querySelectorAll('*').forEach((el) => {
          const bg = getComputedStyle(el).backgroundImage;
          if (bg && bg !== 'none') {
            [...bg.matchAll(/url\(["']?(.*?)["']?\)/g)].forEach((m) => imgs.add(abs(m[1])));
          }
        });
        // Favicons / logos in <link>
        document.querySelectorAll('link[rel*="icon"], link[rel*="apple-touch"]').forEach((l) => {
          if (l.href) imgs.add(abs(l.href));
        });

        const title = document.title;
        return { links, imgs: [...imgs].filter(Boolean), title };
      }, ORIGIN);

      pageInfo.push({ url, name, title: data.title, images: data.imgs });
      data.imgs.forEach((u) => assetUrls.add(u));
      data.links.forEach((u) => {
        const clean = u.replace(/\/$/, '') + (u.endsWith('/') ? '/' : '');
        if (!visited.has(u) && !toVisit.includes(u)) toVisit.push(u);
      });
    } catch (e) {
      console.warn('  ! failed', url, e.message);
    }
  }

  // Download all assets
  console.log(`\nDownloading ${assetUrls.size} assets…`);
  const manifest = [];
  for (const u of assetUrls) {
    if (!u.startsWith('http') || u.startsWith('data:')) continue;
    try {
      const resp = await context.request.get(u, { timeout: 30000 });
      if (!resp.ok()) { console.warn('  ! asset', resp.status(), u); continue; }
      const buf = await resp.body();
      let fname = decodeURIComponent(new URL(u).pathname.split('/').pop() || 'asset');
      fname = fname.replace(/[^a-zA-Z0-9._-]/g, '_');
      if (!fname || fname === '_') fname = 'asset_' + manifest.length;
      // de-dup filename collisions
      let target = fname, n = 1;
      while (manifest.find((m) => m.file === target)) target = `${n++}_${fname}`;
      await fs.writeFile(path.join(ASSET_DIR, target), buf);
      manifest.push({ url: u, file: target, bytes: buf.length });
    } catch (e) {
      console.warn('  ! download failed', u, e.message);
    }
  }

  await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify({ pages: pageInfo, assets: manifest }, null, 2));
  console.log(`\nDone. ${visited.size} pages, ${manifest.length} assets saved to scrape/`);
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
