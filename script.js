const searchToggle = document.querySelector('.search-toggle');
const searchPanel = document.querySelector('#search-panel');
const searchInput = document.querySelector('#archive-search');
const searchResults = document.querySelector('.search-results');
const archiveCards = [...document.querySelectorAll('a[data-search]')];
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
const archiveIndex = document.querySelector('.archive-index');
const archiveIndexToggle = document.querySelector('.archive-index-toggle');
const archiveIndexPanel = document.querySelector('#archive-index-panel');
let archiveIndexPinned = false;

function closeSearch() {
  searchPanel.hidden = true;
  searchToggle.setAttribute('aria-expanded', 'false');
}

function closeArchiveIndex() {
  archiveIndexPanel.hidden = true;
  archiveIndexToggle.setAttribute('aria-expanded', 'false');
  archiveIndexPinned = false;
}

function openArchiveIndex() {
  closeSearch();
  mainNav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '打开导航菜单');
  archiveIndexPanel.hidden = false;
  archiveIndexToggle.setAttribute('aria-expanded', 'true');
}

archiveIndex.addEventListener('pointerenter', event => {
  if (event.pointerType === 'mouse' && archiveIndexPanel.hidden) openArchiveIndex();
});
archiveIndex.addEventListener('pointerleave', event => {
  if (event.pointerType === 'mouse' && !archiveIndexPinned) closeArchiveIndex();
});
archiveIndexToggle.addEventListener('click', event => {
  if (archiveIndexPanel.hidden) {
    openArchiveIndex();
    archiveIndexPinned = true;
  } else if (!archiveIndexPinned && event.detail > 0) {
    archiveIndexPinned = true;
  } else {
    closeArchiveIndex();
  }
});
archiveIndex.addEventListener('focusout', event => {
  if (archiveIndexPinned && !archiveIndex.contains(event.relatedTarget)) closeArchiveIndex();
});
archiveIndexPanel.addEventListener('click', event => {
  if (event.target.closest('a')) closeArchiveIndex();
});

function renderSearch() {
  const query = searchInput.value.trim().toLowerCase();
  searchResults.replaceChildren();
  if (!query) return;
  const matches = archiveCards.filter(card => card.dataset.search.toLowerCase().includes(query));
  if (!matches.length) {
    const message = document.createElement('p');
    message.textContent = '没有找到对应分类，试试其他关键词。';
    searchResults.append(message);
    return;
  }
  for (const card of matches) {
    const link = document.createElement('a');
    link.href = card.href;
    if (card.target) link.target = card.target;
    if (card.rel) link.rel = card.rel;
    link.textContent = card.dataset.searchLabel || card.querySelector('strong').textContent;
    const arrow = document.createElement('span');
    arrow.textContent = card.querySelector('.card-arrow')?.textContent || (card.target === '_blank' ? '↗' : '→');
    link.append(arrow);
    searchResults.append(link);
  }
}

searchToggle.addEventListener('click', () => {
  const opening = searchPanel.hidden;
  if (opening) closeArchiveIndex();
  searchPanel.hidden = !opening;
  searchToggle.setAttribute('aria-expanded', String(opening));
  if (opening) searchInput.focus();
});
searchInput.addEventListener('input', renderSearch);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !archiveIndexPanel.hidden) {
    closeArchiveIndex();
    archiveIndexToggle.focus();
    return;
  }
  if (event.key === 'Escape' && !searchPanel.hidden) {
    closeSearch();
    searchToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!searchPanel.hidden && !searchPanel.contains(event.target) && !searchToggle.contains(event.target)) closeSearch();
  if (!archiveIndexPanel.hidden && !archiveIndex.contains(event.target)) closeArchiveIndex();
});
menuToggle.addEventListener('click', () => {
  closeArchiveIndex();
  closeSearch();
  const open = mainNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
});
mainNav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航菜单');
  }
});

const videoClips = [...document.querySelectorAll('.feature-video')].map(frame => ({
  frame,
  video: frame.querySelector('video')
}));

function playSilently(video) {
  video.muted = true;
  try {
    const playback = video.play();
    if (playback) playback.catch(() => {});
  } catch {
    // The poster remains available if the browser cannot play the video.
  }
}

let pageIsInactive = false;

function suspendVideos() {
  if (pageIsInactive) return;
  pageIsInactive = true;
  for (const clip of videoClips) {
    clip.resumeOnReturn = !clip.video.paused;
    clip.video.muted = true;
    if (clip.resumeOnReturn) clip.video.pause();
  }
}

function resumeVideos() {
  if (!pageIsInactive || document.hidden) return;
  pageIsInactive = false;
  for (const clip of videoClips) {
    if (clip.resumeOnReturn) playSilently(clip.video);
    clip.resumeOnReturn = false;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) suspendVideos();
  else resumeVideos();
});
window.addEventListener('pagehide', suspendVideos);
window.addEventListener('pageshow', resumeVideos);

// Playback starts only through the native controls. Keep one stream active.
for (const clip of videoClips) {
  clip.video.addEventListener('play', () => {
    for (const other of videoClips) {
      if (other !== clip) {
        other.resumeOnReturn = false;
        other.video.pause();
      }
    }
  });
}
