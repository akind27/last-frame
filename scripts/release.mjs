import { mkdir, copyFile, lstat, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = fileURLToPath(new URL('../',import.meta.url));
// Copy only named product files. Never copy the workspace or Git history recursively.
const files = ['README.md','NOTICE.md','LICENSE','index.html','package.json','.nvmrc','.editorconfig','.gitignore',
  'src/main.js','src/model.js','src/scenes.js','src/style.css','scripts/serve.mjs','scripts/check.mjs','scripts/release.mjs',
  'tests/model.test.js','tests/scenes.test.js','tests/session.test.js','public/fonts/Barlow-SemiBold.ttf','public/fonts/BarlowCondensed-ExtraBold.ttf','public/fonts/OFL.txt'];
const output = resolve(root,'dist',`last-frame-${Date.now()}`);
const hashes = {};
for (const file of files) {
  const source = resolve(root,file);
  if (!(await lstat(source)).isFile()) throw new Error(`Expected a regular file: ${file}`);
  const data = await readFile(source);
  hashes[file] = createHash('sha256').update(data).digest('hex');
}
await mkdir(output,{recursive:true});
for (const file of files) {
  const target = resolve(output,file);
  await mkdir(dirname(target),{recursive:true});
  await copyFile(resolve(root,file),target);
}
await writeFile(resolve(output,'SHA256SUMS'),Object.entries(hashes).map(([file,hash])=>`${hash}  ${file}`).join('\n')+'\n');
console.log(`Prepared ${files.length} allowlisted files in ${output}`);
console.log('Local candidate only. Review contents and license before publishing.');
