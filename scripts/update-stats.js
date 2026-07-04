import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
// Import existing data
import { TEAM_STATS } from '../src/data/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const statsFilePath = path.resolve(__dirname, '../src/data/stats.js');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function execute() {
  console.log("🚀 Memulai proses Update Squad dari WIKIPEDIA...\n");

  const wikiPaths = {
    'Prancis': 'France_national_football_team', 
    'Inggris': 'England_national_football_team', 
    'Spanyol': 'Spain_national_football_team',
    'Jerman': 'Germany_national_football_team', 
    'Brasil': 'Brazil_national_football_team', 
    'Amerika Serikat': 'United_States_men%27s_national_soccer_team',
    'Meksiko': 'Mexico_national_football_team', 
    'Kanada': 'Canada_men%27s_national_soccer_team', 
    'Maroko': 'Morocco_national_football_team',
    'Swiss': 'Switzerland_national_football_team', 
    'Belanda': 'Netherlands_national_football_team', 
    'Kroasia': 'Croatia_national_football_team',
    'Korea Selatan': 'South_Korea_national_football_team', 
    'Jepang': 'Japan_national_football_team',
    'Belgia': 'Belgium_national_football_team',
    'Norwegia': 'Norway_national_football_team',
    'Paraguay': 'Paraguay_national_football_team',
    'Mesir': 'Egypt_national_football_team', 
    'Kolombia': 'Colombia_national_football_team',
    'Argentina': 'Argentina_national_football_team',
    'Portugal': 'Portugal_national_football_team'
  };

  const teamNames = Object.keys(TEAM_STATS);
  // Deep clone to memory
  const NEW_STATS = JSON.parse(JSON.stringify(TEAM_STATS));

  for (const tName of teamNames) {
    const wikiPath = wikiPaths[tName];
    if (!wikiPath) continue;
    
    console.log(`🔍 Memasuki Wikipedia: ${tName}...`);
    
    try {
      const res = await fetch(`https://en.wikipedia.org/wiki/${wikiPath}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const html = await res.text();
      const $ = cheerio.load(html);
      
      // Bersihkan elemen pengganggu
      $('style').remove();
      $('sup').remove();
      
      // Auto-Coach
      let coach = $('.infobox th:contains("Head coach"), .infobox th:contains("Manager")').next('td').text().trim();
      if(coach) {
        NEW_STATS[tName].coach = coach;
        console.log(`   👔 Coach: ${coach}`);
      }

      // Auto-Nickname
      let nicknameTd = $('.infobox th:contains("Nickname")').next('td');
      let nickname = '';
      if (nicknameTd.find('li').length > 0) {
        nickname = nicknameTd.find('li').first().text().split(',')[0].trim();
      } else {
        nickname = nicknameTd.text().split(',')[0].trim();
      }
      
      if(nickname) {
        NEW_STATS[tName].nickname = nickname;
        console.log(`   🏷️  Nickname: ${nickname}`);
      }
      
      let squadTable = $('#Current_squad').parent().nextAll('table.sortable, table.toccolours').first();
      if (!squadTable.length) squadTable = $('#Squad').parent().nextAll('table.sortable').first();
      if (!squadTable.length) squadTable = $('span:contains("Current squad")').parent().nextAll('table.sortable').first();
      
      if (!squadTable.length) {
        console.log(`⚠️ Tabel skuad tidak ditemukan untuk ${tName}.`);
        continue;
      }

      // Cari indeks kolom "Caps"
      let capsIdx = -1;
      squadTable.find('tr').first().find('th').each((idx, th) => {
        if ($(th).text().toLowerCase().includes('caps')) {
          capsIdx = idx;
        }
      });

      const playersList = { 'GK': [], 'DF': [], 'MF': [], 'FW': [] };

      squadTable.find('tr').each((i, row) => {
        const tds = $(row).find('td, th');
        if (tds.length >= 3 && i > 0) {
          let position = '';
          tds.each((j, td) => {
             const t = $(td).text().trim().replace(/[^A-Za-z]/g, '');
             if (['GK', 'DF', 'MF', 'FW'].includes(t)) position = t;
          });
          
          let playerName = '';
          let isCaptain = $(row).text().toLowerCase().includes('(captain') || $(row).text().toLowerCase().includes('(c)');
          
          const links = $(row).find('th, td').find('a').not('.image');
          links.each((j, link) => {
             const textLink = $(link).text().trim();
             if (textLink.length > 3 && !textLink.match(/current/i) && !['GK','DF','MF','FW'].includes(textLink)) {
               playerName = textLink;
               if(isCaptain) playerName += ' (C)';
               return false; 
             }
          });
          
          let caps = 0;
          if (capsIdx !== -1) {
            const capsText = $(tds[capsIdx]).text().replace(/[^0-9]/g, '');
            caps = parseInt(capsText, 10) || 0;
          }
          
          if (position && playerName) {
            playersList[position].push({ name: playerName, caps });
          }
        }
      });

      // Urutkan (Sorting) berdasarkan jumlah Caps terbanyak (Descending)
      ['GK', 'DF', 'MF', 'FW'].forEach(pos => {
        playersList[pos].sort((a, b) => b.caps - a.caps);
      });

      const fw = playersList['FW'] && playersList['FW'].length > 0 ? playersList['FW'][0].name : 'Random FW';
      const mf1 = playersList['MF'] && playersList['MF'].length > 0 ? playersList['MF'][0].name : 'Random MF1';
      const mf2 = playersList['MF'] && playersList['MF'].length > 1 ? playersList['MF'][1].name : (playersList['MF'] && playersList['MF'].length > 0 ? playersList['MF'][0].name : 'Random MF2');
      const df = playersList['DF'] && playersList['DF'].length > 0 ? playersList['DF'][0].name : 'Random DF';
      const gk = playersList['GK'] && playersList['GK'].length > 0 ? playersList['GK'][0].name : 'Random GK';
      
      const newSquadArray = [fw, mf1, mf2, df, gk];
      
      if (newSquadArray.filter(n => n.includes('Random')).length < 5) {
        NEW_STATS[tName].players = newSquadArray;
        console.log(`   🟢 Squad Updated! (Termasuk Kapten)`);
      }

      await sleep(300);

    } catch (e) {
      console.error(`❌ Gagal scrap data untuk ${tName}:`, e.message);
    }
  }

  // Rewrite File
  const fileContent = `export const TEAM_STATS = ${JSON.stringify(NEW_STATS, null, 2)};\n`;
  fs.writeFileSync(statsFilePath, fileContent, 'utf8');
  console.log("\n🎉 SELURUH DATA [PELATIH, JULUKAN, & KAPTEN] TELAH DIPERBARUI!");
}

execute();
