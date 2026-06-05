/**
 * Hero Section Component
 */
export function renderHero() {
  return `
    <section class="section hero" id="section-hero">
      <span class="hero__floating">⚽</span>
      <span class="hero__floating">🏆</span>
      <span class="hero__floating">🥅</span>
      <span class="hero__floating">⭐</span>

      <div class="hero__badge">
        <span class="dot"></span>
        FIFA World Cup 2026
      </div>

      <h1 class="hero__title">
        <span class="gradient-text">Ayo pilih tim</br> jagoan lo sekarang!</span>
      </h1>

      <p class="hero__description">
        Harga diri merasa di pertaruhkan? </br> Buruan deh masukin nama-nama temen lo dan biarkan keberuntungan yang bekerja! 🔥
      </p>

      <div class="hero__cta">
        <button class="btn btn--primary" id="btn-start">
          <span class="icon">🚀</span>
          Gaskeun Sekarang!
        </button>
      </div>

      <div class="hero__stats">
        <div class="hero__stat">
          <div class="hero__stat-value">48</div>
          <div class="hero__stat-label">Negara</div>
        </div>
        <div class="hero__stat">
          <div class="hero__stat-value">12</div>
          <div class="hero__stat-label">Grup</div>
        </div>
        <div class="hero__stat">
          <div class="hero__stat-value">3</div>
          <div class="hero__stat-label">Tuan Rumah</div>
        </div>
      </div>
    </section>
  `;
}
