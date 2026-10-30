(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const state = { data: null, map: null, tier: 'all', currency: null, category: 'all' };

  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function imageOrMarker(item, containerClass) {
    const frame = node('span', containerClass);
    frame.setAttribute('aria-hidden', 'true');
    if (item.icon) {
      const img = node('img');
      img.src = item.icon;
      img.alt = '';
      img.width = 28;
      img.height = 28;
      frame.append(img);
    } else {
      frame.append(node('span', 'map-marker'));
    }
    return frame;
  }

  function titleFor(item) { return item.nameZh || item.nameEn || item.code; }

  function entryButton(item, selected, kind) {
    const button = node('button', 'entry');
    button.type = 'button';
    button.dataset.code = item.code;
    button.setAttribute('aria-pressed', String(item.code === selected));
    button.setAttribute('aria-label', `${titleFor(item)}，${kind === 'map' ? item.tier : item.categoryName}`);
    button.append(imageOrMarker(item, 'item-icon'));
    const words = node('span', 'entry-text');
    words.append(node('strong', '', titleFor(item)), node('small', '', item.nameZh ? item.nameEn : item.code.toUpperCase()));
    button.append(words, node('span', 'tier-badge', kind === 'map' ? item.tier : item.categoryName));
    return button;
  }

  function detailHeader(item, category) {
    const header = node('div', 'detail-top');
    const titles = node('div');
    titles.append(node('p', 'detail-kicker', category), node('h3', 'detail-title', titleFor(item)));
    if (item.nameZh) titles.append(node('p', 'detail-subtitle', item.nameEn));
    header.append(imageOrMarker(item, 'detail-icon'), titles, node('span', 'detail-meta', item.code.toUpperCase()));
    return header;
  }

  function detailGroup(title, body) {
    const group = node('div', 'detail-group');
    group.append(node('h4', '', title), body);
    return group;
  }

  function ruleParagraph(text) {
    const paragraph = node('p');
    const values = /(?<![A-Za-z0-9])(?:\d+(?:\s*[–-]\s*\d+)?(?:、\d+)*(?:\s*(?:%|个|级|件|枚|份))?|[一二两三四五六七八九十]+(?:个|种|名|级|件|枚|份))/g;
    let offset = 0;
    for (const match of text.matchAll(values)) {
      paragraph.append(document.createTextNode(text.slice(offset, match.index)), node('strong', 'rule-value', match[0]));
      offset = match.index + match[0].length;
    }
    paragraph.append(document.createTextNode(text.slice(offset)));
    return paragraph;
  }

  function renderMapDetail(item) {
    const detail = $('map-detail');
    detail.replaceChildren();
    if (!item) {
      detail.append(node('p', 'loading', '选择一张地图，查看已收录的资料。'));
      return;
    }
    detail.append(detailHeader(item, `${item.tier} / ${item.tier === 'T3.5' ? '炼狱地图' : item.tier === 'T4' ? 'T4 地牢' : '地图'}`));
    const facts = node('div', 'detail-facts');
    facts.append(detailGroup('首领伤害类型', node('p', '', item.bossDamage || '暂无数据')),
      detailGroup('怪物类型', node('p', '', item.monsters || '暂无数据')));
    detail.append(facts);
    if (item.resistances) {
      const resistances = node('div', 'resistances');
      for (const key of ['火', '冰', '电', '毒', '魔法', '物理']) {
        if (item.resistances[key] === undefined) continue;
        const box = node('div', 'resistance');
        box.append(node('span', '', key), node('b', '', `${item.resistances[key]}%`));
        resistances.append(box);
      }
      detail.append(detailGroup('怪物最高抗性', resistances));
    } else {
      detail.append(detailGroup('怪物最高抗性', node('p', '', '暂无数据')));
    }
    if (item.tier === 'T3.5' && item.nameSource === '基于对应地图的展示名称') {
      detail.append(node('p', 'detail-footnote', '✧ 中文展示名根据对应地图整理；英文名以 Mod 物品表为准。'));
    }
    if (item.tier === 'T4') {
      detail.append(node('p', 'detail-footnote', '✧ 此处复用炼狱地图图标，地图名称与阶级以本条资料为准。'));
    }
  }

  function modeName(mode) {
    if (mode === 'damnation') return '炼狱模式';
    if (mode === 'standard') return '标准模式';
    return mode || '';
  }

  function renderCurrencyDetail(item) {
    const detail = $('currency-detail');
    detail.replaceChildren();
    if (!item) {
      detail.append(node('p', 'loading', '选择一种通货，查看已收录的资料。'));
      return;
    }
    detail.append(detailHeader(item, `MAP CURRENCY / ${item.categoryName}`));
    detail.append(detailGroup('通货效果', ruleParagraph(item.summary)));
    detail.append(detailGroup('适用与限制', ruleParagraph(item.rule)));
    if (item.category === 'glyph') {
      detail.append(detailGroup('重铸提示', node('p', '', '使用注入赫拉迪姆宝珠重铸地图会移除铭文，且不会退还。')));
    }
    if (item.code === 'ccsl') {
      detail.append(detailGroup('获取途径', node('p', '', '安亚出售基础制图凿子。')));
    } else if (item.acquisition && item.acquisition.length) {
      const list = node('ul', 'detail-list');
      for (const source of item.acquisition) {
        list.append(node('li', '', source.text + (source.mode ? `（${modeName(source.mode)}）` : '')));
      }
      detail.append(detailGroup('已收录的获取途径', list));
    } else {
      detail.append(detailGroup('获取途径', node('p', '', '暂无数据')));
    }
    detail.append(node('p', 'detail-footnote', '✧ 不同资料可能使用不同译名，可使用英文名称或物品代码搜索。'));
  }

  function renderMaps() {
    const shown = MappingCore.filterMaps(state.data.maps, $('map-search').value, state.tier);
    const previous = state.map;
    if (!shown.some(item => item.code === state.map)) state.map = shown[0]?.code || null;
    if (previous && previous !== state.map && location.hash.startsWith('#map-')) {
      if (state.map) rememberHash('map', state.map);
      else history.replaceState(null, '', '#maps');
    }
    $('map-list').replaceChildren(...shown.map(item => entryButton(item, state.map, 'map')));
    $('map-count').textContent = `${shown.length} / ${state.data.maps.length} 张地图`;
    $('map-empty').hidden = shown.length > 0;
    renderMapDetail(shown.find(item => item.code === state.map));
  }

  function renderCurrencies() {
    const shown = MappingCore.filterCurrencies(state.data.currencies, $('currency-search').value, state.category);
    const previous = state.currency;
    if (!shown.some(item => item.code === state.currency)) state.currency = shown[0]?.code || null;
    if (previous && previous !== state.currency && location.hash.startsWith('#item-')) {
      if (state.currency) rememberHash('item', state.currency);
      else history.replaceState(null, '', '#currency');
    }
    $('currency-list').replaceChildren(...shown.map(item => entryButton(item, state.currency, 'currency')));
    $('currency-count').textContent = `${shown.length} / ${state.data.currencies.length} 种通货`;
    $('currency-empty').hidden = shown.length > 0;
    renderCurrencyDetail(shown.find(item => item.code === state.currency));
  }

  function rememberHash(kind, code) {
    history.replaceState(null, '', `#${kind}-${encodeURIComponent(code)}`);
  }

  function setTier(tier) {
    state.tier = tier;
    for (const button of $('map-tiers').querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.tier === tier));
    }
  }

  function restoreHash() {
    let hash;
    try { hash = decodeURIComponent(location.hash.slice(1)); } catch (_) { return null; }
    if (hash.startsWith('map-')) {
      const code = hash.slice(4);
      if (state.data.maps.some(item => item.code === code)) {
        state.map = code;
        $('map-search').value = '';
        setTier('all');
        renderMaps();
        return 'maps';
      }
    } else if (hash.startsWith('item-')) {
      const code = hash.slice(5);
      if (state.data.currencies.some(item => item.code === code)) {
        state.currency = code;
        state.category = 'all';
        $('currency-search').value = '';
        for (const button of $('currency-filters').querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.category === 'all'));
        renderCurrencies();
        return 'currency';
      }
    }
    return null;
  }

  function bind() {
    $('map-search').addEventListener('input', renderMaps);
    $('map-tiers').addEventListener('click', event => {
      const button = event.target.closest('button[data-tier]');
      if (!button) return;
      setTier(button.dataset.tier);
      renderMaps();
    });
    $('currency-search').addEventListener('input', renderCurrencies);
    $('currency-filters').addEventListener('click', event => {
      const button = event.target.closest('button[data-category]');
      if (!button) return;
      state.category = button.dataset.category;
      for (const option of $('currency-filters').querySelectorAll('button')) option.setAttribute('aria-pressed', String(option === button));
      renderCurrencies();
    });
    $('map-list').addEventListener('click', event => {
      const button = event.target.closest('button[data-code]');
      if (!button) return;
      state.map = button.dataset.code;
      renderMaps();
      $('map-list').querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
      rememberHash('map', state.map);
    });
    $('currency-list').addEventListener('click', event => {
      const button = event.target.closest('button[data-code]');
      if (!button) return;
      state.currency = button.dataset.code;
      renderCurrencies();
      $('currency-list').querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
      rememberHash('item', state.currency);
    });
    window.addEventListener('hashchange', restoreHash);
  }

  async function init() {
    try {
      const response = await fetch('./data/mapping.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.data = await response.json();
      if (!Array.isArray(state.data.maps) || !Array.isArray(state.data.currencies)) throw new Error('invalid data');
      bind();
      renderMaps();
      renderCurrencies();
      const section = restoreHash();
      if (section) $(section).scrollIntoView();
    } catch (error) {
      console.error('无法载入刷图资料：', error);
      for (const id of ['map-detail', 'currency-detail']) {
        const message = node('p', 'loading', '资料载入失败，请刷新重试，或前往');
        const link = node('a', 'inline-link', '原始刷图资料 ↗');
        link.href = 'https://dev.wdjwxh.com/pd2-new/#mapping';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        message.append(' ', link);
        $(id).replaceChildren(message);
      }
      $('map-count').textContent = '载入失败';
      $('currency-count').textContent = '载入失败';
    }
  }

  init();
})();
