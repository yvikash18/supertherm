// Process animations for the four machine families. Each scene is a small
// state object animated by one GSAP timeline and painted on a canvas; a
// ScrollTrigger plays it only while its player is on screen.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tempRGB, tempCSS } from '../lib/heat';
import { processCopy, type Kind } from '../lib/process-copy';

gsap.registerPlugin(ScrollTrigger);

type St = Record<string, number>;
type Env = { c: CanvasRenderingContext2D; W: number; H: number; cy: number; r: number };
type Scene = {
  st: St;
  /** Build the looping timeline that animates `st`. */
  build(): gsap.core.Timeline;
  /** Timeline time used for the single still frame (reduced motion). */
  still: number;
  /** Paint one frame; returns the two readout values. */
  draw(e: Env, time: number): [string, string];
};
type Puff = { x: number; y: number; vx: number; vy: number; life: number };

const COPPER = '#c0703e', COPPER_LIT = '#eaa877', COPPER_BACK = '#6e3d22', FIXTURE = '#243240';
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const round5 = (v: number) => String(Math.round(v / 5) * 5);

/* Shared drawing ---------------------------------------------------------- */

// Light-to-dark shading that makes a flat band read as a round bar
function roundBar(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, 'rgba(6,10,16,0.55)'); g.addColorStop(0.3, 'rgba(255,255,255,0.14)');
  g.addColorStop(0.55, 'rgba(6,10,16,0)'); g.addColorStop(1, 'rgba(6,10,16,0.65)');
  c.fillStyle = g; c.fillRect(x, y, w, h);
}

// A ring around a bar, seen from the side: far half behind, near half in front
function ring(c: CanvasRenderingContext2D, x: number, cy: number, r: number, body: string, light: string | null, w: number, front: boolean) {
  c.lineWidth = w; c.strokeStyle = body; c.lineCap = 'butt';
  c.beginPath();
  c.ellipse(x, cy, r * 0.34, r * 1.5, 0, front ? -Math.PI / 2 : Math.PI / 2, front ? Math.PI / 2 : (Math.PI * 3) / 2);
  c.stroke();
  if (light && front) {
    c.lineWidth = Math.max(1, w * 0.2); c.strokeStyle = light;
    c.beginPath(); c.ellipse(x + w * 0.18, cy, r * 0.34, r * 1.5, 0, -1.1, 1.1); c.stroke();
  }
}

