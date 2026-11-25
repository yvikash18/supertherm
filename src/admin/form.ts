// Builds an editing form from the shape of a piece of content.
// The form writes straight into the given data object, so the caller always
// holds the current value and only needs to know that something changed.
import { emptyOf, type Template } from '../data/shape';
import { CHOICES, FIELD_HELP, IMAGE_PATHS, ITEM_NAMES, LONG_KEYS, PAIR_PATHS, PATH_HELP, PATH_LABELS, humanise } from './hints';

export interface FormCtx {
  /** Called after every edit. */
  onChange: () => void;
  /** Uploads a file and resolves to its public address. Absent when uploads are unavailable. */
  upload?: (file: File) => Promise<string>;
  /** Why uploads are unavailable, shown next to image fields. */
  uploadNote?: string;
}

type Holder = Record<string, any> | any[];
type Key = string | number;

let uid = 0;
const nextId = () => `f${++uid}`;

// Which list entries are expanded, kept across redraws (keyed by the entry object itself).
const openItems = new WeakMap<object, boolean>();

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | boolean | undefined> = {},
  ...children: (Node | string | null | undefined)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k === 'class') node.className = String(v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) if (c != null) node.append(c);
  return node;
}

function iconButton(label: string, glyph: string, onClick: () => void, disabled = false) {
  const b = el('button', { type: 'button', class: 'cx-icon', 'aria-label': label, title: label }, glyph);
  b.disabled = disabled;
  b.addEventListener('click', onClick);
  return b;
}

const isStr = (t: Template | null | undefined) => !!t && t.t === 'string';
const isStrList = (t: Template | null | undefined) => !!t && t.t === 'list' && (isStr(t.item) || t.item === null);
const isMatrix = (t: Template | null | undefined) => !!t && t.t === 'list' && !!t.item && t.item.t === 'list' && isStrList(t.item);
/** An object holding a table: { headers: string[], rows: string[][], ...other fields }. */
const isTableObject = (t: Template) =>
  t.t === 'object' && isStrList(t.fields.headers) && !!t.fields.rows && (isMatrix(t.fields.rows) || isStrList(t.fields.rows));

const itemName = (key: Key | undefined) => (typeof key === 'string' && ITEM_NAMES[key]) || 'item';

function titleOf(item: any, fallback: string) {
  if (item && typeof item === 'object') {
    for (const k of ['name', 'title', 'city', 'label', 'quote', 'src']) {
      const v = item[k];
      if (typeof v === 'string' && v.trim()) return v.length > 70 ? v.slice(0, 67) + '…' : v;
    }
  }
  return fallback;
}

// ------------------------------------------------------------------ leaves

function textField(holder: Holder, key: Key, label: string, path: string, ctx: FormCtx, bare = false): HTMLElement {
  const h = holder as any;
  const id = nextId();
  const value: string = h[key] ?? '';
  const name = String(key);
  const choices = CHOICES[path];
  const long = !bare && (LONG_KEYS.has(name) || value.length > 80 || value.includes('\n'));
  let input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  if (choices) {
    input = el('select', { id, class: 'input cx-input' });
    for (const c of choices.includes(value) || !value ? choices : [value, ...choices]) {
      input.append(el('option', { value: c, selected: c === value }, c));
    }
  } else if (long) {
    input = el('textarea', { id, class: 'input cx-input', rows: String(Math.min(8, Math.max(2, Math.ceil(value.length / 70)))) });
    input.value = value;
  } else {
    const type = /email/i.test(name) ? 'email' : 'text';
    input = el('input', { id, class: 'input cx-input', type, spellcheck: /email|href|slug|src|image|Raw$/.test(name) ? 'false' : undefined });
    input.value = value;
  }
  input.addEventListener('input', () => {
    h[key] = input.value;
    ctx.onChange();
  });
  if (bare) {
    input.setAttribute('aria-label', label);
    return input;
  }
  const help = PATH_HELP[path] || FIELD_HELP[name];
  const wrap = el('div', { class: `field cx-field${long ? ' cx-wide' : ''}` }, el('label', { for: id }, label), input);
  if (help) {
    const hid = nextId();
    input.setAttribute('aria-describedby', hid);
    wrap.append(el('p', { class: 'note', id: hid }, help));
  }
  return wrap;
}

