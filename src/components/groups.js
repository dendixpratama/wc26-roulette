/**
 * Groups Display Section Component
 * Revamped into a Bracket Tournament UI
 */
import { GROUPS } from '../data/groups.js';

export function renderGroups() {
  const teams = GROUPS.flatMap(g => g.teams.map(t => ({ ...t, groupName: g.name })));

  // Arrange them into matchups mimicking the provided screenshot order
  const m1 = { date: 'Jul 5', t1: teams[0], t2: teams[1] }; // Paraguay vs Prancis
  const m2 = { date: 'Jul 5', t1: teams[2], t2: teams[3] }; // Kanada vs Maroko
  const m3 = { date: 'Jul 7', t1: teams[4], t2: teams[15] }; // Portugal vs Spanyol
  const m4 = { date: 'Jul 7', t1: teams[5], t2: teams[6] }; // USA vs Belgia

  const m5 = { date: 'Jul 6', t1: teams[7], t2: teams[8] }; // Brasil vs Norwegia
  const m6 = { date: 'Jul 6', t1: teams[9], t2: teams[10] }; // Meksiko vs Inggris
  const m7 = { date: 'Jul 7', t1: teams[11], t2: teams.find(t => t.name.includes('Australia')) }; // Argentina vs Australia/Mesir
  const m8 = { date: 'Jul 8', t1: teams[13], t2: teams.find(t => t.name.includes('Kolombia')) }; // Swiss vs Kolombia/Ghana

  const renderTeam = (team) => `
    <div class="bracket-team" data-team="${team.name}">
      <img src="https://flagcdn.com/w40/${team.code.toLowerCase()}.png" class="bracket-flag" alt="${team.name}">
      <span class="bracket-team-name">${team.name}</span>
      <span class="bracket-team-owner hidden"></span>
    </div>
  `;

  const renderMatch = (m) => `
    <div class="bracket-match">
      <div class="bracket-match-date">${m.date || m.t1Label}</div>
      <div class="bracket-match-teams">
        ${m.t1 ? renderTeam(m.t1) : `<div class="bracket-team empty" data-slot="${m.t1Label}"><div class="bracket-shield">🛡️</div> <span class="bracket-team-name text-dim">${m.t1Label}</span></div>`}
        ${m.t2 ? renderTeam(m.t2) : `<div class="bracket-team empty" data-slot="${m.t2Label}"><div class="bracket-shield">🛡️</div> <span class="bracket-team-name text-dim">${m.t2Label}</span></div>`}
      </div>
    </div>
  `;

  return `
    <section class="section section--auto groups" id="section-groups">
      <h2 class="section-title">🏆 Panggung Pemenang</h2>
      <p class="section-subtitle">
        16 Negara Tersisa. Setiap peserta undian akan mendapatkan satu negara secara acak.
      </p>
      
      <div class="bracket-wrapper">
        <div class="bracket-container">
          
          <!-- Round 16 - Left -->
          <div class="bracket-col bracket-col-left">
            ${renderMatch(m1)}
            ${renderMatch(m2)}
            ${renderMatch(m3)}
            ${renderMatch(m4)}
          </div>
          
          <!-- Quarter Final - Left -->
          <div class="bracket-col bracket-col-left">
            ${renderMatch({ date: 'Jul 10', t1Label: 'W89', t2Label: 'W90' })}
            ${renderMatch({ date: 'Jul 11', t1Label: 'W93', t2Label: 'W94' })}
          </div>
          
          <!-- Semi Final - Left -->
          <div class="bracket-col bracket-col-left">
            ${renderMatch({ date: 'Jul 15', t1Label: 'W97', t2Label: 'W98' })}
          </div>
          
          <!-- Final -->
          <div class="bracket-col col-final">
            <div class="bracket-match match-final">
              <div class="bracket-match-date highlight">Final - Jul 20</div>
              <div class="bracket-match-teams">
                 <div class="bracket-team empty" data-slot="W101"><div class="bracket-shield gold">🏆</div> <span class="bracket-team-name text-dim">W101</span></div>
                 <div class="bracket-team empty" data-slot="W102"><div class="bracket-shield gold">🏆</div> <span class="bracket-team-name text-dim">W102</span></div>
              </div>
            </div>
          </div>
          
          <!-- Semi Final - Right -->
          <div class="bracket-col bracket-col-right">
            ${renderMatch({ date: 'Jul 16', t1Label: 'W99', t2Label: 'W100' })}
          </div>
          
          <!-- Quarter Final - Right -->
          <div class="bracket-col bracket-col-right">
            ${renderMatch({ date: 'Jul 12', t1Label: 'W91', t2Label: 'W92' })}
            ${renderMatch({ date: 'Jul 12', t1Label: 'W95', t2Label: 'W96' })}
          </div>
          
          <!-- Round 16 - Right -->
          <div class="bracket-col bracket-col-right">
            ${renderMatch(m5)}
            ${renderMatch(m6)}
            ${renderMatch(m7)}
            ${renderMatch(m8)}
          </div>
          
        </div>
      </div>
    </section>
  `;
}

/**
 * Highlight a bracket team as assigned
 */
export function markGroupAssigned(groupName, participantName, teamName) {
  const teams = document.querySelectorAll('.bracket-team:not(.empty)');
  let teamEl = null;

  for (let i = 0; i < teams.length; i++) {
    if (teams[i].getAttribute('data-team') === teamName) {
      teamEl = teams[i];
      break;
    }
  }

  if (teamEl) {
    // 1. Mark origin team
    teamEl.classList.add('team-assigned');
    const ownerEl = teamEl.querySelector('.bracket-team-owner');
    if (ownerEl) {
      ownerEl.textContent = participantName;
      ownerEl.classList.remove('hidden');
    }
  }
}
