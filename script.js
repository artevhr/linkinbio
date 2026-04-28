const audio       = document.getElementById('bgAudio');
const marquee     = document.getElementById('marqueeTrack');
const iconPlay    = document.getElementById('iconPlay');
const iconPause   = document.getElementById('iconPause');
const entryScreen = document.getElementById('entryScreen');
const customCursor = document.getElementById('customCursor');
const customCursorPointer = document.getElementById('customCursorPointer');
let playing = false;

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

audio.muted = true;
audio.play().catch(() => {});
marquee.classList.add('paused');

entryScreen.addEventListener('click', enter);
entryScreen.addEventListener('touchstart', enter, { passive: true });

// macOS cursor shake effect
let lastX = 0, lastY = 0, lastTime = Date.now();
let cursorScale = 1;
let scaleTimeout;
let isOverClickable = false;

// Проверка, находится ли курсор над кликабельным элементом
function checkClickable(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const clickable = el && (el.closest('a, button, .link-btn, .play-btn, .entry-screen'));

  if (clickable !== isOverClickable) {
    isOverClickable = clickable;
    if (clickable) {
      customCursor.style.display = 'none';
      customCursorPointer.style.display = 'block';
    } else {
      customCursor.style.display = 'block';
      customCursorPointer.style.display = 'none';
    }
  }
}

document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  const dt = now - lastTime;

  // Позиционируем курсор
  const activeCursor = isOverClickable ? customCursorPointer : customCursor;
  activeCursor.style.left = e.clientX + 'px';
  activeCursor.style.top = e.clientY + 'px';

  if (dt > 0) {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = distance / dt;

    // Увеличиваем курсор при быстром движении
    if (speed > 1.5) {
      cursorScale = Math.min(cursorScale + speed * 0.2, 2.5);
      activeCursor.style.transform = `scale(${cursorScale})`;

      clearTimeout(scaleTimeout);
      scaleTimeout = setTimeout(() => {
        // Плавно возвращаем к нормальному размеру
        const shrink = setInterval(() => {
          cursorScale = Math.max(cursorScale - 0.08, 1);
          activeCursor.style.transform = `scale(${cursorScale})`;
          if (cursorScale <= 1) clearInterval(shrink);
        }, 16);
      }, 100);
    }
  }

  checkClickable(e);

  lastX = e.clientX;
  lastY = e.clientY;
  lastTime = now;
});

// Скрываем курсор при выходе за пределы окна
document.addEventListener('mouseleave', () => {
  customCursor.style.display = 'none';
  customCursorPointer.style.display = 'none';
});

document.addEventListener('mouseenter', () => {
  customCursor.style.display = 'block';
});
