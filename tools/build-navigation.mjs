import { readFile, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { renderHeader } from './site-header.mjs';
const root = new URL('../', import.meta.url);
const pageIds = {'index.html': 'home', 'ascendancies.html': 'ascendancies', 'mapping.html': 'mapping', 'kiln.html': 'kiln', 'damnation.html': 'damnation', 'updates.html': 'updates'};
for (const filename of await readdir(root)) {
  if (!(filename in pageIds) && !/^update-[a-z0-9-]+\.html$/.test(filename)) continue;
  const file = new URL(filename, root);
  let html = await readFile(file, 'utf8');
  const pattern = html.includes('<!-- site-header:start -->') ? /<!-- site-header:start -->[\s\S]*?<!-- site-header:end -->/ : /<header\b[\s\S]*?<\/header>/;
  if (!pattern.test(html)) throw new Error(`Missing header: ${filename}`);
  html = html.replace(pattern, () => renderHeader(pageIds[filename] || 'updates'));
  if (!/<body\b[^>]*\bid=/.test(html)) html = html.replace('<body', '<body id="top"');
  if (!html.includes('href="./navigation.css"')) html = html.replace('</head>', '<link rel="stylesheet" href="./navigation.css"><script defer src="./navigation.js"></script></head>');
  await writeFile(file, html);
}
console.log(`Shared site navigation generated in ${fileURLToPath(root)}`);
