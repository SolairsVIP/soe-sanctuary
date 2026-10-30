(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MappingCore = api;
})(typeof globalThis === 'undefined' ? this : globalThis, function () {
  'use strict';

  function matches(item, query) {
    const words = String(query || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return true;
    const fields = [item.nameZh, item.nameEn, item.code, item.tier, item.bossDamage,
      item.categoryName, item.summary, ...(item.aliases || [])];
    const haystack = fields.filter(Boolean).join(' ').toLocaleLowerCase();
    return words.every(word => haystack.includes(word));
  }

  function filterMaps(items, query, tier) {
    return items.filter(item => (!tier || tier === 'all' || item.tier === tier) && matches(item, query));
  }

  function filterCurrencies(items, query, category) {
    return items.filter(item => (!category || category === 'all' || item.category === category) && matches(item, query));
  }

  return { filterMaps, filterCurrencies };
});