function imageField(holder: Holder, key: Key, label: string, ctx: FormCtx, bare = false): HTMLElement {
  const h = holder as any;
  const id = nextId();
  const input = el('input', { id, class: 'input cx-input', type: 'text', spellcheck: 'false', placeholder: '/assets/photo.jpg or https://…' });
  input.value = h[key] ?? '';
  if (bare) input.setAttribute('aria-label', label);
  const thumb = el('img', { class: 'cx-thumb', alt: '', loading: 'lazy' });
  const status = el('span', { class: 'note', role: 'status' });
  const show = () => {
    const v = input.value.trim();
    thumb.hidden = !v;
    if (v) thumb.src = v;
  };
  thumb.addEventListener('error', () => (thumb.hidden = true));
  input.addEventListener('input', () => {
    h[key] = input.value;
    show();
    ctx.onChange();
  });
  show();

  const file = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/avif,image/gif', hidden: true });
  const pick = el('button', { type: 'button', class: 'btn btn-line btn-sm' }, 'Upload');
  if (!ctx.upload) {
    pick.disabled = true;
    pick.title = ctx.uploadNote || 'Upload is not available';
  }
  pick.addEventListener('click', () => file.click());
  file.addEventListener('change', async () => {
    const f = file.files?.[0];
    file.value = '';
    if (!f || !ctx.upload) return;
    pick.disabled = true;
    status.textContent = 'Uploading…';
    status.classList.remove('cx-bad');
    try {
      input.value = await ctx.upload(f);
      h[key] = input.value;
      show();
      ctx.onChange();
      status.textContent = 'Uploaded. Save to keep it.';
    } catch (e: any) {
      status.textContent = e?.message || 'Upload failed.';
      status.classList.add('cx-bad');
    } finally {
      pick.disabled = false;
    }
  });
  const row = el('div', { class: 'cx-image' }, thumb, input, pick, file);
  if (bare) return el('div', { class: 'cx-image-wrap' }, row, status);
  return el('div', { class: 'field cx-field cx-wide' }, el('label', { for: id }, label), row, status);
}

function numberField(holder: Holder, key: Key, label: string, ctx: FormCtx): HTMLElement {
  const h = holder as any;
  const id = nextId();
  const input = el('input', { id, class: 'input cx-input', type: 'number', step: 'any', inputmode: 'decimal' });
  input.value = String(h[key] ?? 0);
  input.addEventListener('input', () => {
    const n = input.valueAsNumber;
    h[key] = Number.isFinite(n) ? n : 0;
    ctx.onChange();
  });
  return el('div', { class: 'field cx-field' }, el('label', { for: id }, label), input);
}

function checkField(holder: Holder, key: Key, label: string, ctx: FormCtx): HTMLElement {
  const h = holder as any;
  const id = nextId();
  const input = el('input', { id, type: 'checkbox', class: 'cx-check' });
  input.checked = !!h[key];
  input.addEventListener('change', () => {
    h[key] = input.checked;
    ctx.onChange();
  });
  return el('div', { class: 'cx-checkrow cx-wide' }, input, el('label', { for: id }, label));
}

