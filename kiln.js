(function () {
  'use strict';

  const controls = document.getElementById('recipe-controls');
  const search = document.getElementById('recipe-search');
  const filters = document.getElementById('recipe-filters');
  const count = document.getElementById('recipe-count');
  const empty = document.getElementById('recipe-empty');
  const cards = Array.from(document.querySelectorAll('[data-recipe]'));
  const recipes = cards.map(element => ({
    element,
    category: element.dataset.category,
    search: `${element.textContent} ${element.dataset.search || ''}`
  }));
  let category = 'all';

  function render() {
    const matches = KilnCore.filterRecipes(recipes, search.value, category);
    const visible = new Set(matches.map(recipe => recipe.element));
    for (const card of cards) card.hidden = !visible.has(card);
    count.textContent = `显示 ${matches.length} / ${recipes.length} 组配方`;
    empty.hidden = matches.length !== 0;
  }

  search.addEventListener('input', render);
  filters.addEventListener('click', event => {
    const button = event.target.closest('button[data-category]');
    if (!button || !filters.contains(button)) return;
    category = button.dataset.category;
    for (const option of filters.querySelectorAll('button')) {
      option.setAttribute('aria-pressed', String(option === button));
    }
    render();
  });
  window.addEventListener('hashchange', () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (!target || !target.matches('[data-recipe]') || !target.hidden) return;
    search.value = '';
    category = 'all';
    for (const option of filters.querySelectorAll('button')) {
      option.setAttribute('aria-pressed', String(option.dataset.category === 'all'));
    }
    render();
    target.scrollIntoView();
  });
  controls.hidden = false;
  render();
})();
