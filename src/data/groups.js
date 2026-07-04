/**
 * FIFA World Cup 2026 — Group Stage Data
 * 48 teams, 12 groups (A–L), 4 teams per group
 */

export const GROUPS = [
  {
    name: 'A',
    teams: [
      { name: 'Prancis', code: 'fr', flag: '🇫🇷' },
      { name: 'Paraguay', code: 'py', flag: '🇵🇾' },
      { name: 'Kanada', code: 'ca', flag: '🇨🇦' },
      { name: 'Maroko', code: 'ma', flag: '🇲🇦' },
    ],
  },
  {
    name: 'B',
    teams: [
      { name: 'Portugal', code: 'pt', flag: '🇵🇹' },
      { name: 'Amerika Serikat', code: 'us', flag: '🇺🇸' },
      { name: 'Belgia', code: 'be', flag: '🇧🇪' },
      { name: 'Brasil', code: 'br', flag: '🇧🇷' },
    ],
  },
  {
    name: 'C',
    teams: [
      { name: 'Norwegia', code: 'no', flag: '🇳🇴' },
      { name: 'Meksiko', code: 'mx', flag: '🇲🇽' },
      { name: 'Inggris', code: 'gb-eng', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { name: 'Argentina', code: 'ar', flag: '🇦🇷' },
    ],
  },
  {
    name: 'D',
    teams: [
      { name: 'Mesir', code: 'eg', flag: '🇪🇬' },
      { name: 'Swiss', code: 'ch', flag: '🇨🇭' },
      { name: 'Kolombia', code: 'co', flag: '🇨🇴' },
      { name: 'Spanyol', code: 'es', flag: '🇪🇸' },
    ],
  },
];

/**
 * Color palette for roulette wheel segments
 */
export const SEGMENT_COLORS = [
  '#E8175D', // magenta
  '#00B4D8', // cyan
  '#FFD700', // gold
  '#7B2FF7', // purple
  '#00E676', // green
  '#FF6D00', // orange
  '#E040FB', // pink
  '#00E5FF', // light cyan
  '#FFEA00', // yellow
  '#448AFF', // blue
  '#FF1744', // red
  '#76FF03', // lime
];