function glow(c: CanvasRenderingContext2D, x: number, y: number, radius: number, alpha: number, rgb = '242,92,15') {
  if (alpha <= 0.01) return;
  const g = c.createRadialGradient(x, y, radius * 0.1, x, y, radius);
  g.addColorStop(0, `rgba(${rgb},${alpha})`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.globalCompositeOperation = 'lighter'; c.fillStyle = g;
  c.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  c.globalCompositeOperation = 'source-over';
}

function strand(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w: number, body: string, light?: string) {
  c.lineCap = 'round'; c.strokeStyle = body; c.lineWidth = w;
  c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  if (light) {
    c.strokeStyle = light; c.lineWidth = Math.max(1, w * 0.22);
    c.beginPath(); c.moveTo(x0 - w * 0.2, y0); c.lineTo(x1 - w * 0.2, y1); c.stroke();
  }
}

/* 1. Scan hardening ------------------------------------------------------- */
function hardening(): Scene {
  const st: St = { scan: 0, heat: 0, quench: 0, part: 1, step: 0 };
  let puffs: Puff[] = [];
  const RAW = [104, 113, 122], HARD = [58, 76, 98], PEAK = 900;

  return {
    st,
    still: 4.9,
    build() {
      return gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'none' } })
        .set(st, { scan: 0, heat: 0, quench: 0, step: 0 })
        .to(st, { part: 1, duration: 0.5 })
        .to(st, { heat: 1, duration: 0.8, ease: 'power2.out' })
        .to(st, { scan: 1, duration: 6.4 }, 'scan')
        .to(st, { quench: 1, duration: 0.4 }, 'scan+=0.7')
        .set(st, { step: 1 }, 'scan+=1.6')
        .to(st, { heat: 0, duration: 0.5 }, 'scan+=6.4')
        .set(st, { step: 2 }, 'scan+=7.2')
        .to(st, { quench: 0, duration: 0.5 }, 'scan+=7.4')
        .to(st, { part: 0, duration: 0.5 }, 'scan+=9.6');
    },
    draw({ c, W, H, cy, r }, time) {
      const x0 = W * 0.08, x1 = W * 0.92;
      const s0 = x0 + (x1 - x0) * 0.1, s1 = x1 - (x1 - x0) * 0.1;
      const xr = s0 + st.scan * (s1 - s0), xq = xr - r * 1.9, tube = r * 0.3;

      const tempAt = (x: number) => {
        const d = x - xr;
        if (d > 0) return 30 + (PEAK - 30) * st.heat * Math.exp(-(d * d) / (r * r * 0.5));
        let t = 30 + (PEAK - 30) * st.heat * Math.exp(d / (r * 3.2));
        if (st.quench > 0 && x < xq) t = 30 + (t - 30) * Math.exp((x - xq) / (r * 0.35)) * (1 - st.quench * 0.6);
        return t;
      };
      const surface = (x: number) => {
        const base = x > s0 && x < Math.min(xq, s1) && st.scan > 0.02 ? HARD : RAW;
        const t = tempAt(x);
        if (t < 420) return base;
        const hot = tempRGB(t), k = Math.min(1, (t - 420) / 180);
        return [lerp(base[0], hot[0], k), lerp(base[1], hot[1], k), lerp(base[2], hot[2], k)];
      };

      c.globalAlpha = st.part;
      // Centres holding the shaft
      c.fillStyle = FIXTURE;
      c.fillRect(0, cy - r * 0.9, x0 - r * 0.2, r * 1.8);
      c.beginPath(); c.moveTo(x1 + r * 0.9, cy - r * 0.6); c.lineTo(x1 + r * 0.05, cy); c.lineTo(x1 + r * 0.9, cy + r * 0.6); c.closePath(); c.fill();
      c.fillRect(x1 + r * 0.9, cy - r * 0.6, W, r * 1.2);

      c.strokeStyle = COPPER_BACK; c.lineWidth = tube;
      c.beginPath(); c.moveTo(xr, cy - r * 1.5); c.lineTo(xr, -10); c.stroke();
      ring(c, xr, cy, r, COPPER_BACK, null, tube, false);
      if (st.quench > 0.01) ring(c, xq, cy, r, '#3d566f', null, tube * 0.7, false);
      glow(c, xr - r * 0.6, cy, r * 4.4, 0.5 * st.heat);

      const lg = c.createLinearGradient(x0, 0, x1, 0);
      for (let i = 0; i <= 60; i++) {
        const col = surface(x0 + (i / 60) * (x1 - x0));
        lg.addColorStop(i / 60, `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`);
      }
      c.save();
      c.beginPath();
      c.roundRect(x0, cy - r * 0.68, s0 - x0 + 2, r * 1.36, 3);
      c.roundRect(s0, cy - r, s1 - s0, r * 2, 3);
      c.roundRect(s1 - 2, cy - r * 0.68, x1 - s1 + 2, r * 1.36, 3);
      c.clip();
      c.fillStyle = lg; c.fillRect(x0, cy - r, x1 - x0, r * 2);
      roundBar(c, x0, cy - r, x1 - x0, r * 2);
      // A scribed line coming round shows the shaft is turning
      const a = time * 3.2, vis = Math.cos(a);
      if (vis > 0) {
        c.strokeStyle = `rgba(255,255,255,${0.16 * vis})`; c.lineWidth = 1;
        c.beginPath(); c.moveTo(x0, cy + Math.sin(a) * r * 0.96); c.lineTo(x1, cy + Math.sin(a) * r * 0.96); c.stroke();
      }
      c.restore();

      if (st.quench > 0.01) {
        c.strokeStyle = `rgba(150,196,255,${0.7 * st.quench})`; c.lineWidth = 1.4; c.lineCap = 'round';
        for (let i = 0; i < 9; i++) {
          const ph = (time * 2.4 + i * 0.37) % 1;
          for (const side of [-1, 1]) {
            const yA = cy + side * r * 1.42, yB = cy + side * r * 1.02;
            const xa = xq - i * 0.5 - ph * r * 0.5, y = lerp(yA, yB, ph);
            c.beginPath(); c.moveTo(xa, y); c.lineTo(xa - r * 0.12, y + (yB - yA) * 0.22); c.stroke();
          }
        }
        if (Math.random() < 0.5 * st.quench) puffs.push({ x: xq - r * 0.4, y: cy - r, vx: -8 - Math.random() * 14, vy: -22 - Math.random() * 24, life: 1 });
      }
      puffs = puffs.filter((p) => p.life > 0);
      for (const p of puffs) {
        p.x += p.vx / 60; p.y += p.vy / 60; p.life -= 0.014;
        c.fillStyle = `rgba(200,214,226,${0.1 * p.life})`;
        c.beginPath(); c.arc(p.x, p.y, r * (0.2 + (1 - p.life) * 0.55), 0, Math.PI * 2); c.fill();
      }
      if (st.quench > 0.01) ring(c, xq, cy, r, '#6f93b8', '#b9d4ee', tube * 0.7, true);
      ring(c, xr, cy, r, COPPER, COPPER_LIT, tube, true);

      // Hardened length, drawn as a gauge under the shaft
      const by = cy + r * 2.1, done = Math.max(0, Math.min(xq, s1) - s0);
      c.fillStyle = 'rgba(231,234,231,0.14)'; c.fillRect(s0, by, s1 - s0, 4);
      if (st.scan > 0.02 && done > 0) { c.fillStyle = '#8fb6ff'; c.fillRect(s0, by, done, 4); }
      c.globalAlpha = 1;
      return [round5(30 + (PEAK - 30) * st.heat), String(Math.round((done / (s1 - s0)) * 100))];
    },
  };
}

