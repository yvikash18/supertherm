// Password hashing shared by the Cloudflare backend and scripts/cms-admin.mjs.
// Plain JavaScript on purpose: it runs unchanged in Workers and in Node 20+.
//
// PBKDF2-HMAC-SHA-256 with a random 16-byte salt per user. The iteration count
// is stored with each hash so it can be raised later without locking anyone out.
// 100,000 is the highest count the Workers runtime accepts for PBKDF2.

export const PBKDF2_ITERATIONS = 100000;
export const MIN_PASSWORD_LENGTH = 10;

const enc = new TextEncoder();

export const toHex = (buf) =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');

export const fromHex = (hex) => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
};

export function randomHex(bytes) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

/** Derive the stored hash (hex) for a password. */
export async function derive(password, saltHex, iterations = PBKDF2_ITERATIONS) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password.normalize('NFKC')), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations },
    key,
    256
  );
  return toHex(bits);
}

/** New salt + hash for a password. */
export async function hashPassword(password) {
  const salt = randomHex(16);
  return { hash: await derive(password, salt, PBKDF2_ITERATIONS), salt, iterations: PBKDF2_ITERATIONS };
}

/** Compare two hex strings without leaking where they differ. */
export function constantTimeEqual(a, b) {
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function verifyPassword(password, row) {
  const got = await derive(password, row.pw_salt, row.pw_iter);
  return constantTimeEqual(got, row.pw_hash);
}

export async function sha256Hex(text) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}
