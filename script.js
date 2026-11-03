'use strict';

const invite = document.querySelector('#invite');
const jar = document.querySelector('#open-jar');
const card = document.querySelector('#invitation');
const closeButton = document.querySelector('#close-jar');
const hint = document.querySelector('.open-hint');
const caption = document.querySelector('.jar-caption');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let state = 'closed';
let revealTimer;
let confettiTimer;
let audioContext;
let confettiLayer;

// Initialize audio during the tap so mobile browsers can unlock playback.
function playLidPop(delay) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioContext ||= new AudioContext();
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    const start = audioContext.currentTime + delay;
    const tone = audioContext.createOscillator();
    const volume = audioContext.createGain();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(520, start);
    tone.frequency.exponentialRampToValueAtTime(130, start + 0.11);
    volume.gain.setValueAtTime(0, start);
    volume.gain.linearRampToValueAtTime(0.18, start + 0.006);
    volume.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
    tone.connect(volume);
    volume.connect(audioContext.destination);
    tone.start(start);
    tone.stop(start + 0.15);
    tone.onended = () => { tone.disconnect(); volume.disconnect(); };
  } catch {
    // The invitation still opens if the browser does not allow audio.
  }
}

function burstPeanuts() {
  if (reducedMotion.matches) return;
  confettiLayer?.remove();
  const origin = document.querySelector('.jar-lid').getBoundingClientRect();
  const layer = document.createElement('div');
  confettiLayer = layer;
  layer.className = 'peanut-confetti';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
  const colors = ['#a7cbe3', '#c1def0', '#f5dbb7', '#e9c695', '#bc8550', '#d9ac76'];
  for (let i = 0; i < 28; i++) {
    const peanut = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    peanut.setAttribute('viewBox', '0 0 24 42');
    peanut.classList.add('confetti-peanut');
    peanut.style.color = colors[i % colors.length];
    peanut.style.width = `${11 + Math.random() * 9}px`;
    peanut.style.left = `${origin.left + origin.width / 2}px`;
    peanut.style.top = `${origin.top + origin.height / 2}px`;
    peanut.innerHTML = '<path d="M12 2C2-1 0 9 4 16C6 20 6 22 4 26C-1 36 5 43 12 40C19 43 25 36 20 26C18 22 18 20 20 16C24 9 22-1 12 2Z" fill="currentColor" stroke="#765536" stroke-opacity=".45"/><path d="M12 6Q8 13 12 20T12 36M6 11L17 14M7 28L18 31" fill="none" stroke="#765536" stroke-opacity=".3" stroke-linecap="round"/>';
    layer.append(peanut);
    const spread = Math.min(window.innerWidth * 0.65, 440);
    const x = (Math.random() - 0.5) * spread;
    const rise = 65 + Math.random() * 140;
    const fall = 170 + Math.random() * 170;
    const rotation = (Math.random() - 0.5) * 600;
    const animation = peanut.animate([
      { transform: 'translate(-50%, -50%) scale(.4) rotate(0deg)', opacity: 0 },
      { transform: `translate(calc(-50% + ${x * 0.4}px), ${-rise}px) scale(1) rotate(${rotation * 0.35}deg)`, opacity: 1, offset: 0.28 },
      { transform: `translate(calc(-50% + ${x}px), ${fall}px) scale(.85) rotate(${rotation}deg)`, opacity: 0 }
    ], { duration: 1400 + Math.random() * 500, easing: 'cubic-bezier(.2,.55,.45,1)', fill: 'forwards' });
    animation.onfinish = () => {
      peanut.remove();
      if (!layer.childElementCount) {
        layer.remove();
        if (confettiLayer === layer) confettiLayer = null;
      }
    };
  }
}

function revealInvitation() {
  if (state !== 'opening') return;
  state = 'open';
  invite.classList.remove('is-opening');
  invite.classList.add('is-open');
  card.hidden = false;
  caption.hidden = false;
  jar.setAttribute('aria-expanded', 'true');
  jar.setAttribute('aria-label', 'The jar is open');
  card.focus({ preventScroll: true });
  if (window.innerWidth <= 700) {
    card.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }
}

jar.addEventListener('click', () => {
  if (state !== 'closed') return;
  state = 'opening';
  hint.hidden = true;
  invite.classList.add('is-opening');
  const popDelay = reducedMotion.matches ? 0 : 0.4;
  playLidPop(popDelay);
  confettiTimer = window.setTimeout(burstPeanuts, popDelay * 1000);
  // A timeout also handles browsers that suppress animation events.
  revealTimer = window.setTimeout(revealInvitation, reducedMotion.matches ? 0 : 950);
});

closeButton.addEventListener('click', () => {
  window.clearTimeout(revealTimer);
  window.clearTimeout(confettiTimer);
  confettiLayer?.remove();
  confettiLayer = null;
  state = 'closed';
  card.hidden = true;
  caption.hidden = true;
  hint.hidden = false;
  invite.classList.remove('is-open', 'is-opening');
  jar.setAttribute('aria-expanded', 'false');
  jar.setAttribute('aria-label', "Open the jar to read Dallas's baby shower invitation");
  jar.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
});
