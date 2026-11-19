(() => {
  const archive = document.querySelector('.update-list');
  if (archive) {
    const search = document.querySelector('#update-search');
    const cards = [...archive.querySelectorAll('.update-card')];
    const seasonButtons = [...document.querySelectorAll('.season-tabs button')];
    const typeButtons = [...document.querySelectorAll('.type-tabs button')];
    const params = new URLSearchParams(location.search);
    let season = seasonButtons.some(b => b.dataset.season === params.get('season')) ? params.get('season') : 'all';
    let type = typeButtons.some(b => b.dataset.type === params.get('type')) ? params.get('type') : 'all';
    search.value = params.get('q') || '';
    function render() {
      const query = search.value.trim().toLocaleLowerCase();
      let count = 0;
      cards.forEach(card => {
        const show = (season === 'all' || card.dataset.season === season)
          && (type === 'all' || card.dataset.type === type)
          && (!query || card.dataset.search.includes(query));
        card.hidden = !show;
        if (show) count++;
      });
      seasonButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.season === season)));
      typeButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.type === type)));
      document.querySelector('#result-count').textContent = `${count} 篇更新 · 最新在前`;
      document.querySelector('.archive-empty').hidden = count > 0;
      const next = new URL(location.href);
      [['season', season], ['type', type], ['q', search.value.trim()]].forEach(([key, value]) => {
        if (!value || value === 'all') next.searchParams.delete(key);
        else next.searchParams.set(key, value);
      });
      history.replaceState(null, '', next);
    }
    seasonButtons.forEach(button => button.addEventListener('click', () => { season = button.dataset.season; render(); }));
    typeButtons.forEach(button => button.addEventListener('click', () => { type = button.dataset.type; render(); }));
    search.addEventListener('input', render);
    document.querySelector('#reset-updates').addEventListener('click', () => {
      season = type = 'all'; search.value = ''; render(); search.focus();
    });
    render();
  }
  const content = document.querySelector('.patch-content');
  if (content) {
    const lazyVideos = [...content.querySelectorAll('video[data-lazy-src]')];
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const video = entry.target;
        video.src = video.dataset.lazySrc;
        video.removeAttribute('data-lazy-src');
        videoObserver.unobserve(video);
      }), { rootMargin: '240px 0px' });
      lazyVideos.forEach(video => videoObserver.observe(video));
    } else lazyVideos.forEach(video => { video.src = video.dataset.lazySrc; video.removeAttribute('data-lazy-src'); });
    const links = [...document.querySelectorAll('.article-toc a')];
    const search = document.querySelector('#toc-search');
    const articleSearch = document.querySelector('#article-search');
    const sections = [...content.querySelectorAll('.note-section')];
    const status = document.querySelector('#article-search-status');
    const directory = document.querySelector('.article-sidebar details');
    if (matchMedia('(max-width: 700px)').matches) directory.open = false;
    function filterArticle() {
      const query = articleSearch.value.trim().toLocaleLowerCase();
      const tocQuery = search.value.trim().toLocaleLowerCase();
      sections.forEach(section => {
        section.hidden = !section.textContent.toLocaleLowerCase().includes(query);
      });
      let count = 0;
      links.forEach(link => {
        const section = document.getElementById(link.hash.slice(1))?.closest('.note-section');
        link.hidden = Boolean(section?.hidden) || !link.textContent.toLocaleLowerCase().includes(tocQuery);
        if (!link.hidden) count++;
      });
      const matches = sections.filter(section => !section.hidden).length;
      document.querySelector('.toc-empty').hidden = count > 0;
      document.querySelector('#article-empty').hidden = matches > 0;
      status.hidden = !query;
      status.textContent = `找到 ${matches} 个相关章节，清空搜索可恢复全文。`;
    }
    search.addEventListener('input', filterArticle);
    articleSearch.addEventListener('input', filterArticle);
    const headings = [...content.querySelectorAll('h2')];
    let scheduled = false;
    function updateReading() {
      scheduled = false;
      const start = content.offsetTop;
      const length = Math.max(1, content.offsetHeight - innerHeight);
      const progress = Math.min(1, Math.max(0, (scrollY - start) / length));
      document.querySelector('.reading-progress span').style.transform = `scaleX(${progress})`;
      let active = headings[0]?.id;
      for (const heading of headings) {
        if (heading.closest('.note-section').hidden) continue;
        if (heading.getBoundingClientRect().top <= 150) active = heading.id;
        else break;
      }
      links.forEach(link => {
        if (link.hash === `#${active}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); }
    }, {passive: true});
    addEventListener('resize', updateReading);
    updateReading();
  }
})();