/* 2. Billet heating for forging ------------------------------------------- */
function forge(): Scene {
  const st: St = { push: 0, ram: 0, heat: 0, count: 0, flash: 0, part: 1, step: 0 };
  const CYCLES = 6;

  return {
    st,
    still: 5,
    build() {
      const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'none' } })
        .set(st, { push: 0, ram: 0, heat: 0, count: 0, flash: 0, step: 0 })
        .to(st, { part: 1, duration: 0.5 })
        .to(st, { heat: 1, duration: 1.2, ease: 'power2.out' });
      for (let i = 0; i < CYCLES; i++) {
        tl.set(st, { step: 0 })
          .to(st, { push: 1, ram: 1, duration: 0.75, ease: 'power2.inOut' })
          // The row has moved on one place; start the next stroke from the same picture
          .set(st, { push: 0, count: i + 1, step: 1 })
          .to(st, { ram: 0, duration: 0.4, ease: 'power1.in' })
          .set(st, { step: 2 })
          .to(st, { flash: 1, duration: 0.15 })
          .to(st, { flash: 0, duration: 0.55 });
      }
      return tl.to(st, { heat: 0, duration: 0.6 }).to(st, { part: 0, duration: 0.5 }, '+=0.3');
    },
    draw({ c, W, H, cy, r }, time) {
      const bh = r * 1.25, bl = bh * 2.2, step = bl + 5;
      const start = W * 0.05, c0 = W * 0.3, c1 = W * 0.62;
      const pitch = bh * 0.46, R = bh * 0.86, tube = bh * 0.2, top = cy - bh / 2;
      const turns = Math.max(4, Math.floor((c1 - c0) / pitch)), span = turns * pitch;
      const tempAt = (x: number) => {
        const u = clamp((x - c0) / span);
        let t = 30 + 1220 * (1 - Math.pow(1 - u, 1.7));
        if (x > c0 + span) t -= ((x - c0 - span) / Math.max(1, W - c0 - span)) * 80;
        return 30 + (t - 30) * st.heat;
      };

      c.globalAlpha = st.part;
      // Roller table
      c.strokeStyle = 'rgba(169,180,190,0.28)'; c.lineWidth = 1;
      const railY = cy + bh / 2 + 7, turn = (st.count + st.push) * (step / 6);
      for (let x = start + 30; x < W; x += 74) {
        if (x > c0 - 26 && x < c0 + span + 26) continue;
        c.beginPath(); c.arc(x, railY, 6, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(x, railY); c.lineTo(x + Math.cos(turn + x) * 6, railY + Math.sin(turn + x) * 6); c.stroke();
      }
      // Pusher ram
      c.fillStyle = FIXTURE; c.fillRect(0, cy - bh * 0.75, start * 0.5, bh * 1.5);
      c.fillStyle = '#5a6a7a'; c.fillRect(start * 0.5, cy - bh * 0.16, start * 0.5 + st.ram * step - 4, bh * 0.32);
      c.fillRect(start + st.ram * step - 6, cy - bh * 0.42, 6, bh * 0.84);

      strand(c, c0, cy + R, c0, H + 10, tube, COPPER_BACK);
      strand(c, c0 + span + pitch / 2, cy + R, c0 + span + pitch / 2, H + 10, tube, COPPER_BACK);
      for (let i = 0; i < turns; i++) strand(c, c0 + i * pitch + pitch / 2, cy + R, c0 + (i + 1) * pitch, cy - R, tube, COPPER_BACK);

      // Light from the hot bars
      for (let x = c0 + span * 0.45; x < W; x += bh * 1.6) glow(c, x, cy, bh * 2.4, 0.2 * clamp((tempAt(x) - 560) / 600), '255,150,40');

      // Billets: the newest one drops in as the ram draws back
      const off = st.push * step;
      for (let k = 0; start + off + k * step < W; k++) {
        const x = start + off + k * step;
        c.save();
        c.globalAlpha = st.part * (k === 0 && st.push === 0 ? 1 - st.ram : 1);
        c.beginPath(); c.roundRect(x, top, bl, bh, 3); c.clip();
        const lg = c.createLinearGradient(x, 0, x + bl, 0);
        lg.addColorStop(0, tempCSS(tempAt(x))); lg.addColorStop(1, tempCSS(tempAt(x + bl)));
        c.fillStyle = lg; c.fillRect(x, top, bl, bh);
        roundBar(c, x, top, bl, bh);
        c.restore();
      }
      c.globalAlpha = st.part;
      for (let i = 0; i <= turns; i++) strand(c, c0 + i * pitch, cy - R, c0 + i * pitch + pitch / 2, cy + R, tube, COPPER, COPPER_LIT);

      // Pyrometer over the exit
      const px = c0 + span + bl * 0.95, py = cy - bh * 2.1;
      c.fillStyle = FIXTURE; c.fillRect(px - bh * 0.3, py - bh * 0.5, bh * 0.6, bh * 0.5);
      c.strokeStyle = `rgba(255,${200 - st.flash * 60},${120 - st.flash * 80},${0.35 + st.flash * 0.65})`;
      c.lineWidth = 1 + st.flash * 1.5; c.setLineDash([4, 5]);
      c.beginPath(); c.moveTo(px, py); c.lineTo(px, top); c.stroke(); c.setLineDash([]);
      c.globalAlpha = 1;

      const exit = 30 + 1220 * st.heat + (st.heat > 0.99 ? Math.sin(time * 2.3) * 4 : 0);
      return [String(Math.round(exit)), String(Math.round(st.count))];
    },
  };
}