function jsonField(holder: Holder, key: Key, label: string, ctx: FormCtx): HTMLElement {
  const h = holder as any;
  const id = nextId();
  const input = el('textarea', { id, class: 'input cx-input cx-mono', rows: '6', spellcheck: 'false' });
  input.value = JSON.stringify(h[key] ?? null, null, 2);
  const msg = el('p', { class: 'note' }, 'This part has an unusual shape, so it is edited as JSON.');
  input.addEventListener('input', () => {
    try {
      h[key] = JSON.parse(input.value);
      msg.textContent = 'This part has an unusual shape, so it is edited as JSON.';
      msg.classList.remove('cx-bad');
      ctx.onChange();
    } catch {
      msg.textContent = 'Not valid JSON yet. The last valid version is kept.';
      msg.classList.add('cx-bad');
    }
  });
  return el('div', { class: 'field cx-field cx-wide' }, el('label', { for: id }, label), input, msg);
}

// ------------------------------------------------------------------ lists

/** Up / down / remove controls for entry `i` of `list`. `after` redraws and restores focus. */
function rowControls(list: any[], i: number, what: string, after: (focus: { index: number; control: string } | null) => void) {
  const move = (d: number) => () => {
    const j = i + d;
    [list[i], list[j]] = [list[j], list[i]];
    after({ index: j, control: d < 0 ? 'up' : 'down' });
  };
  const up = iconButton(`Move ${what} up`, '↑', move(-1), i === 0);
  const down = iconButton(`Move ${what} down`, '↓', move(1), i === list.length - 1);
  const remove = iconButton(`Remove ${what}`, '✕', () => {
    list.splice(i, 1);
    after(list.length ? { index: Math.min(i, list.length - 1), control: 'remove' } : null);
  });
  up.dataset.control = 'up';
  down.dataset.control = 'down';
  remove.dataset.control = 'remove';
  remove.classList.add('cx-danger');
  return el('div', { class: 'cx-controls' }, up, down, remove);
}

function refocus(body: HTMLElement, focus: { index: number; control: string } | null, fallback: HTMLElement) {
  if (!focus) return fallback.focus();
  const row = body.children[focus.index] as HTMLElement | undefined;
  const btn = row?.querySelector<HTMLButtonElement>(`:scope > .cx-controls [data-control="${focus.control}"], :scope > summary [data-control="${focus.control}"]`);
  if (btn && !btn.disabled) btn.focus();
  else (row?.querySelector<HTMLElement>('button:not(:disabled), input, textarea') ?? fallback).focus();
}

/**
 * "Add photos" button: pick several files at once; each is uploaded and added
 * to the list through `push`. Returns null where uploads are unavailable.
 */
function bulkAdd(ctx: FormCtx, push: (url: string, file: File) => void, done: () => void): HTMLElement | null {
  if (!ctx.upload) return null;
  const file = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/avif,image/gif', multiple: true, hidden: true });
  const pick = el('button', { type: 'button', class: 'btn btn-solid btn-sm' }, 'Add photos from your computer');
  const status = el('span', { class: 'note', role: 'status' });
  pick.addEventListener('click', () => file.click());
  file.addEventListener('change', async () => {
    const files = Array.from(file.files ?? []);
    file.value = '';
    if (!files.length || !ctx.upload) return;
    pick.disabled = true;
    status.classList.remove('cx-bad');
    let added = 0;
    const failed: string[] = [];
    for (const [n, f] of files.entries()) {
      status.textContent = `Uploading ${n + 1} of ${files.length}…`;
      try {
        push(await ctx.upload(f), f);
        added++;
      } catch (e: any) {
        failed.push(`${f.name}: ${e?.message || 'upload failed'}`);
      }
    }
    pick.disabled = false;
    if (added) { done(); ctx.onChange(); }
    status.textContent = `${added} added${added ? '. Save to keep them.' : '.'}${failed.length ? ' Not added: ' + failed.join('; ') : ''}`;
    status.classList.toggle('cx-bad', failed.length > 0);
  });
  return el('span', { class: 'cx-bulk' }, pick, file, status);
}

