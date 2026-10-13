// Pick a fresh patch version from existing tags, without requiring manual tags.
// package.json's version is the minimum; published releases advance automatically.
const fs = require('fs');
const { execFileSync } = require('child_process');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const parts = pkg.version.split('.').map(Number);
if (parts.length !== 3 || parts.some(n => !Number.isInteger(n) || n < 0)) {
  throw new Error('Expected package.json version in major.minor.patch format');
}
execFileSync('git', ['fetch', '--tags', '--force'], { stdio: 'inherit' });
const tags = execFileSync('git', ['tag', '--list'], { encoding: 'utf8' }).split(/\r?\n/);
let highest = -1;
for (const tag of tags) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(tag.trim());
  if (match && +match[1] === parts[0] && +match[2] === parts[1]) {
    highest = Math.max(highest, +match[3]);
  }
}
const next = `${parts[0]}.${parts[1]}.${Math.max(parts[2], highest + 1)}`;
pkg.version = next;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log(`Publishing version ${next}; GitHub Release tag v${next}`);