/* 3. Melting furnace ------------------------------------------------------ */
function melt(): Scene {
  const st: St = { charge: 0, temp: 30, melted: 0, stir: 0, tilt: 0, level: 0, pour: 0, ladle: 0, part: 1, step: 0 };
  // Scrap pieces: [x, y, w, h, tilt] in units of the cavity half-width
  const scrap = [[-0.55, 0.55, 0.5, 0.22, 0.3], [0.2, 0.7, 0.6, 0.2, -0.2], [-0.2, 0.2, 0.42, 0.26, -0.5], [0.5, 0.25, 0.36, 0.3, 0.6],
    [-0.5, -0.15, 0.5, 0.2, 0.15], [0.15, -0.25, 0.55, 0.24, -0.35], [-0.1, -0.6, 0.6, 0.2, 0.4]];

  return {
    st,
    still: 7,
    build() {
      return gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'none' } })
        .set(st, { charge: 0, temp: 30, melted: 0, stir: 0, tilt: 0, level: 0, pour: 0, ladle: 0, step: 0 })
        .to(st, { part: 1, duration: 0.5 })
        .to(st, { charge: 1, duration: 1.1, ease: 'power2.in' })
        .to(st, { temp: 1600, duration: 4.6, ease: 'power1.out' }, 'heat')
        .to(st, { melted: 1, duration: 3.2, ease: 'power1.inOut' }, 'heat+=1.4')
        .to(st, { stir: 1, duration: 1 }, 'heat+=3.4')
        .set(st, { step: 1 }, 'heat+=4.6')
        .set(st, { step: 2 }, 'heat+=6.6')
        // Tilt until the bath reaches the lip, then keep tilting to pour it out
        .to(st, { tilt: 0.5, level: 1, duration: 1.4, ease: 'power2.inOut' }, 'heat+=6.6')
        .to(st, { tilt: 1, pour: 1, ladle: 1, duration: 2.4, ease: 'power1.inOut' })
        .to(st, { pour: 0, duration: 0.3 })
        .to(st, { tilt: 0, stir: 0, duration: 1.3, ease: 'power2.inOut' })
        .to(st, { part: 0, duration: 0.5 }, '+=0.6');
    },
    draw({ c, W, H }, time) {
      const s = Math.min(H * 0.2, W * 0.1);            // cavity half-width
      const cx = W * 0.42, hh = s * 1.15;               // cavity half-height
      const cy = H * 0.62;                              // sits low so the tilted body stays in frame
      const wall = s * 0.3;
      const pivot = { x: cx + s + wall, y: cy - hh };   // pouring lip
      const angle = st.tilt * 0.8;                      // radians, up to about 46 degrees
      const cavity = () => { c.beginPath(); c.roundRect(cx - s, cy - hh, s * 2, hh * 2, [0, 0, s * 0.45, s * 0.45]); };
      const hot = tempCSS(st.temp);
      const lit = clamp((st.temp - 560) / 700);

      c.globalAlpha = st.part;

      // Ladle waiting under the lip
      const lx = pivot.x + s * 1.25, ly = H * 0.94, lw = s * 0.62, lh = s * 0.95;
      c.fillStyle = '#3a424c'; c.beginPath(); c.roundRect(lx - lw - 6, ly - lh, lw * 2 + 12, lh + 6, [0, 0, 8, 8]); c.fill();
      c.fillStyle = '#070c12'; c.fillRect(lx - lw, ly - lh, lw * 2, lh);
      if (st.ladle > 0) { c.fillStyle = tempCSS(1560); c.fillRect(lx - lw, ly - lh * 0.82 * st.ladle, lw * 2, lh * 0.82 * st.ladle); }
      glow(c, lx, ly - lh * 0.5, s * 1.6, 0.3 * st.ladle, '255,180,70');

      glow(c, cx, cy, s * 3.6, 0.42 * lit * (1 - st.ladle * 0.6), '255,140,40');

      // Furnace body turns about the lip
      c.save();
      c.translate(pivot.x, pivot.y); c.rotate(angle); c.translate(-pivot.x, -pivot.y);
      // Coil in section, either side of the lining
      for (let i = 0; i < 6; i++) {
        const y = cy - hh * 0.82 + i * ((hh * 1.64) / 5), rad = s * 0.13;
        for (const side of [-1, 1]) {
          const x = cx + side * (s + wall + rad * 1.5);
          c.fillStyle = COPPER; c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#070c12'; c.beginPath(); c.arc(x, y, rad * 0.45, 0, Math.PI * 2); c.fill();
        }
      }
      // Lining with its pouring spout
      c.fillStyle = '#3a424c';
      c.beginPath(); c.roundRect(cx - s - wall, cy - hh, (s + wall) * 2, hh * 2 + wall, [0, 0, s * 0.6, s * 0.6]); c.fill();
      c.beginPath(); c.moveTo(pivot.x - wall, cy - hh); c.lineTo(pivot.x + wall * 0.7, cy - hh - wall * 0.5); c.lineTo(pivot.x, cy - hh + wall); c.closePath(); c.fill();
      c.fillStyle = '#070c12'; cavity(); c.fill();

      // Scrap, sinking into the bath as it melts
      c.save(); cavity(); c.clip();
      const drop = (1 - st.charge) * hh * 2.4;
      scrap.forEach(([x, y, w, h, a], i) => {
        const gone = clamp(st.melted * 1.5 - i * 0.07);
        if (gone >= 1) return;
        c.save();
        c.translate(cx + x * s, cy + y * hh - drop * (1 + i * 0.12) + gone * hh * 0.3);
        c.rotate(a);
        c.globalAlpha = st.part * (1 - gone);
        c.fillStyle = tempCSS(Math.min(st.temp, 1250));
        c.fillRect((-w * s) / 2, (-h * s) / 2, w * s, h * s);
        c.restore();
      });
      c.restore();

      // The bath stays level while the furnace turns, so fill it in page coordinates
      if (st.melted > 0.02) {
        const settled = cy + hh - hh * 1.5 * st.melted;             // surface when upright
        const emptied = cy + hh * 1.2;                               // what is left after the pour
        let surface = lerp(settled, pivot.y + 3, st.level);
        if (st.ladle >= 1) surface = lerp(emptied, pivot.y + 3, clamp(st.tilt));  // tilting back, nearly empty
        c.save(); cavity(); c.clip();
        c.translate(pivot.x, pivot.y); c.rotate(-angle); c.translate(-pivot.x, -pivot.y);
        c.fillStyle = hot;
        c.beginPath();
        const span = s * 6, x0 = cx - span, bulge = s * 0.1 * st.stir * (1 - st.tilt);
        c.moveTo(x0, surface);
        // The field lifts the middle of the bath
        c.quadraticCurveTo(cx, surface - bulge * 2 + Math.sin(time * 3) * bulge * 0.25, cx + span, surface);
        c.lineTo(cx + span, surface + span); c.lineTo(x0, surface + span); c.closePath(); c.fill();
        // Stirring: two loops turning in the bath
        if (st.stir > 0.05 && st.tilt < 0.2) {
          c.strokeStyle = `rgba(120,40,10,${0.5 * st.stir})`; c.lineWidth = 2; c.setLineDash([6, 8]);
          c.lineDashOffset = -time * 26;
          for (const side of [-1, 1]) {
            c.beginPath(); c.ellipse(cx + side * s * 0.45, (surface + cy + hh) / 2, s * 0.3, Math.max(4, (cy + hh - surface) * 0.32), 0, 0, Math.PI * 2);
            c.lineDashOffset = -time * 26 * side; c.stroke();
          }
          c.setLineDash([]);
        }
        c.restore();
      }
      c.restore();

      // Stream from the lip into the ladle
      if (st.pour > 0.02) {
        c.strokeStyle = tempCSS(1580); c.lineWidth = s * 0.16 * st.pour; c.lineCap = 'round';
        c.beginPath(); c.moveTo(pivot.x + 2, pivot.y + 2);
        c.quadraticCurveTo(lx - lw * 0.2, pivot.y + s * 0.2, lx - lw * 0.1, ly - lh * 0.82 * st.ladle - 2);
        c.stroke();
        glow(c, lx, pivot.y + (ly - pivot.y) * 0.5, s * 1.4, 0.25 * st.pour, '255,200,110');
      }
      c.globalAlpha = 1;
      return [round5(st.temp), String(Math.round(st.melted * 100))];
    },
  };
}