function simpleList(holder: Holder, key: Key, label: string, path: string, ctx: FormCtx): HTMLElement {
  const h = holder as any;
  if (!Array.isArray(h[key])) h[key] = [];
  const list: string[] = h[key];
  const what = itemName(key);
  const image = IMAGE_PATHS.has(`${path}.*`);
  const body = el('ol', { class: 'cx-list' });
  const add = el('button', { type: 'button', class: 'btn btn-line btn-sm' }, `Add ${what}`);
  const count = el('span', { class: 'cx-count' });

  const draw = (focus?: { index: number; control: string } | null) => {
    body.replaceChildren();
    count.textContent = String(list.length);
    list.forEach((_, i) => {
      const lab = `${humanise(what)} ${i + 1}`;
      const input = image ? imageField(list, i, lab, ctx, true) : textField(list, i, lab, `${path}.*`, ctx, true);
      const controls = rowControls(list, i, `${what} ${i + 1}`, (f) => {
        draw(f);
        ctx.onChange();
      });
      body.append(el('li', { class: 'cx-row' }, input, controls));
    });
    if (focus !== undefined) refocus(body, focus, add);
  };
  add.addEventListener('click', () => {
    list.push('');
    draw();
    ctx.onChange();
    body.lastElementChild?.querySelector<HTMLElement>('input, textarea')?.focus();
  });
  draw();
  const bulk = image ? bulkAdd(ctx, (url) => list.push(url), () => draw()) : null;
  return el('fieldset', { class: 'cx-group cx-wide' }, el('legend', {}, label, ' ', count), body, el('div', { class: 'cx-adders' }, ...(bulk ? [bulk] : []), add));
}

function cardList(holder: Holder, key: Key, label: string, tpl: Template | null, path: string, ctx: FormCtx): HTMLElement {
  const h = holder as any;
  if (!Array.isArray(h[key])) h[key] = [];
  const list: any[] = h[key];
  const what = itemName(key);
  const body = el('div', { class: 'cx-cards' });
  const add = el('button', { type: 'button', class: 'btn btn-line btn-sm' }, `Add ${what}`);
  const count = el('span', { class: 'cx-count' });

  const draw = (focus?: { index: number; control: string } | null) => {
    body.replaceChildren();
    count.textContent = String(list.length);
    list.forEach((item, i) => {
      const fallback = `${humanise(what)} ${i + 1}`;
      const name = el('span', { class: 'cx-card-title' }, titleOf(item, fallback));
      const controls = rowControls(list, i, titleOf(item, fallback), (f) => {
        draw(f);
        ctx.onChange();
      });
      const card = el('details', { class: 'cx-card' }, el('summary', {}, name, controls));
      card.open = !!(item && typeof item === 'object' && openItems.get(item));
      const inner = el('div', { class: 'cx-card-body' });
      let built = false;
      const build = () => {
        if (built) return;
        built = true;
        inner.append(renderNode(list, i, tpl, `${path}.*`, '', ctx, true));
      };
      if (card.open) build();
      card.addEventListener('toggle', () => {
        if (item && typeof item === 'object') openItems.set(item, card.open);
        if (card.open) build();
      });
      inner.addEventListener('input', () => (name.textContent = titleOf(list[i], fallback)));
      card.append(inner);
      body.append(card);
    });
    if (focus !== undefined) refocus(body, focus, add);
  };
  add.addEventListener('click', () => {
    const item = emptyOf(tpl);
    if (item && typeof item === 'object') openItems.set(item, true);
    list.push(item);
    draw();
    ctx.onChange();
    const last = body.lastElementChild as HTMLElement | null;
    last?.querySelector<HTMLElement>('.cx-card-body input, .cx-card-body textarea')?.focus();
    last?.scrollIntoView({ block: 'nearest' });
  });
  draw();
  // Lists of objects that carry a photo (the gallery) can be filled from the file picker too
  const imageKey = tpl && tpl.t === 'object' ? Object.keys(tpl.fields).find((k) => IMAGE_PATHS.has(`${path}.*.${k}`)) : undefined;
  const bulk = imageKey
    ? bulkAdd(
        ctx,
        (url) => {
          const item = emptyOf(tpl);
          item[imageKey] = url;
          if ('title' in item) item.title = `${humanise(what)} ${list.length + 1}`;
          list.push(item);
        },
        () => draw()
      )
    : null;
  return el('fieldset', { class: 'cx-group cx-wide' }, el('legend', {}, label, ' ', count), body, el('div', { class: 'cx-adders' }, ...(bulk ? [bulk] : []), add));
}

