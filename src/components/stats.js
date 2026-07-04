import { GROUPS } from '../data/groups.js';
import { TEAM_STATS } from '../data/stats.js';
import Chart from 'chart.js/auto';

let radarChartInstance = null;
let h2hMode = false;
let selectedTeams = [];

export function renderStatsPage() {
  const teams = GROUPS.flatMap(g => g.teams.map(t => ({ ...t, groupName: g.name })));

  const teamCards = teams.map((team, i) => {
    const val = TEAM_STATS[team.name]?.marketValue;
    const valueDisplay = val ? `€${val} Juta` : '?';
    return `
    <div class="stats-card" data-team="${team.name}" style="animation-delay: ${i * 0.05}s">
      <img src="https://flagcdn.com/w80/${team.code.toLowerCase()}.png" class="stats-card__flag" alt="${team.name}">
      <div class="stats-card__info">
        <h3>${team.name}</h3>
        <span class="badge">Value: ${valueDisplay}</span>
      </div>
    </div>
  `}).join('');

  return `
    <section class="section section--auto stats-page" id="section-stats-page">
      <div class="stats-header">
        <button class="btn btn--secondary btn--small" id="btn-back-home">
          ← Kembali ke Undian
        </button>
        <h2 class="section-title">Ensiklopedi Skuad ⚽</h2>
        <p class="section-subtitle">Statistik by wikipedia dan daftar pemain edisi world cup 2026</p>
        
        <div class="h2h-controls">
          <label class="h2h-toggle">
            <input type="checkbox" id="toggle-h2h">
            <span class="h2h-slider"></span>
            <span class="h2h-label">⚔️ Mode Versus (Bandingkan 2 Tim)</span>
          </label>
          <div id="h2h-instruction" class="h2h-instruction hidden">Pilih 2 negara untuk diadu!</div>
        </div>
      </div>

      <div class="stats-grid" id="stats-grid-container">
        ${teamCards}
      </div>

      <!-- Detail Modal -->
      <div class="stats-modal hidden" id="stats-modal">
        <div class="stats-modal__overlay" id="stats-modal-overlay"></div>
        <div class="stats-modal__content">
          <button class="stats-modal__close" id="btn-close-modal">✕</button>
          
          <div class="stats-modal__header" id="modal-header">
             <!-- Injected dynamically -->
          </div>
          
          <div class="stats-modal__power-bar" id="modal-power-bar">
             <!-- Probability Bar Injected dynamically -->
          </div>
          
          <div class="stats-modal__body">
            <div class="stats-modal__left" id="modal-left-panel">
               <!-- Left Panel Content Injected dynamically -->
            </div>
            
            <div class="stats-modal__right">
              <canvas id="modal-radar-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function bindStatsEvents(onBack) {
  const btnBack = document.getElementById('btn-back-home');
  if (btnBack) btnBack.addEventListener('click', onBack);

  const toggleH2h = document.getElementById('toggle-h2h');
  const h2hInst = document.getElementById('h2h-instruction');
  const cards = document.querySelectorAll('.stats-card');

  if (toggleH2h) {
    toggleH2h.addEventListener('change', (e) => {
      h2hMode = e.target.checked;
      selectedTeams = [];
      cards.forEach(c => c.classList.remove('selected'));
      if (h2hMode) {
        h2hInst.classList.remove('hidden');
      } else {
        h2hInst.classList.add('hidden');
      }
    });
  }

  const modal = document.getElementById('stats-modal');
  const overlay = document.getElementById('stats-modal-overlay');
  const btnClose = document.getElementById('btn-close-modal');

  const closeModal = () => {
    modal.classList.add('hidden');
    if (h2hMode) {
      selectedTeams = [];
      cards.forEach(c => c.classList.remove('selected'));
    }
  };

  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', closeModal);

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const teamName = card.getAttribute('data-team');

      if (!h2hMode) {
        openModal([teamName]);
      } else {
        if (selectedTeams.includes(teamName)) {
          // Deselect
          selectedTeams = selectedTeams.filter(t => t !== teamName);
          card.classList.remove('selected');
        } else {
          if (selectedTeams.length < 2) {
            selectedTeams.push(teamName);
            card.classList.add('selected');
          }
          if (selectedTeams.length === 2) {
            openModal(selectedTeams);
          }
        }
      }
    });
  });
}

function getTeamCode(teamName) {
  const t = GROUPS.flatMap(g => g.teams).find(x => x.name === teamName);
  return t ? t.code.toLowerCase() : 'un';
}

function calculateProbability(marketValue) {
  // Normalize market value from range (100 - 1600) to 20% - 98%
  let prob = Math.round((marketValue / 1600) * 98);
  if (prob > 98) prob = 98;
  if (prob < 20) prob = 20;
  return prob;
}

function renderMiniPitch(players, color = '#FFD700') {
  // Assuming array order: 0:FW, 1,2:MF, 3:DF, 4:GK
  const positions = [
    { top: '15%', left: '50%' }, // ST
    { top: '40%', left: '30%' }, // LM
    { top: '40%', left: '70%' }, // RM
    { top: '65%', left: '50%' }, // CB
    { top: '88%', left: '50%' }  // GK
  ];

  const tags = players.map((p, i) => {
    const isCap = p.includes('(C)');
    const dispName = p.replace('(C)', '').trim().split(' ').pop();
    const capBadge = isCap ? `<span class="captain-band">C</span>` : '';

    return `
    <div class="player-dot" style="top: ${positions[i]?.top || '50%'}; left: ${positions[i]?.left || '50%'}">
      ${capBadge}
      <div class="dot" style="background: ${color}"></div>
      <div class="name">${dispName}</div>
    </div>
  `}).join('');

  return `
    <div class="mini-pitch-wrapper">
      <h4 class="pitch-title">⭐ 5 Key Players</h4>
      <div class="mini-pitch">
        <div class="pitch-line pitch-center"></div>
        <div class="pitch-line pitch-circle"></div>
        <div class="pitch-line pitch-box-top"></div>
        <div class="pitch-line pitch-box-bottom"></div>
        ${tags}
      </div>
    </div>
  `;
}

function openModal(teamsToRender) {
  const modal = document.getElementById('stats-modal');
  if (!modal) return;

  const headerEl = document.getElementById('modal-header');
  const powerBarEl = document.getElementById('modal-power-bar');
  const leftPanelEl = document.getElementById('modal-left-panel');
  const canvas = document.getElementById('modal-radar-chart');

  // Single Mode
  if (teamsToRender.length === 1) {
    const tData = TEAM_STATS[teamsToRender[0]];
    const code = getTeamCode(teamsToRender[0]);

    headerEl.innerHTML = `
      <img src="https://flagcdn.com/w80/${code}.png" class="modal-flag" style="border-color: ${tData.color}; box-shadow: 0 0 15px ${tData.color}80;">
      <div class="modal-title-group">
         <h3>${teamsToRender[0]}</h3>
         <div class="modal-nickname"><em>${tData.nickname}</em></div>
         <div class="modal-coach">Coach: ${tData.coach}</div>
      </div>
    `;

    const prob = calculateProbability(tData.marketValue);
    powerBarEl.innerHTML = `
      <div class="prob-label">Win Probability: ${prob}%</div>
      <div class="prob-track">
        <div class="prob-fill prob-single" style="width: ${prob}%"></div>
      </div>
    `;

    leftPanelEl.innerHTML = `
      <div class="stat-box-row">
        <div class="stat-box">
          <div class="stat-box-label">FIFA Rank</div>
          <div class="stat-box-value">${tData.rank > 0 ? '#' + tData.rank : '-'}</div>
        </div>
        <div class="stat-box">
          <div class="stat-box-label">World Cup Trofi</div>
          <div class="stat-box-value">${tData.trophies}</div>
        </div>
      </div>
      ${renderMiniPitch(tData.players, tData.color)}
    `;

    renderChart(canvas, [{
      label: teamsToRender[0],
      data: tData.attributes,
      backgroundColor: tData.color + '40', // 25% opacity roughly
      borderColor: tData.color,
      colorType: 'gold'
    }]);

  } else if (teamsToRender.length === 2) {
    // H2H Mode
    const t1Data = TEAM_STATS[teamsToRender[0]];
    const t2Data = TEAM_STATS[teamsToRender[1]];
    const code1 = getTeamCode(teamsToRender[0]);
    const code2 = getTeamCode(teamsToRender[1]);

    headerEl.innerHTML = `
      <div class="h2h-header-side right-align">
         <h3>${teamsToRender[0]}</h3>
         <div class="modal-nickname"><em>${t1Data.nickname}</em></div>
         <img src="https://flagcdn.com/w80/${code1}.png" class="modal-flag" style="border-color: ${t1Data.color}">
      </div>
      <div class="h2h-header-vs">VS</div>
      <div class="h2h-header-side left-align">
         <img src="https://flagcdn.com/w80/${code2}.png" class="modal-flag" style="border-color: ${t2Data.color}">
         <h3>${teamsToRender[1]}</h3>
         <div class="modal-nickname"><em>${t2Data.nickname}</em></div>
      </div>
    `;

    // Calculate total gap and assign 100% split probability based on market value
    const totalValue = t1Data.marketValue + t2Data.marketValue;
    const p1 = Math.round((t1Data.marketValue / totalValue) * 100);
    const p2 = 100 - p1;

    powerBarEl.innerHTML = `
      <div class="prob-label dual-label">
        <span>Win Prob: ${p1}%</span>
        <span>Win Prob: ${p2}%</span>
      </div>
      <div class="prob-track h2h-track">
        <div class="prob-fill prob-t1" style="width: ${p1}%"></div>
        <div class="prob-fill prob-t2" style="width: ${p2}%"></div>
      </div>
    `;

    // Hide mini pitch for H2H to save space, just show stats comparison text
    leftPanelEl.innerHTML = `
      <div class="h2h-compare-box">
        <div class="h2h-row">
          <div class="h2h-val t1-val">€${t1Data.marketValue}M</div>
          <div class="h2h-label">MARKET VALUE</div>
          <div class="h2h-val t2-val">€${t2Data.marketValue}M</div>
        </div>
        <div class="h2h-row">
          <div class="h2h-val t1-val">${t1Data.rank}</div>
          <div class="h2h-label">FIFA RANK</div>
          <div class="h2h-val t2-val">${t2Data.rank}</div>
        </div>
        <div class="h2h-row">
          <div class="h2h-val t1-val">${t1Data.trophies}</div>
          <div class="h2h-label">WC TROPHIES</div>
          <div class="h2h-val t2-val">${t2Data.trophies}</div>
        </div>
      </div>
      <div class="h2h-keyplayers">
        <div class="kp-col">
          <strong>${t1Data.players[0]}</strong>
          <span>Key Player</span>
        </div>
        <div class="kp-vs">⚔️</div>
        <div class="kp-col">
          <strong>${t2Data.players[0]}</strong>
          <span>Key Player</span>
        </div>
      </div>
    `;

    renderChart(canvas, [
      {
        label: teamsToRender[0],
        data: t1Data.attributes,
        backgroundColor: t1Data.color + '40',
        borderColor: t1Data.color,
        colorType: 'blue'
      },
      {
        label: teamsToRender[1],
        data: t2Data.attributes,
        backgroundColor: t2Data.color + '40',
        borderColor: t2Data.color,
        colorType: 'red'
      }
    ]);
  }

  modal.classList.remove('hidden');
}

function renderChart(canvas, datasetsConfig) {
  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  const datasets = datasetsConfig.map(c => ({
    label: c.label,
    data: c.data,
    backgroundColor: c.backgroundColor,
    borderColor: c.borderColor,
    pointBackgroundColor: c.borderColor,
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: c.borderColor,
    borderWidth: 2,
  }));

  radarChartInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' },
          pointLabels: {
            color: 'rgba(255, 255, 255, 0.8)',
            font: { size: 12, family: 'Inter', weight: 'bold' }
          },
          ticks: {
            display: false,
            min: 50,
            max: 100
          }
        }
      },
      plugins: {
        legend: {
          display: datasetsConfig.length > 1,
          labels: { color: '#fff', font: { family: 'Inter' } }
        }
      }
    }
  });
}
