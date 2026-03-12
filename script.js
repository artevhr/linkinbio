const audio     = document.getElementById('bgAudio');
const marquee   = document.getElementById('marqueeTrack');
const iconPlay  = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
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

function tryAutoplay() {
  audio.play().then(() => setPlaying(true)).catch(() => {
    const unlock = () => {
      audio.play().then(() => {
        setPlaying(true);
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
      }).catch(() => {});
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
  });
}

tryAutoplay();
