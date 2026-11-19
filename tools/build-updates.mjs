// Markdown is the source; generated pages work on the existing static host.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { marked } from 'marked';
import { renderHeader } from './site-header.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const contentDir = path.join(root, 'data/updates');
const catalog = JSON.parse(await readFile(path.join(contentDir, 'index.json'), 'utf8'));
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const typeNames = {season: '赛季说明', patch: '赛季中更新', test: '内测调整'};
const header = '<a class="skip-link" href="#main">跳到主要内容</a>' + renderHeader('updates');
const footer = `<footer class="updates-footer updates-shell"><span>流放圣所 <i>✦</i> SANCTUARY OF EXILE</span><a href="./updates.html">赛季更新档案</a><a href="#top">回到顶部 ↑</a></footer>`;
function page(title, description, body, article = false) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#100f0d"><meta name="description" content="${escape(description)}"><title>${escape(title)} · 流放圣所</title><link rel="stylesheet" href="./updates.css"><script defer src="./updates.js"></script></head><body id="top" data-view="${article ? 'article' : 'archive'}">${header}${body}${footer}</body></html>\n`;
}
const entryIds = new Set();
const cards = [];
for (const entry of catalog.entries) {
  if (!/^[a-z0-9-]+$/.test(entry.id) || entryIds.has(entry.id)) throw new Error('Invalid/duplicate entry id');
  entryIds.add(entry.id);
  const season = catalog.seasons.find(item => item.id === entry.season);
  if (!season || !typeNames[entry.type] || !['test', 'released'].includes(entry.status)) throw new Error(`Invalid entry: ${entry.id}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !Number.isFinite(Date.parse(entry.date))) throw new Error('Invalid date');
  const source = path.resolve(contentDir, entry.source);
  if (!source.startsWith(contentDir + path.sep) || path.extname(source) !== '.md') throw new Error('Invalid source path');
  let markdown = await readFile(source, 'utf8');
  // The website supplies its own title, metadata and responsive directory.
  markdown = markdown.replace(/^# .*\r?\n/, '').replace(/^> 内测整理稿[^\n]*\r?\n/m, '');
  markdown = markdown.replace(/## 目录[\s\S]*?(?=<a id=)/, '');
  const explicitIds = new Map();
  markdown = markdown.replace(/^<a id="([a-z0-9-]+)"><\/a>\s*\r?\n(#{1,6}) ([^\r\n]+)$/gm, (_, id, hashes, title) => {
    explicitIds.set(title, id);
    return `${hashes} ${title}`;
  });
  const tokens = marked.lexer(markdown, {gfm: true});
  let serial = 0;
  const toc = [];
  const ids = new Set();
  const renderer = new marked.Renderer();
  renderer.html = ({text}) => escape(text);
  renderer.heading = function(token) {
    const id = explicitIds.get(token.text) || `section-${++serial}`;
    if (ids.has(id)) throw new Error(`Duplicate heading id: ${id}`);
    ids.add(id);
    if (token.depth === 2) toc.push({id, label: token.text.replace(/\s+[A-Za-z].*$/, '')});
    return `<h${token.depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
  };
  renderer.link = function({href, tokens}) {
    const safe = /^(https?:|#|\.\/)/i.test(href);
    return safe ? `<a href="${escape(href)}">${this.parser.parseInline(tokens)}</a>` : this.parser.parseInline(tokens);
  };
  // Table cell line breaks are the only inline HTML supported by these notes.
  let html = marked.parser(tokens, {gfm: true, renderer}).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  html = html.replace('<p>[[MODEL_VIDEOS]]</p>', `<div class="model-videos" aria-label="玩家模型展示视频">
<article class="model-video"><h4>希尔瓦娜斯 · 亚马逊</h4><video controls preload="none" playsinline data-lazy-src="https://dev.wdjwxh.com/videos/sylvanas-amazon.mp4"><p>你的浏览器不支持视频播放。</p></video></article>
<article class="model-video"><h4>伊利丹 · 野蛮人</h4><video controls preload="none" playsinline data-lazy-src="https://dev.wdjwxh.com/videos/illidan-barbarian.mp4"><p>你的浏览器不支持视频播放。</p></video></article>
<article class="model-video"><h4>Tifa · 刺客</h4><video controls preload="none" playsinline data-lazy-src="https://dev.wdjwxh.com/videos/tifa-assassin.mp4"><p>你的浏览器不支持视频播放。</p></video></article>
</div>`);
  html = html.replace(/<table>/g, '<div class="table-scroll" tabindex="0" role="region" aria-label="更新数据表格"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/(<h2 id=)/g, '</section><section class="note-section">$1').replace(/^\s*<\/section>/, '') + '</section>';
  const status = entry.status === 'test' ? '内测' : '已上线';
  const tocHtml = toc.map(item => `<a href="#${escape(item.id)}">${escape(item.label)}</a>`).join('');
  const body = `<div class="reading-progress" aria-hidden="true"><span></span></div><main id="main" class="updates-shell article-main">
<a class="breadcrumb" href="./updates.html?season=${escape(season.id)}">← 赛季更新 <span>/ ${escape(season.name)}</span></a>
<section class="article-heading"><p class="updates-kicker">SEASON ${escape(season.label.slice(1))} <span>✦</span> PATCH NOTES</p><div class="entry-meta"><span class="status-badge">${status}</span><span>${typeNames[entry.type]}</span><time datetime="${entry.date}">${escape(entry.dateLabel || '更新日期')} ${entry.date.replaceAll('-', '.')}</time></div><h1>${escape(entry.title)}</h1><p>${escape(entry.summary)}</p><div class="article-actions"><span>${toc.length} 个章节</span></div><label class="article-search"><span>搜索本文</span><input id="article-search" type="search" placeholder="输入技能、装备或改动关键词" aria-label="搜索文章全文"></label><p id="article-search-status" role="status" hidden></p>${entry.status === 'test' ? '<p class="article-notice">当前为内测整理版本，调整内容仍可能变化，请以正式发布公告为准。</p>' : ''}</section>
<div class="reading-layout"><aside class="article-sidebar"><details open><summary>文章目录 <span>CONTENTS</span></summary><label class="toc-search"><span class="sr-only">筛选文章目录</span><input type="search" id="toc-search" placeholder="查找章节，例如：升华"></label><nav class="article-toc" aria-label="文章目录">${tocHtml}</nav><p class="toc-empty" hidden>没有匹配的章节</p></details></aside><article class="patch-content">${html}<p id="article-empty" hidden>没有找到相关改动，试试其他关键词或清空搜索。</p></article></div></main>`;
  const filename = `update-${entry.id}.html`;
  await writeFile(path.join(root, filename), page(entry.title, entry.summary, body, true));
  cards.push({...entry, seasonName: season.name, seasonLabel: season.label, filename});
}
cards.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
const cardHtml = cards.map(entry => `<a class="update-card" href="./${entry.filename}" data-season="${escape(entry.season)}" data-type="${escape(entry.type)}" data-search="${escape([entry.title, entry.summary, ...entry.tags].join(' ').toLowerCase())}"><div class="update-card-top"><span class="entry-season">${escape(entry.seasonLabel)} <i>/</i> ${escape(entry.seasonName)}</span><span class="status-badge">${entry.status === 'test' ? '内测' : '已上线'}</span></div><div class="update-card-body"><div><p class="updates-kicker">${typeNames[entry.type]} <span>·</span> ${entry.date.replaceAll('-', '.')}</p><h3>${escape(entry.title)}</h3><p>${escape(entry.summary)}</p><div class="entry-tags">${entry.tags.map(tag => `<span>${escape(tag)}</span>`).join('')}</div></div><span class="card-arrow" aria-hidden="true">↗</span></div><div class="update-card-bottom"><span>${escape(entry.dateLabel || '更新日期')} ${entry.date.replaceAll('-', '.')}</span><span>阅读更新说明 →</span></div></a>`).join('');
const seasons = catalog.seasons.map(s => `<button type="button" data-season="${escape(s.id)}" aria-pressed="false">${escape(s.label)} ${escape(s.name)}</button>`).join('');
const types = Object.entries(typeNames).map(([id, label]) => `<button type="button" data-type="${id}" aria-pressed="false">${label}</button>`).join('');
const body = `<main id="main"><section class="updates-hero"><div class="updates-hero-art" aria-hidden="true"></div><div class="updates-shell updates-hero-inner"><p class="updates-kicker">THE SEASON ARCHIVE <span>✦</span> 流放圣所</p><h1>每一次改变，<br><em>都是新的征途。</em></h1><p class="updates-intro">从赛季启程到每一次平衡调整，<br>在这里查阅流放圣所的更新记录。</p><div class="archive-facts"><span><b>${escape(cards[0]?.seasonLabel || "—")}</b> 最新收录赛季</span><span><b>${cards.length.toString().padStart(2, '0')}</b> 篇更新说明</span><span>赛季说明 · 赛季中更新 · 内测调整</span></div></div><div class="hero-issue" aria-hidden="true">II</div></section>
<section class="updates-shell archive-section" aria-labelledby="archive-title"><div class="archive-heading"><div><p class="updates-kicker">CHRONICLES OF SANCTUARY</p><h2 id="archive-title">赛季更新<span>档案</span></h2></div><label class="archive-search"><span aria-hidden="true">⌕</span><input id="update-search" type="search" placeholder="搜索标题、装备或更新主题" aria-label="搜索更新"></label></div><div class="season-tabs" role="group" aria-label="筛选赛季"><button type="button" data-season="all" aria-pressed="true">全部赛季</button>${seasons}</div><div class="archive-toolbar"><div class="type-tabs" role="group" aria-label="筛选更新类型"><button type="button" data-type="all" aria-pressed="true">全部更新</button>${types}</div><span id="result-count" role="status">${cards.length} 篇更新 · 最新在前</span></div><div class="update-list">${cardHtml}</div><div class="archive-empty" hidden><span aria-hidden="true">✧</span><h3>这里的篇章，尚待书写。</h3><p>当前条件下暂无收录的更新记录。你可以切换赛季或清空筛选。</p><button type="button" id="reset-updates">查看全部更新 →</button></div><p class="archive-footnote">内测条目会单独标注；赛季中补丁按日期独立归档，保留每次调整的记录。</p></section></main>`;
await writeFile(path.join(root, 'updates.html'), page('赛季更新', '查阅流放圣所各赛季完整说明、赛季中补丁与内测调整。', body));
console.log(`Generated archive and ${cards.length} article(s).`);
