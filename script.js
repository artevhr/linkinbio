const audio       = document.getElementById('bgAudio');
const marquee     = document.getElementById('marqueeTrack');
const iconPlay    = document.getElementById('iconPlay');
const iconPause   = document.getElementById('iconPause');
const entryScreen = document.getElementById('entryScreen');
const entryCursor = document.getElementById('entryCursor');
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchTrigger = document.getElementById('searchTrigger');
let playing = false;
let hasEntered = false;

// Entry screen cursor tracking
let centerX = window.innerWidth / 2;
let centerY = window.innerHeight / 2;

function updateEntryCursor(e) {
  if (!entryScreen || entryScreen.classList.contains('hidden')) return;

  const x = e.clientX;
  const y = e.clientY;

  entryCursor.style.left = x + 'px';
  entryCursor.style.top = y + 'px';

  // Check if hovering over text
  const textElement = document.querySelector('.entry-text');
  const textRect = textElement.getBoundingClientRect();
  const isOverText = x >= textRect.left && x <= textRect.right &&
                     y >= textRect.top && y <= textRect.bottom;

  // If over text, show circle
  if (isOverText) {
    entryCursor.classList.add('centered');
  } else {
    entryCursor.classList.remove('centered');

    // Calculate angle to center
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const arrowRotation = angle + 90; // +90 because arrow points down by default

    const arrow = entryCursor.querySelector('.entry-cursor-arrow');
    arrow.style.transform = `translate(-50%, -50%) rotate(${arrowRotation}deg)`;
  }
}

// Update center on resize
window.addEventListener('resize', () => {
  centerX = window.innerWidth / 2;
  centerY = window.innerHeight / 2;
});

// Track cursor on entry screen
document.addEventListener('mousemove', updateEntryCursor);

// Данные для поиска (здесь можно добавить свои работы)
const searchData = [
  {
    title: 'Telegram Bots',
    description: 'Мои Telegram боты',
    icon: '<svg viewBox="0 0 192 192" fill="none"><path stroke="currentColor" stroke-width="12" d="M23.073 88.132s65.458-26.782 88.16-36.212c8.702-3.772 38.215-15.843 38.215-15.843s13.621-5.28 12.486 7.544c-.379 5.281-3.406 23.764-6.433 43.756-4.54 28.291-9.459 59.221-9.459 59.221s-.756 8.676-7.188 10.185c-6.433 1.509-17.027-5.281-18.919-6.79-1.513-1.132-28.377-18.106-38.214-26.404-2.649-2.263-5.676-6.79.378-12.071 13.621-12.447 29.891-27.913 39.728-37.72 4.54-4.527 9.081-15.089-9.837-2.264-26.864 18.483-53.35 35.835-53.35 35.835s-6.053 3.772-17.404.377c-11.351-3.395-24.594-7.921-24.594-7.921s-9.08-5.659 6.433-11.693Z"/></svg>',
    url: '#'
  }
];

function setPlaying(state) {
  playing = state;
  iconPlay.style.display  = state ? 'none'  : 'block';
  iconPause.style.display = state ? 'block' : 'none';
  marquee.classList.toggle('paused', !state);
}

function togglePlay() {
  if (playing) { audio.pause(); setPlaying(false); }
  else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
}

function enter() {
  entryScreen.classList.add('hidden');
  audio.muted = false;
  audio.play().then(() => setPlaying(true)).catch(() => {});
  entryScreen.addEventListener('transitionend', () => entryScreen.remove(), { once: true });
  hasEntered = true;
  searchTrigger.classList.add('visible');
}

function openSearch() {
  searchOverlay.classList.add('active');
  searchInput.value = '';
  renderSearchResults(searchData);
  setTimeout(() => searchInput.focus(), 100);
}

function closeSearch() {
  searchOverlay.classList.remove('active');
  searchInput.blur();
}

function renderSearchResults(items) {
  if (items.length === 0) {
    searchResults.innerHTML = '<div class="search-empty">Тут нету этого</div>';
    return;
  }

  searchResults.innerHTML = items.map(item => `
    <a href="${item.url}" target="_blank" class="search-item">
      <div class="search-item-icon">${item.icon}</div>
      <div class="search-item-content">
        <div class="search-item-title">${item.title}</div>
        <div class="search-item-description">${item.description}</div>
      </div>
    </a>
  `).join('');
}

function handleSearch(query) {
  if (!query.trim()) {
    renderSearchResults(searchData);
    return;
  }

  const filtered = searchData.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  renderSearchResults(filtered);
}

audio.muted = true;
audio.play().catch(() => {});
marquee.classList.add('paused');

entryScreen.addEventListener('click', enter);
entryScreen.addEventListener('touchstart', enter, { passive: true });

// Клик на поле поиска
searchTrigger.addEventListener('click', () => {
  openSearch();
});

// Ctrl+K или Cmd+K для открытия поиска
const handleSearchShortcut = (e) => {
  // Блокируем ВСЕ Ctrl+K события до входа
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.keyCode === 75)) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!hasEntered) return false; // Блокируем до входа

    if (searchOverlay.classList.contains('active')) {
      closeSearch();
    } else {
      openSearch();
    }

    return false;
  }

  // ESC для закрытия
  if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
    e.preventDefault();
    closeSearch();
  }
};

document.addEventListener('keydown', handleSearchShortcut, true);
document.addEventListener('keypress', handleSearchShortcut, true);
document.addEventListener('keyup', (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.keyCode === 75)) {
    if (!hasEntered) return; // Блокируем до входа
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}, true);

// Клик по overlay для закрытия
searchOverlay.addEventListener('click', (e) => {
  if (e.target === searchOverlay) {
    closeSearch();
  }
});

// Поиск в реальном времени
searchInput.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});

// Check for background.gif, fallback to background.png
fetch('background.gif', { method: 'HEAD' })
  .then(response => {
    if (response.ok) {
      document.body.style.background = `var(--bg) url('background.gif') center/cover no-repeat fixed`;
    }
  })
  .catch(() => {});
