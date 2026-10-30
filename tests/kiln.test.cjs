const test = require('node:test');
const assert = require('node:assert/strict');

let core;
try { core = require('../kiln-core.js'); } catch { core = {}; }
const recipes = [
  { id: 'gems', category: 'materials', search: '完美宝石 Perfect Gem 倍增' },
  { id: 'infusion', category: 'materials', search: '制作灌注 Infusion 珠宝碎片' },
  { id: 'fate', category: 'risk', search: '命运卡 Fate Card 随机' },
  { id: 'unique', category: 'equipment', search: '地狱锻铸 Hellforged 暗金' }
];

test('配方可按中文、英文及大小写搜索', () => {
  assert.equal(typeof core.filterRecipes, 'function');
  for (const query of ['完美宝石', 'PERFECT GEM', '  gem  ']) {
    assert.deepEqual(core.filterRecipes(recipes, query, 'all').map(item => item.id), ['gems']);
  }
});

test('搜索和分类同时生效，空结果及清空搜索均可恢复', () => {
  assert.equal(typeof core.filterRecipes, 'function');
  assert.deepEqual(core.filterRecipes(recipes, '', 'materials').map(item => item.id), ['gems', 'infusion']);
  assert.deepEqual(core.filterRecipes(recipes, 'gem', 'equipment'), []);
  assert.deepEqual(core.filterRecipes(recipes, '没有这个配方', 'all'), []);
  assert.equal(core.filterRecipes(recipes, '', 'all').length, 4);
});