// ------------------------------------------------------------------ tables

/**
 * Grid editor. `headers` is null for a plain grid of rows; `fixed` gives column
 * names for a grid whose columns cannot be changed (label and value pairs).
 */
function tableEditor(rowsHolder: Holder, rowsKey: Key, headers: string[] | null, label: string, fixed: string[] | null, ctx: FormCtx): HTMLElement {
  const rh = rowsHolder as any;
  if (!Array.isArray(rh[rowsKey])) rh[rowsKey] = [];
  const rows: string[][] = rh[rowsKey];
  for (let i = 0; i < rows.length; i++) if (!Array.isArray(rows[i])) rows[i] = [String(rows[i] ?? '')];

  const table = el('table', { class: 'cx-table' });
  const scroll = el('div', { class: 'cx-table-scroll', tabindex: '0', role: 'group', 'aria-label': `${label} table` }, table);
  const addRow = el('button', { type: 'button', class: 'btn btn-line btn-sm' }, 'Add row');
  const addCol = el('button', { type: 'button', class: 'btn btn-line btn-sm' }, 'Add column');
  const width = () => (fixed ? fixed.length : Math.max(headers?.length ?? 0, ...rows.map((r) => r.length), 1));
  const changed = () => ctx.onChange();

  const cell = (arr: string[], c: number, aria: string) => {
    const input = el('input', { class: 'input cx-input cx-cell', type: 'text', 'aria-label': aria });
    input.value = arr[c] ?? '';
    input.addEventListener('input', () => {
      for (let k = arr.length; k < c; k++) arr[k] = '';
      arr[c] = input.value;
      changed();
    });
    return input;
  };

  const draw = (focus?: { index: number; control: string } | null) => {
    const w = width();
    table.replaceChildren();
    const head = el('tr');
    for (let c = 0; c < w; c++) {
      const th = el('th', { scope: 'col' });
      if (fixed) th.append(fixed[c]);
      else {
        const box = el('div', { class: 'cx-colhead' });
        if (headers) box.append(cell(headers, c, `Column ${c + 1} heading`));
        else box.append(el('span', { class: 'note' }, `Column ${c + 1}`));
        box.append(
          iconButton(`Remove column ${c + 1}`, '✕', () => {
            if (headers) headers.splice(c, 1);
            rows.forEach((r) => r.splice(c, 1));
            draw();
            changed();
            addCol.focus();
          }, w <= 1)
        );
        box.lastElementChild!.classList.add('cx-danger');
        th.append(box);
      }
      head.append(th);
    }
    head.append(el('th', { class: 'cx-ctl-col' }, el('span', { class: 'cx-sr' }, 'Row actions')));
    const tbody = el('tbody');
    rows.forEach((r, i) => {
      const tr = el('tr');
      for (let c = 0; c < w; c++) {
        const colName = fixed ? fixed[c] : headers?.[c] || `column ${c + 1}`;
        tr.append(el('td', {}, cell(r, c, `Row ${i + 1}, ${colName}`)));
      }
      const controls = rowControls(rows, i, `row ${i + 1}`, (f) => {
        draw(f);
        changed();
      });
      tr.append(el('td', { class: 'cx-ctl-col' }, controls));
      tbody.append(tr);
    });
    table.append(el('thead', {}, head), tbody);
    if (focus !== undefined) {
      const row = focus ? (tbody.children[focus.index] as HTMLElement | undefined) : undefined;
      const btn = row?.querySelector<HTMLButtonElement>(`[data-control="${focus?.control}"]`);
      if (btn && !btn.disabled) btn.focus();
      else (row?.querySelector<HTMLElement>('button:not(:disabled)') ?? addRow).focus();
    }
  };
  addRow.addEventListener('click', () => {
    rows.push(Array(width()).fill(''));
    draw();
    changed();
    table.querySelector<HTMLElement>('tbody tr:last-child input')?.focus();
  });
  addCol.addEventListener('click', () => {
    const w = width();
    if (headers) {
      for (let k = headers.length; k < w; k++) headers[k] = '';
      headers.push('');
    }
    rows.forEach((r) => {
      for (let k = r.length; k < w; k++) r[k] = '';
      r.push('');
    });
    draw();
    changed();
    (table.querySelector<HTMLElement>('thead th:nth-last-child(2) input') ?? table.querySelector<HTMLElement>('tbody tr td:nth-last-child(2) input'))?.focus();
  });
  draw();
  const actions = el('div', { class: 'cx-actions' }, addRow, fixed ? null : addCol);
  return el('fieldset', { class: 'cx-group cx-wide' }, el('legend', {}, label), scroll, actions);
}

