/**
 * Roulette Wheel Component — Canvas-based spinning wheel
 */
import { SEGMENT_COLORS } from '../data/groups.js';
import { playTick, playWin, resumeAudio } from '../utils/sound.js';

let canvas, ctx;
let currentRotation = 0;
let isSpinning = false;
let animationId = null;

/**
 * Render the roulette section HTML
 */
export function renderRoulette() {
  return `
    <section class="section roulette" id="section-roulette">
      <h2 class="section-title">🎰 Roulette Undian</h2>

      <div class="roulette__container">
        <div class="roulette__info">
          <div class="roulette__round" id="roulette-round">Putaran 1</div>
          <div class="roulette__group-label" id="roulette-group-label">Undian untuk Negara ?</div>
          <div class="roulette__country-preview hidden" id="roulette-country-preview"></div>
        </div>

        <div class="roulette__wheel-wrapper">
          <div class="roulette__pointer"></div>
          <canvas class="roulette__canvas" id="roulette-canvas" width="680" height="680"></canvas>
          <div class="roulette__center">⚽</div>
        </div>

        <div id="roulette-winner" class="hidden"></div>

        <div class="roulette__actions">
          <button class="btn btn--primary" id="btn-spin">
            <span class="icon">🎲</span>
            Putar!
          </button>
          <button class="btn btn--secondary btn--small hidden" id="btn-next-spin">
            Lanjut Putaran →
          </button>
          <button class="btn btn--gold hidden" id="btn-show-results">
            <span class="icon">📊</span>
            Lihat Hasil
          </button>
        </div>
      </div>
    </section>
  `;
}

/**
 * Draw the roulette wheel on canvas
 */
function drawWheel(participants) {
  if (!canvas || !ctx) return;

  const size = canvas.width;
  const center = size / 2;
  const radius = center - 20;
  const segmentAngle = (2 * Math.PI) / participants.length;

  ctx.clearRect(0, 0, size, size);

  participants.forEach((name, i) => {
    const startAngle = currentRotation + i * segmentAngle;
    const endAngle = startAngle + segmentAngle;

    // Draw segment
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
    ctx.fill();

    // Draw border
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(startAngle + segmentAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.min(24, 300 / participants.length)}px Inter, sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    
    // Truncate name if too long
    const displayName = name.length > 10 ? name.substring(0, 9) + '…' : name;
    ctx.fillText(displayName, radius - 20, 6);
    ctx.restore();
  });

  // Draw outer ring
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw inner circle
  ctx.beginPath();
  ctx.arc(center, center, 35, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(10, 10, 26, 0.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 3;
  ctx.stroke();
}

/**
 * Initialize and draw the wheel
 */
export function initWheel(participants) {
  canvas = document.getElementById('roulette-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  currentRotation = 0;
  drawWheel(participants);
}

/**
 * Spin the wheel and return the winner index
 * @returns {Promise<number>} Winner index
 */
export function spinWheel(participants) {
  return new Promise((resolve) => {
    if (isSpinning) return;
    isSpinning = true;
    resumeAudio();

    const segmentAngle = (2 * Math.PI) / participants.length;
    // Random spin: 5–8 full rotations + random offset
    const totalRotation = (5 + Math.random() * 3) * 2 * Math.PI + Math.random() * 2 * Math.PI;
    const duration = 4000 + Math.random() * 1000; // 4-5 seconds
    const startTime = performance.now();
    const startRotation = currentRotation;

    let lastTickAngle = 0;

    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      currentRotation = startRotation + totalRotation * eased;

      drawWheel(participants);

      // Play tick sound at each segment boundary
      const currentAngleFromStart = (totalRotation * eased) % (2 * Math.PI);
      const segmentsPassed = Math.floor(currentAngleFromStart / segmentAngle);
      if (segmentsPassed !== lastTickAngle) {
        lastTickAngle = segmentsPassed;
        if (progress < 0.95) {
          playTick();
        }
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        isSpinning = false;

        // Determine winner: the segment at the top (pointer position)
        // Pointer is at top (270 degrees = 3π/2 or -π/2)
        const pointerAngle = -Math.PI / 2;
        const normalizedRotation = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        // Find which segment is at the pointer
        const adjustedAngle = ((pointerAngle - normalizedRotation) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const winnerIndex = Math.floor(adjustedAngle / segmentAngle) % participants.length;

        playWin();
        resolve(winnerIndex);
      }
    }

    animationId = requestAnimationFrame(animate);
  });
}

/**
 * Show winner announcement
 */
export function showWinner(name, country) {
  const winnerEl = document.getElementById('roulette-winner');
  if (!winnerEl) return;

  // Initial skeleton for reveal animation
  winnerEl.innerHTML = `
    <div class="roulette__winner winner-reveal">
      <div class="roulette__winner-label">🎉 SAH! PEMENANGNYA ADALAH:</div>
      <div class="roulette__winner-name">${name}</div>
      <div class="roulette__winner-divider">Fix, lu dapet negara...</div>
      <div class="roulette__winner-country reveal-active" id="winner-country-reveal">
        <img src="https://flagcdn.com/w80/un.png" class="flag-reveal" id="flag-cycle-img">
        <span class="name">Wait...</span>
      </div>
      <div class="roulette__winner-group hidden" id="winner-group-reveal">(Grup ${country.groupName})</div>
    </div>
  `;
  winnerEl.classList.remove('hidden');

  // Logic for cycling flags reveal
  const countryReveal = document.getElementById('winner-country-reveal');
  const groupReveal = document.getElementById('winner-group-reveal');
  const flagCycleImg = document.getElementById('flag-cycle-img');
  const divider = winnerEl.querySelector('.roulette__winner-divider');
  
  const allCodes = ['mx', 'br', 'de', 'jp', 'be', 'es', 'fr', 'ar', 'pt', 'ca', 'us', 'nl'];
  let cycleCount = 0;
  const maxCycles = 15;
  
  const interval = setInterval(() => {
    if (cycleCount < maxCycles) {
      const randomCode = allCodes[Math.floor(Math.random() * allCodes.length)];
      flagCycleImg.src = `https://flagcdn.com/w80/${randomCode}.png`;
      cycleCount++;
    } else {
      clearInterval(interval);
      // Reveal final country
      countryReveal.classList.remove('reveal-active');
      countryReveal.innerHTML = `
        <img src="https://flagcdn.com/w80/${country.code.toLowerCase()}.png" class="flag-reveal">
        <span class="name">${country.name}</span>
      `;
      divider.textContent = 'Selamat! Lu dapet:';
      groupReveal.textContent = `(Stay di Grup ${country.groupName})`;
      groupReveal.classList.remove('hidden');
      
      // Additional punchy animation
      countryReveal.style.animation = 'scaleBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both';
    }
  }, 120);
}

/**
 * Update round info display
 */
export function updateRoundInfo(roundNumber, totalRounds) {
  const roundEl = document.getElementById('roulette-round');
  const groupEl = document.getElementById('roulette-group-label');
  const previewEl = document.getElementById('roulette-country-preview');

  if (roundEl) roundEl.textContent = `Round ${roundNumber} / ${totalRounds}`;
  if (groupEl) groupEl.textContent = `Lagi nyari siapa yang beruntung...`;
  if (previewEl) previewEl.classList.add('hidden');
}

/**
 * Cleanup
 */
export function cleanupWheel() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  isSpinning = false;
}

export function getIsSpinning() {
  return isSpinning;
}
