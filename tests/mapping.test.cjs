const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let core;
try { core = require('../mapping-core.js'); } catch { core = {}; }
const maps = [
  { code: 't12', nameZh: '赫拉森的梦境', nameEn: 'Arcane Map', tier: 'T2', bossDamage: '物理' },
  { code: 'tm9i', nameZh: '地狱灰烬地图', nameEn: 'Infernal Ashes Map', tier: 'T3.5', bossDamage: null },
  { code: 't42', nameZh: null, nameEn: 'Torment Map', tier: 'T4', bossDamage: null }
];
const items = [
  { code: 'scnm', nameZh: '宿敌铭文', nameEn: 'Glyph of Nemeses', aliases: ['仇敌符文石'], category: 'glyph' },
  { code: 'troo', nameZh: '丰饶之恐怖', nameEn: 'Terror of Opulence', aliases: ['富饶恐惧'], category: 'terror' }
];

test('地图搜索支持中文、英文和物品代码', () => {
  assert.equal(typeof core.filterMaps, 'function');
  for (const query of ['赫拉森', 'arcane', 'T12']) {
    assert.deepEqual(core.filterMaps(maps, query, 'all').map(x => x.code), ['t12']);
  }
});

test('地图阶级与搜索可同时筛选，炼狱和 T4 各自独立', () => {
  assert.equal(typeof core.filterMaps, 'function');
  assert.deepEqual(core.filterMaps(maps, 'map', 'T3.5').map(x => x.code), ['tm9i']);
  assert.deepEqual(core.filterMaps(maps, 'map', 'T4').map(x => x.code), ['t42']);
  assert.deepEqual(core.filterMaps(maps, '不存在', 'all'), []);
});

test('通货可按不同中文译名、英文和代码搜索，同时遵守分类', () => {
  assert.equal(typeof core.filterCurrencies, 'function');
  for (const query of ['仇敌符文石', 'nemeses', 'SCNM']) {
    assert.deepEqual(core.filterCurrencies(items, query, 'all').map(x => x.code), ['scnm']);
  }
  assert.deepEqual(core.filterCurrencies(items, '', 'terror').map(x => x.code), ['troo']);
  assert.deepEqual(core.filterCurrencies(items, 'scnm', 'terror'), []);
});

test('地图快照保留真实阶级，并将未经核对的数据留空', () => {
  const file = path.join(__dirname, '../data/mapping.json');
  assert.ok(fs.existsSync(file), '地图数据快照尚未创建');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const byCode = Object.fromEntries(data.maps.map(item => [item.code, item]));
  assert.equal(byCode.t12.tier, 'T2'); // 物品代码首位并不等于地图阶级。
  assert.equal(byCode.tm9i.tier, 'T3.5');
  assert.equal(byCode.t42.tier, 'T4');
  assert.equal(byCode.tm1i.bossDamage, null);
  assert.equal(byCode.t42.resistances, null);
  assert.equal(data.maps.length, 37);
  assert.equal(data.maps.filter(item => item.tier === 'T3.5').length, 9);
  assert.equal(data.maps.filter(item => item.tier === 'T4').length, 3);
  assert.equal(data.currencies.length, 16);
});

test('T4 复用炼狱图标，新增道具图标保持原始小尺寸', () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/mapping.json'), 'utf8'));
  const infernalIcons = new Set(data.maps.filter(item => item.tier === 'T3.5').map(item => item.icon));
  for (const item of data.maps.filter(item => item.tier === 'T4')) assert.ok(infernalIcons.has(item.icon));
  for (const item of [...data.maps, ...data.currencies].filter(item => item.icon)) {
    const bytes = fs.readFileSync(path.join(__dirname, '..', item.icon));
    assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.ok(bytes.readUInt32BE(16) <= 28 && bytes.readUInt32BE(20) <= 28, item.code);
  }
});
