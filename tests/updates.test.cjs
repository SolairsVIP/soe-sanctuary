const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/updates/index.json'), 'utf8'));

test('每篇文章保留Markdown稳定锚点，目录全部落到真实标题', () => {
  for (const entry of catalog.entries) {
    const source = fs.readFileSync(path.join(root, 'data/updates', entry.source), 'utf8');
    const html = fs.readFileSync(path.join(root, `update-${entry.id}.html`), 'utf8');
    for (const [, id] of source.matchAll(/<a id="([a-z0-9-]+)"><\/a>/g)) {
      assert.match(html, new RegExp(`<h[1-6] id="${id}">`), id);
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    assert.equal(ids.length, new Set(ids).size, 'no duplicate IDs');
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), id);
    assert.doesNotMatch(html, /&lt;a id=/, 'anchors must not appear as escaped content');
  }
});

test('静态正文含真实表格、下载源文件及正确内测标记', () => {
  for (const entry of catalog.entries) {
    const html = fs.readFileSync(path.join(root, `update-${entry.id}.html`), 'utf8');
    const source = fs.readFileSync(path.join(root, 'data/updates', entry.source), 'utf8');
    if (/^\|.*\|/m.test(source)) {
      assert.match(html, /<table>/);
      assert.match(html, /class="table-scroll"/);
    }
    for (const [, image] of source.matchAll(/!\[[^\]]*\]\((\.\/assets\/[^)]+)\)/g)) {
      assert.ok(fs.existsSync(path.resolve(root, image)), image);
      assert.ok(html.includes(`src="${image}"`), image);
    }
    assert.doesNotMatch(html, /&lt;br\s*\/?&gt;/);
    assert.ok(html.includes(`href="./data/updates/${entry.source}" download`));
    assert.ok(fs.existsSync(path.join(root, 'data/updates', entry.source)));
    if (entry.status === 'test') assert.match(html, /class="status-badge">内测/);
  }
});
