// Leaderboard for Burrow - tracks colony achievements

const STORAGE_KEY = 'burrow-leaderboard';
const MAX_ENTRIES = 10;

export interface LeaderboardEntry {
  name: string;
  score: number;
  daysLived: number;
  maxColonists: number;
  tilesBuilt: number;
  date: string;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable
  }
}

export function addEntry(entry: LeaderboardEntry): LeaderboardEntry[] {
  const entries = getLeaderboard();
  entries.push(entry);
  
  // Sort by score (descending), then days
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.daysLived - a.daysLived;
  });
  
  // Keep top N
  const trimmed = entries.slice(0, MAX_ENTRIES);
  saveLeaderboard(trimmed);
  return trimmed;
}

export function getTop(n: number = MAX_ENTRIES): LeaderboardEntry[] {
  return getLeaderboard().slice(0, n);
}

export function wouldRank(score: number): number | null {
  const entries = getLeaderboard();
  if (entries.length < MAX_ENTRIES) {
    const position = entries.findIndex(e => score > e.score);
    return position === -1 ? entries.length + 1 : position + 1;
  }
  
  const position = entries.findIndex(e => score > e.score);
  if (position === -1) return null;
  return position + 1;
}

export function getRank(score: number): number | null {
  const entries = getLeaderboard();
  const position = entries.findIndex(e => e.score === score);
  return position === -1 ? null : position + 1;
}

export function clearLeaderboard(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Calculate score from colony stats
export function calculateScore(
  daysLived: number,
  maxColonists: number,
  tilesBuilt: number,
  itemsStockpiled: number
): number {
  let score = 0;
  
  // Days survived (base)
  score += daysLived * 10;
  
  // Population bonus
  score += maxColonists * 100;
  
  // Construction bonus
  score += tilesBuilt * 5;
  
  // Wealth bonus
  score += itemsStockpiled * 2;
  
  return score;
}
