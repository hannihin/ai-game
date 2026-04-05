import './styles.css';
import Game from './game';

const canvas = document.getElementById('game-canvas');
const overlay = document.getElementById('overlay');

document.querySelectorAll('.choices button').forEach(btn => {
  btn.addEventListener('click', () => {
    const chosen = btn.dataset.char;
    overlay.style.display = 'none';
    // start game
    window.game = new Game(canvas, chosen);
  });
});

// Touch controls: simple tap left/right for mobile
// Mobile touch / swipe controls
canvas.addEventListener('touchstart', e => { e.preventDefault(); });

let _touchState = { active: false, startX: 0, startY: 0, startTime: 0 };

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  _touchState.active = true;
  _touchState.startX = t.clientX;
  _touchState.startY = t.clientY;
  _touchState.startTime = Date.now();
});

canvas.addEventListener('touchmove', e => {
  if (!_touchState.active) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - _touchState.startX;
  const dy = t.clientY - _touchState.startY;
  if (!window.game) return;
  // Horizontal swipe/drag controls left/right while moving
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
    window.game.input.left = dx < 0;
    window.game.input.right = dx > 0;
  }
});

canvas.addEventListener('touchend', e => {
  if (!_touchState.active) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - _touchState.startX;
  const dy = t.clientY - _touchState.startY;
  const dt = Date.now() - _touchState.startTime;
  if (window.game) {
    // Swipe up -> jump
    if (Math.abs(dy) > 40 && dy < 0) {
      window.game.input.jump = true;
      setTimeout(() => { if (window.game) window.game.input.jump = false; }, 120);
    }

    // Quick tap: left / right / center (jump)
    if (Math.abs(dx) < 12 && dt < 250) {
      const rect = canvas.getBoundingClientRect();
      const x = t.clientX - rect.left;
      if (x < rect.width / 3) {
        window.game.input.left = true;
        setTimeout(() => { if (window.game) window.game.input.left = false; }, 160);
      } else if (x > rect.width * 2 / 3) {
        window.game.input.right = true;
        setTimeout(() => { if (window.game) window.game.input.right = false; }, 160);
      } else {
        window.game.input.jump = true;
        setTimeout(() => { if (window.game) window.game.input.jump = false; }, 160);
      }
    }

    // clear drag movement on end
    window.game.input.left = false;
    window.game.input.right = false;
  }
  _touchState.active = false;
});

canvas.addEventListener('touchcancel', () => {
  if (window.game) { window.game.input.left = false; window.game.input.right = false; window.game.input.jump = false; }
  _touchState.active = false;
});
