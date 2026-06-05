/**
 * WC 2026 Roulette — Main Application
 * Single Page Application for World Cup 2026 country lottery
 */

import './style.css';
import { GROUPS } from './data/groups.js';
import { shuffle } from './utils/shuffle.js';
import { renderHero } from './components/hero.js';
import { renderGroups, markGroupAssigned } from './components/groups.js';
import { renderParticipants, setupParticipantHandlers } from './components/participants.js';
import {
  renderRoulette,
  initWheel,
  spinWheel,
  showWinner,
  updateRoundInfo,
  cleanupWheel,
  getIsSpinning,
} from './components/roulette.js';
import { renderResults, setupResultsHandlers } from './components/results.js';
import confetti from 'canvas-confetti';

// ============================================
// STATE
// ============================================

const state = {
  participants: [],
  results: [],
  shuffledCountries: [],
  currentSpinIndex: 0,
  remainingParticipants: [],
};

// ============================================
// APP INIT
// ============================================

function init() {
  renderApp();
  bindHeroEvents();
  preloadFlags();
}

/**
 * Preload all flag images to cache them for smooth transitions
 */
function preloadFlags() {
  const allCodes = GROUPS.flatMap(g => g.teams.map(t => t.code.toLowerCase()));
  allCodes.forEach(code => {
    const img = new Image();
    img.src = `https://flagcdn.com/w80/${code}.png`;
    const imgSmall = new Image();
    imgSmall.src = `https://flagcdn.com/w40/${code}.png`;
  });
}

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="bg-gradient"></div>
    ${renderHero()}
    ${renderGroups()}
    ${renderParticipants()}
  `;
}

// ============================================
// EVENT BINDINGS
// ============================================

function bindHeroEvents() {
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      const section = document.getElementById('section-participants');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Setup participant input handlers
  setupParticipantHandlers(state, (action) => {
    if (action === 'confirm') {
      startRoulette();
    }
  });
}

// ============================================
// ROULETTE FLOW
// ============================================

function startRoulette() {
  // Flatten all countries and shuffle (MUST KEEP ALL 48 for rigging logic to work)
  const allCountries = GROUPS.flatMap(g => 
    g.teams.map(t => ({ ...t, groupName: g.name }))
  );
  
  state.shuffledCountries = shuffle([...allCountries]);
  state.currentSpinIndex = 0;
  state.results = [];
  state.remainingParticipants = [...state.participants];

  // Inject roulette section
  const participantsSection = document.getElementById('section-participants');
  if (participantsSection) {
    participantsSection.classList.add('hidden');
  }

  // Remove existing roulette and results sections
  const existingRoulette = document.getElementById('section-roulette');
  if (existingRoulette) existingRoulette.remove();
  const existingResults = document.getElementById('section-results');
  if (existingResults) existingResults.remove();

  const app = document.getElementById('app');
  app.insertAdjacentHTML('beforeend', renderRoulette());

  // Initialize wheel with remaining participants
  initWheel(state.remainingParticipants);
  updateRoundDisplay();

  // Scroll to roulette
  setTimeout(() => {
    const section = document.getElementById('section-roulette');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }, 100);

  // Bind spin button
  bindSpinEvents();
}

function updateRoundDisplay() {
  updateRoundInfo(
    state.currentSpinIndex + 1,
    state.shuffledCountries.length
  );

  const btnSpin = document.getElementById('btn-spin');
  if (btnSpin) {
    if (state.remainingParticipants.length === 1) {
      btnSpin.innerHTML = '<span class="icon">🎁</span> Ambil Hasil Terakhir';
      btnSpin.classList.add('btn--gold');
      btnSpin.classList.remove('btn--primary');
    } else {
      btnSpin.innerHTML = '<span class="icon">🎲</span> Putar!';
      btnSpin.classList.remove('btn--gold');
      btnSpin.classList.add('btn--primary');
    }
  }
}

function bindSpinEvents() {
  const btnSpin = document.getElementById('btn-spin');
  const btnNextSpin = document.getElementById('btn-next-spin');
  const btnShowResults = document.getElementById('btn-show-results');

  if (!btnSpin) return;

  // Spin button handler
  btnSpin.addEventListener('click', async () => {
    if (getIsSpinning()) return;
    if (state.remainingParticipants.length === 0) return;

    btnSpin.disabled = true;
    const winnerEl = document.getElementById('roulette-winner');
    const previewEl = document.getElementById('roulette-country-preview');
    if (winnerEl) winnerEl.classList.add('hidden');
    if (previewEl) previewEl.classList.add('hidden');

    let winnerIndex;
    if (state.remainingParticipants.length > 1) {
      winnerIndex = await spinWheel(state.remainingParticipants);
    } else {
      // Last person, no need to spin
      winnerIndex = 0;
      // Small pause for effect
      await new Promise(r => setTimeout(r, 500));
    }

    const winnerName = state.remainingParticipants[winnerIndex];
    if (!winnerName) return; // Final safety check

    const normalizedWinner = winnerName.toLowerCase().trim();
    
    // --- ADVANCED RIGGED LOGIC (Reservation System) ---
    // Check if Dendi is still in the game
    const isDendiInList = state.remainingParticipants.some(p => p.toLowerCase().trim() === 'dendi');
    const isWinnerDendi = normalizedWinner === 'dendi';
    
    // Target countries criteria
    const isReserved = (c) => {
      const name = (c.name || '').toLowerCase().trim();
      const code = (c.code || '').toLowerCase().trim();
      return name.includes('portugal') || name.includes('argentina') || code === 'pt' || code === 'ar';
    };

    console.log(`[Lottery] Round: ${state.currentSpinIndex + 1}, Winner: ${winnerName}, Total Pool Size: ${state.shuffledCountries.length}`);

    if (isWinnerDendi) {
      // Dendi wins: He MUST get a reserved country from the ENTIRE remaining 48-country pool
      const targetIndices = [];
      for (let i = state.currentSpinIndex; i < state.shuffledCountries.length; i++) {
        if (isReserved(state.shuffledCountries[i])) {
          targetIndices.push(i);
        }
      }

      console.log(`[Rigged] Dendi spotted. Reserved slots found in pool:`, targetIndices);

      if (targetIndices.length > 0) {
        if (!targetIndices.includes(state.currentSpinIndex)) {
          const targetIdx = targetIndices[Math.floor(Math.random() * targetIndices.length)];
          console.log(`[Rigged] Swapping ${state.shuffledCountries[state.currentSpinIndex].name} with ${state.shuffledCountries[targetIdx].name}`);
          
          const temp = state.shuffledCountries[state.currentSpinIndex];
          state.shuffledCountries[state.currentSpinIndex] = state.shuffledCountries[targetIdx];
          state.shuffledCountries[targetIdx] = temp;
        }
      } else {
        console.warn('[Rigged Warning] No reserved countries found in the remaining pool.');
      }
    } else if (isDendiInList) {
      // Someone else wins, protect reserved countries from them
      if (isReserved(state.shuffledCountries[state.currentSpinIndex])) {
        let swapIdx = -1;
        // Search for the first non-reserved country available in the rest of the pool
        for (let i = state.currentSpinIndex + 1; i < state.shuffledCountries.length; i++) {
          if (!isReserved(state.shuffledCountries[i])) {
            swapIdx = i;
            break;
          }
        }
        
        if (swapIdx !== -1) {
          console.log(`[Rigged] Protecting ${state.shuffledCountries[state.currentSpinIndex].name} from ${winnerName}. Swapping with ${state.shuffledCountries[swapIdx].name}`);
          const temp = state.shuffledCountries[state.currentSpinIndex];
          state.shuffledCountries[state.currentSpinIndex] = state.shuffledCountries[swapIdx];
          state.shuffledCountries[swapIdx] = temp;
        }
      }
    }
    // ----------------------------------------------------

    const currentCountry = state.shuffledCountries[state.currentSpinIndex];

    // Record result
    state.results.push({
      participant: winnerName,
      country: currentCountry,
    });

    // Remove winner from remaining
    state.remainingParticipants.splice(winnerIndex, 1);

    // Show winner reveal
    showWinner(winnerName, currentCountry);
    markGroupAssigned(currentCountry.groupName, winnerName, currentCountry.name);

    // Auto-scroll to winner announcement
    setTimeout(() => {
      const winnerAnnouncement = document.getElementById('roulette-winner');
      if (winnerAnnouncement) {
        winnerAnnouncement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Fire confetti
    fireConfetti();

    state.currentSpinIndex++;

    // Update UI buttons
    setTimeout(() => {
      btnSpin.classList.add('hidden');
      btnSpin.disabled = false;
      
      if (state.remainingParticipants.length === 0) {
        if (btnNextSpin) btnNextSpin.classList.add('hidden');
        if (btnShowResults) btnShowResults.classList.remove('hidden');
      } else {
        if (btnNextSpin) btnNextSpin.classList.remove('hidden');
      }
    }, 1500);
  });

  // Next Round button handler
  if (btnNextSpin) {
    btnNextSpin.addEventListener('click', () => {
      btnNextSpin.classList.add('hidden');
      btnSpin.classList.remove('hidden');
      btnSpin.disabled = false;
      
      const winnerDiv = document.getElementById('roulette-winner');
      if (winnerDiv) winnerDiv.classList.add('hidden');

      // Redraw wheel with remaining participants
      initWheel(state.remainingParticipants);
      updateRoundDisplay();
    });
  }

  // Show Results button handler
  if (btnShowResults) {
    btnShowResults.addEventListener('click', () => {
      showResults();
    });
  }
}

// ============================================
// RESULTS
// ============================================

function showResults() {
  // Remove roulette section
  const rouletteSection = document.getElementById('section-roulette');
  if (rouletteSection) rouletteSection.remove();
  cleanupWheel();

  // Inject results
  const app = document.getElementById('app');
  app.insertAdjacentHTML('beforeend', renderResults(state.results));

  // Scroll to results
  setTimeout(() => {
    const section = document.getElementById('section-results');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }, 100);

  // Setup results handlers
  setupResultsHandlers(() => {
    resetApp();
  });

  // Fire celebration confetti
  fireCelebration();
}

// ============================================
// CONFETTI
// ============================================

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#E8175D', '#00B4D8', '#FFD700', '#7B2FF7', '#00E676'],
  });
}

function fireCelebration() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#E8175D', '#00B4D8', '#FFD700'],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#7B2FF7', '#00E676', '#FFD700'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// ============================================
// RESET
// ============================================

function resetApp() {
  state.participants = [];
  state.results = [];
  state.shuffledCountries = [];
  state.currentSpinIndex = 0;
  state.remainingParticipants = [];
  cleanupWheel();
  init();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// BOOT
// ============================================

document.addEventListener('DOMContentLoaded', init);
