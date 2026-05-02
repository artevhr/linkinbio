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
    icon: '<svg viewBox="0 0 48 48" fill="none"><path fill="currentColor" d="M41.4193 7.30899C41.4193 7.30899 45.3046 5.79399 44.9808 9.47328C44.8729 10.9883 43.9016 16.2908 43.1461 22.0262L40.5559 39.0159C40.5559 39.0159 40.3401 41.5048 38.3974 41.9377C36.4547 42.3705 33.5408 40.4227 33.0011 39.9898C32.5694 39.6652 24.9068 34.7955 22.2086 32.4148C21.4531 31.7655 20.5897 30.4669 22.3165 28.9519L33.6487 18.1305C34.9438 16.8319 36.2389 13.8019 30.8426 17.4812L15.7331 27.7616C15.7331 27.7616 14.0063 28.8437 10.7686 27.8698L3.75342 25.7055C3.75342 25.7055 1.16321 24.0823 5.58815 22.459C16.3807 17.3729 29.6555 12.1786 41.4193 7.30899Z"/></svg>',
    url: 'https://t.me/dpoovinfo'
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
