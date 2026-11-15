const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('所有独立页面具有相同主导航，且仅当前所属页面高亮', () => {
  const expected = ['首页', '赛季更新', '服务器设定', '升华职业', '刷图系统', '炼狱熔炉', '天梯与构筑'];
  const pages = {'index.html':'首页', 'updates.html':'赛季更新', 'update-s2-season.html':'赛季更新', 'ascendancies.html':'升华职业', 'mapping.html':'刷图系统', 'kiln.html':'炼狱熔炉', 'damnation.html':'服务器设定'};
  let destinations;
  for (const [file, active] of Object.entries(pages)) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const nav = html.match(/<nav class="sg-main-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(nav, file);
    const links = [...nav.matchAll(/<a href="([^"]+)"([^>]*)>([^<]+)<\/a>/g)];
    assert.deepEqual(links.map(m => m[3]), expected, file);
    assert.deepEqual(links.filter(m => m[2].includes('aria-current="page"')).map(m => m[3]), [active], file);
    if (!destinations) destinations = links.map(m => m[1]);
    assert.deepEqual(links.map(m => m[1]), destinations, file);
    assert.ok(!links.some(m => m[1].startsWith('#')), 'page-local anchors must not replace global routes');
    assert.match(html, /href="\.\/navigation.css"/);
    assert.match(html, /src="\.\/navigation.js"/);
    assert.equal((html.match(/id="top"/g) || []).length, 1, file);
  }
});
