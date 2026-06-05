/**
 * Groups Display Section Component
 */
import { GROUPS } from '../data/groups.js';

export function renderGroups() {
  const cards = GROUPS.map((group, i) => `
    <div class="group-card" id="group-card-${group.name}" data-group="${group.name}" style="animation-delay: ${i * 0.05}s">
      <div class="group-card__header">
        <div class="group-card__letter">${group.name}</div>
        <div class="group-card__name">Grup ${group.name}</div>
      </div>
      <div class="group-card__teams" id="teams-${group.name}">
        ${group.teams.map(team => `
          <div class="group-card__team" data-team="${team.name}">
            <img src="https://flagcdn.com/w40/${team.code.toLowerCase()}.png" class="group-card__flag-img" alt="${team.name}">
            <span class="group-card__team-name">${team.name}</span>
            <span class="group-card__team-owner hidden"></span>
          </div>
        `).join('')}
      </div>
      <div class="group-card__assigned-to" id="assigned-${group.name}"></div>
    </div>
  `).join('');

  return `
    <section class="section section--auto groups" id="section-groups">
      <h2 class="section-title">🏆 Grup Piala Dunia 2026</h2>
      <p class="section-subtitle">
        48 negara terbagi dalam 12 grup. Setiap peserta undian akan mendapatkan satu grup secara acak.
      </p>
      <div class="groups-grid">
        ${cards}
      </div>
    </section>
  `;
}

/**
 * Highlight a group card as assigned
 */
export function markGroupAssigned(groupName, participantName, teamName) {
  const card = document.getElementById(`group-card-${groupName}`);
  const teamEl = card ? card.querySelector(`[data-team="${teamName}"]`) : null;
  
  if (teamEl) {
    teamEl.classList.add('team-assigned');
    const ownerEl = teamEl.querySelector('.group-card__team-owner');
    if (ownerEl) {
      ownerEl.textContent = participantName;
      ownerEl.classList.remove('hidden');
    }
  }
}
