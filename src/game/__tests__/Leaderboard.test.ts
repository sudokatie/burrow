/**
 * @jest-environment jsdom
 */

import {
  getLeaderboard,
  addEntry,
  getTop,
  wouldRank,
  getRank,
  clearLeaderboard
} from '../Leaderboard';

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no entries', () => {
    expect(getLeaderboard()).toEqual([]);
  });

  it('should add an entry', () => {
    const entry = {
      name: 'Overseer',
      score: 8000,
      daysLived: 120,
      maxColonists: 25,
      tilesBuilt: 500,
      date: new Date().toISOString()
    };
    const entries = addEntry(entry);
    expect(entries[0].score).toBe(8000);
  });

  it('should sort by score descending', () => {
    addEntry({ name: 'Low', score: 2000, daysLived: 30, maxColonists: 8, tilesBuilt: 100, date: '2026-01-01' });
    addEntry({ name: 'High', score: 15000, daysLived: 200, maxColonists: 40, tilesBuilt: 800, date: '2026-01-02' });
    addEntry({ name: 'Mid', score: 7000, daysLived: 90, maxColonists: 18, tilesBuilt: 350, date: '2026-01-03' });

    const top = getTop();
    expect(top[0].name).toBe('High');
    expect(top[1].name).toBe('Mid');
    expect(top[2].name).toBe('Low');
  });

  it('should limit to max entries', () => {
    for (let i = 0; i < 15; i++) {
      addEntry({ name: `C${i}`, score: i * 1000, daysLived: i * 10, maxColonists: i * 3, tilesBuilt: i * 50, date: '2026-01-01' });
    }
    expect(getTop().length).toBe(10);
  });

  it('should persist to localStorage', () => {
    addEntry({ name: 'Saved', score: 5000, daysLived: 60, maxColonists: 15, tilesBuilt: 200, date: '2026-01-01' });
    const stored = JSON.parse(localStorage.getItem('burrow-leaderboard')!);
    expect(stored[0].name).toBe('Saved');
  });

  it('should check if score would rank', () => {
    addEntry({ name: 'First', score: 10000, daysLived: 150, maxColonists: 30, tilesBuilt: 600, date: '2026-01-01' });
    expect(wouldRank(12000)).toBe(1);
    expect(wouldRank(5000)).toBe(2);
  });

  it('should get rank by score', () => {
    addEntry({ name: 'First', score: 10000, daysLived: 150, maxColonists: 30, tilesBuilt: 600, date: '2026-01-01' });
    addEntry({ name: 'Second', score: 6000, daysLived: 80, maxColonists: 20, tilesBuilt: 300, date: '2026-01-02' });
    expect(getRank(10000)).toBe(1);
    expect(getRank(6000)).toBe(2);
    expect(getRank(99999)).toBeNull();
  });

  it('should clear all data', () => {
    addEntry({ name: 'Gone', score: 3000, daysLived: 40, maxColonists: 10, tilesBuilt: 150, date: '2026-01-01' });
    clearLeaderboard();
    expect(getLeaderboard().length).toBe(0);
  });

  it('should track colony stats', () => {
    addEntry({ name: 'Builder', score: 9000, daysLived: 140, maxColonists: 28, tilesBuilt: 550, date: '2026-01-01' });
    const entry = getTop()[0];
    expect(entry.daysLived).toBe(140);
    expect(entry.maxColonists).toBe(28);
    expect(entry.tilesBuilt).toBe(550);
  });
});
