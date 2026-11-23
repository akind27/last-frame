import { access, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const [major, minor] = process.versions.node.split('.').map(Number);
assert((major === 22 && minor >= 12) || major === 24, 'Use Node 22.12+ (22.x) or Node 24.x.');
const required = ['README.md','NOTICE.md','LICENSE','index.html','src/main.js','src/model.js','src/scenes.js','src/style.css',
  'scripts/serve.mjs','scripts/check.mjs','scripts/release.mjs','tests/model.test.js','tests/scenes.test.js','tests/session.test.js',
  'public/fonts/Barlow-SemiBold.ttf','public/fonts/BarlowCondensed-ExtraBold.ttf','public/fonts/OFL.txt'];
for (const path of required) {
  await access(resolve(root,path));
  if (/\.(m?js)$/.test(path)) execFileSync(process.execPath,['--check',resolve(root,path)]);
}
const pkg = JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
assert.equal(pkg.private,true);
assert.equal(Object.keys(pkg.dependencies ?? {}).length,0);
assert.equal(Object.keys(pkg.devDependencies ?? {}).length,0);
console.log(`PASS: Node ${process.version}; ${required.length} public files; JavaScript syntax; zero dependencies.`);
console.log('These checks do not require Git or private workspace documents.');
