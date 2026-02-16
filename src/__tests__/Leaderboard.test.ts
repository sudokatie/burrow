// Tests for Burrow leaderboard

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard,
  calculateScore,
  LeaderboardEntry,
} from '../game/Leaderboard';

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('getLeaderboard', () => {
    it('returns empty array when no entries', () => {
      expect(getLeaderboard()).toEqual([]);
    });

    it('returns stored entries', () => {
      const entry: LeaderboardEntry = {
        name: 'Deepholm',
        score: 5000,
        daysLived: 200,
        maxColonists: 12,
        tilesBuilt: 150,
        date: '2026-02-16',
      };
      addEntry(entry);
      expect(getLeaderboard()).toHaveLength(1);
      expect(getLeaderboard()[0].name).toBe('Deepholm');
    });
  });

  describe('addEntry', () => {
    it('adds entry to leaderboard', () => {
      const entry: LeaderboardEntry = {
        name: 'Ironhall',
        score: 3500,
        daysLived: 150,
        maxColonists: 8,
        tilesBuilt: 100,
        date: '2026-02-16',
      };
      const result = addEntry(entry);
      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(3500);
    });

    it('sorts entries by score descending', () => {
      addEntry({ name: 'Small', score: 1000, daysLived: 50, maxColonists: 4, tilesBuilt: 30, date: '2026-02-16' });
      addEntry({ name: 'Large', score: 5000, daysLived: 200, maxColonists: 15, tilesBuilt: 200, date: '2026-02-16' });
      addEntry({ name: 'Medium', score: 2500, daysLived: 100, maxColonists: 8, tilesBuilt: 80, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('Large');
      expect(entries[1].name).toBe('Medium');
      expect(entries[2].name).toBe('Small');
    });

    it('sorts by days when scores equal', () => {
      addEntry({ name: 'ShortLived', score: 2000, daysLived: 50, maxColonists: 5, tilesBuilt: 50, date: '2026-02-16' });
      addEntry({ name: 'LongLived', score: 2000, daysLived: 150, maxColonists: 5, tilesBuilt: 50, date: '2026-02-16' });
      
      const entries = getLeaderboard();
      expect(entries[0].name).toBe('LongLived');
      expect(entries[1].name).toBe('ShortLived');
    });

    it('limits to 10 entries', () => {
      for (let i = 0; i < 15; i++) {
        addEntry({
          name: `Colony${i}`,
          score: i * 500,
          daysLived: i * 20,
          maxColonists: i + 3,
          tilesBuilt: i * 15,
          date: '2026-02-16',
        });
      }
      expect(getLeaderboard()).toHaveLength(10);
    });
  });

  describe('getTop', () => {
    it('returns top N entries', () => {
      for (let i = 0; i < 5; i++) {
        addEntry({
          name: `Colony${i}`,
          score: (i + 1) * 1000,
          daysLived: (i + 1) * 30,
          maxColonists: i + 5,
          tilesBuilt: (i + 1) * 20,
          date: '2026-02-16',
        });
      }
      const top3 = getTop(3);
      expect(top3).toHaveLength(3);
      expect(top3[0].score).toBe(5000);
    });
  });

  describe('wouldRank', () => {
    it('returns rank when board not full', () => {
      addEntry({ name: 'Test', score: 2000, daysLived: 80, maxColonists: 6, tilesBuilt: 50, date: '2026-02-16' });
      expect(wouldRank(3000)).toBe(1);
      expect(wouldRank(1000)).toBe(2);
    });

    it('returns null when would not rank on full board', () => {
      for (let i = 0; i < 10; i++) {
        addEntry({
          name: `Colony${i}`,
          score: (i + 1) * 500,
          daysLived: (i + 1) * 20,
          maxColonists: i + 3,
          tilesBuilt: (i + 1) * 10,
          date: '2026-02-16',
        });
      }
      expect(wouldRank(100)).toBeNull();
    });
  });

  describe('getRank', () => {
    it('returns rank for existing score', () => {
      addEntry({ name: 'First', score: 4000, daysLived: 150, maxColonists: 10, tilesBuilt: 100, date: '2026-02-16' });
      addEntry({ name: 'Second', score: 2000, daysLived: 80, maxColonists: 6, tilesBuilt: 50, date: '2026-02-16' });
      const entries = getLeaderboard();
      expect(getRank(entries[0].score)).toBe(1);
      expect(getRank(entries[1].score)).toBe(2);
    });

    it('returns null for non-existent score', () => {
      addEntry({ name: 'Test', score: 2000, daysLived: 80, maxColonists: 6, tilesBuilt: 50, date: '2026-02-16' });
      expect(getRank(5000)).toBeNull();
    });
  });

  describe('clearLeaderboard', () => {
    it('removes all entries', () => {
      addEntry({ name: 'Test', score: 2000, daysLived: 80, maxColonists: 6, tilesBuilt: 50, date: '2026-02-16' });
      clearLeaderboard();
      expect(getLeaderboard()).toEqual([]);
    });
  });

  describe('calculateScore', () => {
    it('calculates score from colony stats', () => {
      // 100 days * 10 = 1000
      // 10 colonists * 100 = 1000
      // 50 tiles * 5 = 250
      // 30 items * 2 = 60
      // Total = 2310
      const score = calculateScore(100, 10, 50, 30);
      expect(score).toBe(2310);
    });

    it('handles minimal colony', () => {
      const score = calculateScore(10, 3, 5, 0);
      expect(score).toBe(100 + 300 + 25); // 425
    });

    it('handles thriving colony', () => {
      const score = calculateScore(365, 20, 200, 500);
      expect(score).toBe(3650 + 2000 + 1000 + 1000); // 7650
    });
  });
});