// ------------------------------------------------------------------ dispatcher

/**
 * Render an editor for `holder[key]`.
 * `path` is the position in the content with list positions written as `*`
 * (for example `products.*.image`), used to look up hints.
 * `flat` renders an object's fields without a surrounding box.
 */
export function renderNode(holder: Holder, key: Key, tpl: Template | null, path: string, label: string, ctx: FormCtx, flat = false): HTMLElement {
  const h = holder as any;
  const value = h[key];
  const starPath = path.replace(/\.[^.]+$/, '.*');

  if (!tpl || tpl.t === 'any') return jsonField(holder, key, label, ctx);

  if (tpl.t === 'string') {
    if (value != null && typeof value !== 'string') h[key] = String(value);
    return IMAGE_PATHS.has(path) || IMAGE_PATHS.has(starPath) ? imageField(holder, key, label, ctx) : textField(holder, key, label, path, ctx);
  }
  if (tpl.t === 'number') return numberField(holder, key, label, ctx);
  if (tpl.t === 'boolean') return checkField(holder, key, label, ctx);

  if (tpl.t === 'list') {
    if (value != null && !Array.isArray(value)) return jsonField(holder, key, label, ctx);
    if (isMatrix(tpl)) return tableEditor(holder, key, null, label, PAIR_PATHS.has(path) ? ['Label', 'Value'] : null, ctx);
    if (isStrList(tpl)) return simpleList(holder, key, label, path, ctx);
    if (tpl.item && tpl.item.t === 'object') return cardList(holder, key, label, tpl.item, path, ctx);
    return jsonField(holder, key, label, ctx);
  }

  // object
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    if (value == null) h[key] = emptyOf(tpl);
    else return jsonField(holder, key, label, ctx);
  }
  const obj = h[key];
  const grid = el('div', { class: 'cx-grid' });
  const fields = (tpl as Extract<Template, { t: 'object' }>).fields;
  const table = isTableObject(tpl);
  if (table && !Array.isArray(obj.headers)) obj.headers = [];
  for (const [k, f] of Object.entries(fields)) {
    if (table && k === 'headers') continue;
    if (table && k === 'rows') {
      grid.append(tableEditor(obj, 'rows', obj.headers, 'Table', null, ctx));
      continue;
    }
    grid.append(renderNode(obj, k, f, `${path}.${k}`, PATH_LABELS[`${path}.${k}`] || humanise(k), ctx));
  }
  // Keys present in the data but not in the expected shape stay editable.
  for (const k of Object.keys(obj)) {
    if (!(k in fields)) grid.append(jsonField(obj, k, humanise(k), ctx));
  }
  if (flat || !label) return grid;
  return el('fieldset', { class: 'cx-group cx-wide' }, el('legend', {}, label), grid);
}
