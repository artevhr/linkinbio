const audio       = document.getElementById('bgAudio');
const marquee     = document.getElementById('marqueeTrack');
const iconPlay    = document.getElementById('iconPlay');
const iconPause   = document.getElementById('iconPause');
const entryScreen = document.getElementById('entryScreen');
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
let playing = false;

// Данные для поиска (здесь можно добавить свои работы)
const searchData = [
  {
    title: 'Project 1',
    description: 'Description of project 1',
    icon: '🎨',
    url: 'https://example.com/project1'
  },
  {
    title: 'Project 2',
    description: 'Description of project 2',
    icon: '💻',
    url: 'https://example.com/project2'
  },
  {
    title: 'Project 3',
    description: 'Description of project 3',
    icon: '🎵',
    url: 'https://example.com/project3'
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
    searchResults.innerHTML = '<div class="search-empty">No results found</div>';
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

// Ctrl+K или Cmd+K для открытия поиска
const handleSearchShortcut = (e) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K' || e.keyCode === 75)) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

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
