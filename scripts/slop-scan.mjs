import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.join(process.cwd(), 'src');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|tsx|js|jsx|css)$/.test(entry.name)) files.push(full);
  }
}
walk(srcDir);

const bans = [
  ['em-dash', /\u2014/],
  ['purple-hex', /#(8b5cf6|a855f7|9333ea|7c3aed|6a30ea|c084fc|5227ff|8400ff|f472b6|c299ff|b497cf|ff9ffc)/i],
  ['beige', /\bbeige\b/i],
  ['uppercase-mono', /font-mono[^"']*uppercase|uppercase[^"']*font-mono/],
  ['external-image', /unsplash\.com|pexels\.com/i],
];

const hits = [];
for (const file of files) {
  const txt = fs.readFileSync(file, 'utf8');
  for (const [label, re] of bans) {
    if (re.test(txt)) hits.push({ file: path.relative(process.cwd(), file), label });
  }
}

if (hits.length > 0) {
  console.error('SLOP_SCAN_FAILED:', JSON.stringify(hits, null, 2));
  process.exit(1);
}
console.log(`SLOP_SCAN_PASSED: ${files.length} files clean`);
