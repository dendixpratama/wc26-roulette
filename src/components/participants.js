/**
 * Participants Input Section Component
 */

export function renderParticipants() {
  return `
    <section class="section participants" id="section-participants">
      <h2 class="section-title">👥 Peserta Undian</h2>
      <p class="section-subtitle">
        Masukkan nama peserta yang ikut undian (minimal 2, maksimal 12 orang).
      </p>

      <div class="participants__container">
        <div class="participants__input-wrapper">
          <input
            type="text"
            class="input"
            id="input-name"
            placeholder="Ketik nama peserta..."
            maxlength="30"
            autocomplete="off"
          />
          <button class="btn btn--secondary btn--small" id="btn-add">
            <span class="icon">+</span> Tambah
          </button>
        </div>

        <div class="participants__list" id="participants-list"></div>

        <div class="participants__footer">
          <div class="participants__count" id="participants-count">
            <span>0</span> / 12 peserta
          </div>
          <button class="btn btn--gold" id="btn-confirm" disabled>
            <span class="icon">🎰</span>
            Mulai Undian
          </button>
        </div>
      </div>
    </section>
  `;
}

/**
 * Set up event handlers for participant input
 */
export function setupParticipantHandlers(state, onUpdate) {
  const input = document.getElementById('input-name');
  const btnAdd = document.getElementById('btn-add');
  const btnConfirm = document.getElementById('btn-confirm');
  const list = document.getElementById('participants-list');
  const countEl = document.getElementById('participants-count');

  function addParticipant() {
    const name = input.value.trim();
    if (!name) return;
    if (state.participants.length >= 12) {
      shakeElement(input);
      return;
    }
    if (state.participants.some(p => p.toLowerCase() === name.toLowerCase())) {
      shakeElement(input);
      return;
    }

    state.participants.push(name);
    input.value = '';
    input.focus();
    updateList();
    onUpdate();
  }

  function removeParticipant(index) {
    state.participants.splice(index, 1);
    updateList();
    onUpdate();
  }

  function updateList() {
    list.innerHTML = state.participants.map((name, i) => `
      <div class="participant-item" style="animation-delay: ${i * 0.03}s">
        <div class="participant-item__info">
          <div class="participant-item__number">${i + 1}</div>
          <div class="participant-item__name">${escapeHtml(name)}</div>
        </div>
        <button class="participant-item__remove" data-index="${i}" title="Hapus">✕</button>
      </div>
    `).join('');

    countEl.innerHTML = `<span>${state.participants.length}</span> / 12 peserta`;
    btnConfirm.disabled = state.participants.length < 2;

    // Rebind remove buttons
    list.querySelectorAll('.participant-item__remove').forEach(btn => {
      btn.addEventListener('click', () => {
        removeParticipant(parseInt(btn.dataset.index));
      });
    });
  }

  btnAdd.addEventListener('click', addParticipant);

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addParticipant();
    }
  });

  btnConfirm.addEventListener('click', () => {
    if (state.participants.length >= 2) {
      onUpdate('confirm');
    }
  });
}

function shakeElement(el) {
  el.style.animation = 'none';
  el.offsetHeight; // force reflow
  el.style.animation = 'shake 0.4s ease';
  setTimeout(() => { el.style.animation = ''; }, 400);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
