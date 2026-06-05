/**
 * Results Display Component
 */
import { takeScreenshot } from '../utils/screenshot.js';

export function renderResults(results) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const resultCards = results.map((r, i) => `
    <div class="result-card" style="animation-delay: ${i * 0.08}s">
      <div class="result-card__rank">${i + 1}</div>
      <div class="result-card__content">
        <div class="result-card__participant">${escapeHtml(r.participant)}</div>
        <div class="result-card__group">Mendapat Negara:</div>
        <div class="result-card__countries">
          <div class="result-card__country-tag">
            <img src="https://flagcdn.com/w40/${r.country.code.toLowerCase()}.png" class="result-card__flag-img" alt="${r.country.name}">
            <span class="name">${r.country.name}</span>
            <span class="group-info">(Grup ${r.country.groupName})</span>
          </div>
        </div>
      </div>
      <div class="result-card__flags">
        <img src="https://flagcdn.com/w40/${r.country.code.toLowerCase()}.png" style="height: 24px; border-radius: 4px;">
      </div>
    </div>
  `).join('');

  return `
    <section class="section section--auto results" id="section-results">
      <h2 class="section-title">📊 Squad Lu Udah Fix!</h2>
      <p class="section-subtitle">
        Mantap, ini dia pembagian negara buat World Cup nanti. Gaskeun kabarin temen-temen lu!
      </p>

      <div class="results__container">
        <div id="screenshot-area">
          <div class="screenshot-header">
            <div class="screenshot-title">⚽ Tim World Cup Kita</div>
            <div class="screenshot-date">${dateStr}</div>
          </div>
          <div class="results__grid">
            ${resultCards}
          </div>
        </div>

        <div class="results__actions">
          <button class="btn btn--secondary" id="btn-screenshot">
            <span class="icon">📸</span>
            Simpan Sebagai Gambar
          </button>
          <button class="btn btn--primary" id="btn-reset" onclick="window.location.reload()">
            <span class="icon">🔄</span>
            Main Lagi Gaskeun!
          </button>
        </div>
      </div>
    </section>
  `;
}

export function setupResultsHandlers(onReset) {
  const btnScreenshot = document.getElementById('btn-screenshot');
  const btnReset = document.getElementById('btn-reset');

  if (btnScreenshot) {
    btnScreenshot.addEventListener('click', async () => {
      const area = document.getElementById('screenshot-area');
      if (area) {
        btnScreenshot.textContent = 'Menyimpan...';
        const success = await takeScreenshot(area);
        btnScreenshot.innerHTML = success
          ? '<span class="icon">✅</span> Tersimpan!'
          : '<span class="icon">❌</span> Gagal';
        setTimeout(() => {
          btnScreenshot.innerHTML = '<span class="icon">📸</span> Simpan Gambar';
        }, 2000);
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', onReset);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