/* 4. High-frequency tube welding (seen from above) ------------------------ */
function weld(): Scene {
  const st: St = { speed: 0, power: 0, part: 1, step: 0 };
  let sparks: Puff[] = [];
  let travel = 0, last = 0;

  return {
    st,
    still: 5,
    build() {
      return gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'none' } })
        .set(st, { speed: 0, power: 0, step: 0 })
        .to(st, { part: 1, duration: 0.5 })
        .to(st, { speed: 1, duration: 1.2, ease: 'power2.out' })
        .set(st, { step: 1 }, '+=1.4')
        .to(st, { power: 1, duration: 1.4, ease: 'power2.out' })
        .set(st, { step: 2 }, '+=2.6')
        .to(st, { power: 0, duration: 0.8 }, '+=3.2')
        .to(st, { speed: 0, duration: 0.9, ease: 'power2.in' })
        .to(st, { part: 0, duration: 0.5 }, '+=0.2');
    },
    draw({ c, W, H, cy, r }, time) {
      const R = r * 1.15;                       // tube half-width as drawn
      const xc = W * 0.36, xa = W * 0.6;        // work coil, weld point
      const gap0 = R * 0.62;                    // half-opening of the strip at the left edge
      const gapAt = (x: number) => (x >= xa ? 0 : gap0 * (1 - x / xa));
      const edgeTemp = (x: number) => 30 + 1370 * st.power * Math.pow(clamp((x - xc) / (xa - xc)), 1.5);
      const dt = Math.min(0.05, Math.max(0, time - last)); last = time;
      travel += dt * st.speed * 90;

      c.globalAlpha = st.part;
      ring(c, xc, cy, R, COPPER_BACK, null, R * 0.26, false);
      c.strokeStyle = COPPER_BACK; c.lineWidth = R * 0.26;
      c.beginPath(); c.moveTo(xc, cy - R * 1.5); c.lineTo(xc, -10); c.stroke();

      // Squeeze rolls either side of the weld point
      const rr = R * 0.95;
      for (const side of [-1, 1]) {
        const y = cy + side * (R + rr - 2);
        c.fillStyle = FIXTURE; c.beginPath(); c.arc(xa, y, rr, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(169,180,190,0.35)'; c.lineWidth = 1.5;
        const a = (travel / rr) * side;
        for (let k = 0; k < 3; k++) {
          c.beginPath(); c.moveTo(xa, y); c.lineTo(xa + Math.cos(a + (k * Math.PI * 2) / 3) * rr * 0.85, y + Math.sin(a + (k * Math.PI * 2) / 3) * rr * 0.85); c.stroke();
        }
        c.fillStyle = '#5a6a7a'; c.beginPath(); c.arc(xa, y, rr * 0.16, 0, Math.PI * 2); c.fill();
      }

      // Tube body with the open vee
      c.save();
      c.beginPath(); c.rect(0, cy - R, W, R * 2); c.clip();
      c.fillStyle = 'rgb(104,113,122)'; c.fillRect(0, cy - R, W, R * 2);
      roundBar(c, 0, cy - R, W, R * 2);
      // Marks on the strip show it running through the mill
      c.strokeStyle = 'rgba(255,255,255,0.09)'; c.lineWidth = 1;
      for (let x = (travel % 46) - 46; x < W; x += 46) {
        c.beginPath(); c.moveTo(x, cy - R); c.lineTo(x + 5, cy - R * 0.55); c.moveTo(x, cy + R); c.lineTo(x + 5, cy + R * 0.55); c.stroke();
      }
      c.fillStyle = '#070c12';
      c.beginPath(); c.moveTo(0, cy - gap0); c.lineTo(xa, cy); c.lineTo(0, cy + gap0); c.closePath(); c.fill();
      c.restore();

      // Current path: the two edges, hotter toward the point where they meet
      const N = 26;
      for (const side of [-1, 1]) {
        for (let i = 0; i < N; i++) {
          const xA = xc + ((xa - xc) * i) / N, xB = xc + ((xa - xc) * (i + 1)) / N;
          const t = edgeTemp(xB);
          if (t < 430) continue;
          c.strokeStyle = tempCSS(t); c.lineWidth = 2 + 3.5 * clamp((t - 430) / 900); c.lineCap = 'round';
          c.beginPath(); c.moveTo(xA, cy + side * gapAt(xA)); c.lineTo(xB, cy + side * gapAt(xB)); c.stroke();
        }
      }
      glow(c, xa - R * 0.3, cy, R * 2.1, 0.42 * st.power, '255,170,60');

      // Welded seam, cooling as it runs out of the mill
      const seam = c.createLinearGradient(xa, 0, W, 0);
      const tip = 30 + 1370 * st.power;
      for (let i = 0; i <= 12; i++) {
        const t = 30 + (tip - 30) * Math.exp(-(i / 12) * 3.2);
        seam.addColorStop(i / 12, t > 430 ? tempCSS(t) : 'rgba(40,52,66,0.9)');
      }
      c.strokeStyle = seam; c.lineWidth = 3; c.lineCap = 'butt';
      c.beginPath(); c.moveTo(xa, cy); c.lineTo(W, cy); c.stroke();

      // Sparks thrown from the weld point
      if (st.power > 0.5 && st.speed > 0.3 && Math.random() < 0.8) {
        const a = (Math.random() - 0.5) * 2.2;
        sparks.push({ x: xa, y: cy, vx: Math.cos(a) * (140 + Math.random() * 160), vy: Math.sin(a) * (140 + Math.random() * 160), life: 1 });
      }
      sparks = sparks.filter((p) => p.life > 0);
      c.lineCap = 'round'; c.lineWidth = 1.4;
      for (const p of sparks) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 2.6;
        c.strokeStyle = `rgba(255,214,130,${clamp(p.life)})`;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); c.stroke();
      }

      ring(c, xc, cy, R, COPPER, COPPER_LIT, R * 0.26, true);
      c.globalAlpha = 1;
      return [round5(tip), String(Math.round(st.power * 100))];
    },
  };
}

