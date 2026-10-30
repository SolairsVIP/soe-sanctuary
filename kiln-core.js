(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KilnCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function filterRecipes(recipes, query, category) {
    const needle = String(query || '').trim().toLocaleLowerCase();
    return recipes.filter(recipe =>
      (category === 'all' || recipe.category === category) &&
      String(recipe.search || '').toLocaleLowerCase().includes(needle)
    );
  }

  return { filterRecipes };
});
