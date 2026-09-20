/**
 * যাচাই স্ক্রিপ্ট রানার
 *
 * lib/ এর TypeScript ফাইলগুলোতে extension-বিহীন relative import ব্যবহার করা হইয়াছে
 * (bundler resolution)। Node.js এর নিজস্ব ESM resolver-এ উহা চলে না, তাই এখানে
 * ফাইলগুলো একটি অস্থায়ী ফোল্ডারে কপি করিয়া import পাথে `.ts` যোগ করিয়া
 * `node --experimental-strip-types` দিয়া পরীক্ষা চালানো হয়।
 *
 * ব্যবহার: npm run verify
 */
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = path.join(root, '.verify-tmp');

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
cpSync(path.join(root, 'lib'), tmp, { recursive: true });
cpSync(path.join(root, 'scripts', 'verify.mts'), path.join(tmp, 'verify.mts'));

for (const file of readdirSync(tmp)) {
  if (!file.endsWith('.ts') && !file.endsWith('.mts')) continue;
  const full = path.join(tmp, file);
  const src = readFileSync(full, 'utf8').replace(
    /from '\.\/([A-Za-z0-9_-]+)'/g,
    "from './$1.ts'",
  );
  writeFileSync(full, src);
}

const res = spawnSync(
  process.execPath,
  ['--experimental-strip-types', path.join(tmp, 'verify.mts')],
  { stdio: 'inherit' },
);

rmSync(tmp, { recursive: true, force: true });
process.exit(res.status ?? 1);