const SCENES: Record<Kind, () => Scene> = { hardening, forge, melt, weld };

/* Player ------------------------------------------------------------------ */
function player(root: HTMLElement) {
  const canvas = root.querySelector('canvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kinds = (root.dataset.kinds || 'hardening').split(',') as Kind[];
  const $ = (s: string) => root.querySelector<HTMLElement>(s)!;
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-proc-step]'));
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-proc-tab]'));
  const toggle = root.querySelector<HTMLButtonElement>('[data-proc-toggle]')!;
  const env: Env = { c: ctx, W: 0, H: 0, cy: 0, r: 0 };
  let scene: Scene, tl: gsap.core.Timeline;
  let inView = false, userPaused = false;

  function measure() {
    const b = canvas!.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    env.W = b.width; env.H = b.height; env.cy = b.height / 2;
    // Narrow screens get a proportionally larger drawing
    env.r = Math.min(b.height * 0.16, b.width * (b.width < 600 ? 0.085 : 0.06), 52);
    canvas!.width = Math.round(b.width * dpr); canvas!.height = Math.round(b.height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function paint(time: number) {
    ctx!.clearRect(0, 0, env.W, env.H);
    const [a, b] = scene.draw(env, time);
    $('[data-proc-v0]').textContent = a;
    $('[data-proc-v1]').textContent = b;
    steps.forEach((el, i) => el.classList.toggle('is-on', i === Math.round(scene.st.step)));
  }

  function load(kind: Kind) {
    tl?.kill();
    const copy = processCopy[kind];
    scene = SCENES[kind]();
    tl = scene.build();
    $('[data-proc-l0]').textContent = copy.readouts[0];
    $('[data-proc-l1]').textContent = copy.readouts[1];
    $('[data-proc-u0]').textContent = copy.units[0];
    $('[data-proc-u1]').textContent = copy.units[1];
    steps.forEach((el, i) => {
      el.querySelector('h3')!.textContent = copy.steps[i].title;
      el.querySelector('p')!.textContent = copy.steps[i].text;
    });
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.procTab === kind)));
    if (reduced) { tl.seek(scene.still); paint(1); }
    else if (inView && !userPaused) tl.play();
    else paint(0);
  }

  measure();
  load(kinds[0]);
  tabs.forEach((t) => t.addEventListener('click', () => load(t.dataset.procTab as Kind)));

  if (reduced) {
    toggle.hidden = true;
  } else {
    gsap.ticker.add((time) => { if (inView) paint(time); });
    ScrollTrigger.create({
      trigger: root,
      start: 'top 85%',
      end: 'bottom 10%',
      onToggle: (self) => {
        inView = self.isActive;
        if (inView && !userPaused) tl.play(); else tl.pause();
      },
    });
    toggle.addEventListener('click', () => {
      userPaused = !userPaused;
      toggle.textContent = userPaused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-pressed', String(userPaused));
      if (userPaused) tl.pause(); else if (inView) tl.play();
    });
  }
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = window.setTimeout(() => { measure(); paint(1); }, 120); });
}

document.querySelectorAll<HTMLElement>('[data-proc]').forEach(player);
