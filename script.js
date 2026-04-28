const audio       = document.getElementById('bgAudio');
const marquee     = document.getElementById('marqueeTrack');
const iconPlay    = document.getElementById('iconPlay');
const iconPause   = document.getElementById('iconPause');
const entryScreen = document.getElementById('entryScreen');
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

// Check for background.gif, fallback to background.png
fetch('background.gif', { method: 'HEAD' })
  .then(response => {
    if (response.ok) {
      document.body.style.background = `var(--bg) url('background.gif') center/cover no-repeat fixed`;
    }
  })
  .catch(() => {});
