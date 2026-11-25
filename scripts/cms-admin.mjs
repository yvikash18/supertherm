// Create an admin for the content console, or reset an admin's password.
// There is no public sign-up and no reset email: this script is the only way.
//
//   npm run cms:admin -- someone@example.com            create, or reset the password
//   npm run cms:admin -- someone@example.com --remove   remove the admin
//
// It asks for the password (not shown), hashes it on this computer and writes a
// small SQL file. The password itself never leaves this computer. You then run
// the printed `wrangler d1 execute` command to apply it. Needs Node 20 or newer.
import { writeFileSync } from 'node:fs';
import { hashPassword, MIN_PASSWORD_LENGTH } from '../server/password.mjs';

const args = process.argv.slice(2);
const email = (args.find((a) => !a.startsWith('--')) || '').trim().toLowerCase();
const remove = args.includes('--remove');
const DB = 'supertherm-cms';
const OUT = '.cms-admin.sql';

if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
  console.error('Usage: npm run cms:admin -- someone@example.com [--remove]');
  process.exit(1);
}

function ask(question) {
  // CMS_ADMIN_PASSWORD lets automated tests skip the prompt.
  if (process.env.CMS_ADMIN_PASSWORD) return Promise.resolve(process.env.CMS_ADMIN_PASSWORD);
  if (!process.stdin.isTTY) {
    console.error('Run this in a terminal so the password can be typed without being shown.');
    process.exit(1);
  }
  return new Promise((resolve) => {
    const stdin = process.stdin;
    stdin.setRawMode(true); // before the prompt, so nothing typed is ever echoed
    process.stdout.write(question);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (chunk) => {
      // A paste or a fast typist can deliver several characters at once.
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n' || ch === '\u0004') {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off('data', onData);
          process.stdout.write('\n');
          return resolve(value);
        }
        if (ch === '\u0003') {
          stdin.setRawMode(false);
          process.stdout.write('\n');
          process.exit(130);
        }
        if (ch === '\u007f' || ch === '\b') value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on('data', onData);
  });
}

let sql;
if (remove) {
  sql = `DELETE FROM sessions WHERE admin_id IN (SELECT id FROM admins WHERE email = '${email}');
DELETE FROM admins WHERE email = '${email}';
`;
} else {
  const password = await ask(`Password for ${email} (at least ${MIN_PASSWORD_LENGTH} characters): `);
  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exit(1);
  }
  if (!process.env.CMS_ADMIN_PASSWORD) {
    const again = await ask('Type it again: ');
    if (again !== password) {
      console.error('The two passwords do not match.');
      process.exit(1);
    }
  }
  const { hash, salt, iterations } = await hashPassword(password);
  const now = new Date().toISOString();
  // Create the admin or replace the password, sign out their devices, clear any lockout.
  sql = `INSERT INTO admins (email, pw_hash, pw_salt, pw_iter, created_at, updated_at)
VALUES ('${email}', '${hash}', '${salt}', ${iterations}, '${now}', '${now}')
ON CONFLICT(email) DO UPDATE SET pw_hash = excluded.pw_hash, pw_salt = excluded.pw_salt, pw_iter = excluded.pw_iter, updated_at = excluded.updated_at;
DELETE FROM sessions WHERE admin_id IN (SELECT id FROM admins WHERE email = '${email}');
DELETE FROM login_attempts WHERE scope = 'email' AND key = '${email}';
`;
}

writeFileSync(OUT, sql, { mode: 0o600 });
console.log(`
Wrote ${OUT}. Apply it with one of:

  npx wrangler d1 execute ${DB} --remote --file=${OUT}     (the live database)
  npx wrangler d1 execute ${DB} --local  --file=${OUT}     (local testing)

Then delete ${OUT}. ${remove ? `${email} can no longer sign in.` : `${email} can now sign in at /admin.`}
`);
