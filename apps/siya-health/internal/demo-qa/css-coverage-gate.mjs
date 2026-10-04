import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const html = fs.readFileSync(path.join(ROOT, 'employers/demo.html'), 'utf8');
const css = (html.match(/<style[^>]*>([\s\S]*?)<\/style>/i) || ['', ''])[1];
const defined = new Set();
for (const m of css.matchAll(/\.([A-Za-z_][\w-]*)/g)) defined.add(m[1]);

const used = new Set();
const tour = (html.match(/<section id="tour"[\s\S]*?<\/section>/) || [''])[0];
const script = (html.match(/<script>([\s\S]*?)<\/script>/) || ['', ''])[1];
const skip = new Set(['b','in','out','pop','grow','draw','fade','grp','on','active','parked','slide','frame','bar','link','start','ghost','press']);
function addClasses(str) {
  for (const c of String(str).split(/\s+/)) {
    if (/^[A-Za-z_][\w-]*$/.test(c) && !skip.has(c)) used.add(c);
  }
}
for (const m of tour.matchAll(/class="([^"]+)"/g)) addClasses(m[1]);
for (const m of script.matchAll(/class(?:Name)?=["'`]([^"'`]+)["'`]/g)) addClasses(m[1]);
for (const m of script.matchAll(/class=\\"([^\\]+)\\"/g)) addClasses(m[1]);
for (const m of script.matchAll(/classList\.(?:add|toggle)\(['"]([^'"]+)['"]/g)) {
  if (!skip.has(m[1])) used.add(m[1]);
}

const missing = [...used].filter((c) => !defined.has(c)).sort();
const outDir = path.join(ROOT, 'internal/demo-qa/walkthrough');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'css-coverage.json'), JSON.stringify({ used: used.size, missing }, null, 2));
fs.writeFileSync(path.join(outDir, 'css-coverage.md'), `# CSS coverage\n\nUsed: ${used.size}\nMissing: ${missing.length}\n\n${missing.length ? missing.map((c) => `- \`.${c}\``).join('\n') : '_Zero missing._'}\n`);
console.log('MISSING', missing.length);
missing.forEach((c) => console.log(' ', c));
process.exit(missing.length ? 1 : 0);
