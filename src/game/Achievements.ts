/**
 * Achievement system for Burrow (Dwarf Fortress lite)
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'exploration' | 'mastery' | 'daily';
}

export interface AchievementProgress { unlockedAt: number; }
export type AchievementStore = Record<string, AchievementProgress>;

export const ACHIEVEMENTS: Achievement[] = [
  // Skill
  { id: 'first_dig', name: 'Miner', description: 'Dig your first tile', icon: '⛏️', category: 'skill' },
  { id: 'first_room', name: 'Architect', description: 'Designate your first room', icon: '🏠', category: 'skill' },
  { id: 'first_craft', name: 'Crafter', description: 'Craft your first item', icon: '🔨', category: 'skill' },
  { id: 'first_farm', name: 'Farmer', description: 'Plant your first crop', icon: '🌾', category: 'skill' },
  { id: 'survive_attack', name: 'Defender', description: 'Survive an attack', icon: '⚔️', category: 'skill' },
  { id: 'year_one', name: 'Survivor', description: 'Survive one year', icon: '📅', category: 'skill' },

  // Exploration
  { id: 'deep_dig', name: 'Deep Delver', description: 'Dig 10 levels deep', icon: '⬇️', category: 'exploration' },
  { id: 'find_ore', name: 'Prospector', description: 'Find precious ore', icon: '💎', category: 'exploration' },
  { id: 'aquifer', name: 'Hydrologist', description: 'Breach an aquifer', icon: '💧', category: 'exploration' },

  // Mastery
  { id: 'population_20', name: 'Village', description: 'Reach 20 population', icon: '👥', category: 'mastery' },
  { id: 'population_50', name: 'Town', description: 'Reach 50 population', icon: '🏘️', category: 'mastery' },
  { id: 'wealth_10000', name: 'Prosperous', description: 'Accumulate 10,000 wealth', icon: '💰', category: 'mastery' },
  { id: 'legendary', name: 'Legendary', description: 'Train a legendary dwarf', icon: '🌟', category: 'mastery' },
  { id: 'megaproject', name: 'Engineer', description: 'Complete a megaproject', icon: '🏛️', category: 'mastery' },
  { id: 'five_years', name: 'Enduring', description: 'Survive 5 years', icon: '👑', category: 'mastery' },

  // Daily
  { id: 'daily_complete', name: 'Daily Overseer', description: 'Complete a daily challenge', icon: '📅', category: 'daily' },
  { id: 'daily_top_10', name: 'Daily Contender', description: 'Top 10 in daily', icon: '🔟', category: 'daily' },
  { id: 'daily_top_3', name: 'Daily Champion', description: 'Top 3 in daily', icon: '🥉', category: 'daily' },
  { id: 'daily_first', name: 'Daily Legend', description: 'First place in daily', icon: '🥇', category: 'daily' },
  { id: 'daily_streak_3', name: 'Consistent', description: '3-day streak', icon: '🔥', category: 'daily' },
  { id: 'daily_streak_7', name: 'Dedicated', description: '7-day streak', icon: '💪', category: 'daily' },
];

const STORAGE_KEY = 'burrow_achievements';
const STREAK_KEY = 'burrow_daily_streak';

export class AchievementManager {
  private store: AchievementStore;
  private dailyStreak: { lastDate: string; count: number };

  constructor() { this.store = this.load(); this.dailyStreak = this.loadStreak(); }

  private load(): AchievementStore { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } }
  private save(): void { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store)); } catch {} }
  private loadStreak() { try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{"lastDate":"","count":0}'); } catch { return { lastDate: '', count: 0 }; } }
  private saveStreak(): void { try { localStorage.setItem(STREAK_KEY, JSON.stringify(this.dailyStreak)); } catch {} }

  isUnlocked(id: string): boolean { return id in this.store; }
  getProgress(): AchievementStore { return { ...this.store }; }
  getUnlockedCount(): number { return Object.keys(this.store).length; }
  getTotalCount(): number { return ACHIEVEMENTS.length; }
  getAchievement(id: string) { return ACHIEVEMENTS.find((a) => a.id === id); }
  getAllAchievements() { return ACHIEVEMENTS; }

  unlock(id: string): Achievement | null {
    if (this.isUnlocked(id)) return null;
    const a = this.getAchievement(id); if (!a) return null;
    this.store[id] = { unlockedAt: Date.now() }; this.save(); return a;
  }

  checkAndUnlock(ids: string[]): Achievement[] {
    return ids.map((id) => this.unlock(id)).filter((a): a is Achievement => a !== null);
  }

  recordDailyCompletion(rank: number): Achievement[] {
    const unlocked: Achievement[] = [];
    let a = this.unlock('daily_complete'); if (a) unlocked.push(a);
    if (rank <= 10) { a = this.unlock('daily_top_10'); if (a) unlocked.push(a); }
    if (rank <= 3) { a = this.unlock('daily_top_3'); if (a) unlocked.push(a); }
    if (rank === 1) { a = this.unlock('daily_first'); if (a) unlocked.push(a); }
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (this.dailyStreak.lastDate === yesterday) this.dailyStreak.count++;
    else if (this.dailyStreak.lastDate !== today) this.dailyStreak.count = 1;
    this.dailyStreak.lastDate = today; this.saveStreak();
    if (this.dailyStreak.count >= 3) { a = this.unlock('daily_streak_3'); if (a) unlocked.push(a); }
    if (this.dailyStreak.count >= 7) { a = this.unlock('daily_streak_7'); if (a) unlocked.push(a); }
    return unlocked;
  }

  reset(): void { this.store = {}; this.dailyStreak = { lastDate: '', count: 0 }; this.save(); this.saveStreak(); }
}

let instance: AchievementManager | null = null;
export function getAchievementManager(): AchievementManager { if (!instance) instance = new AchievementManager(); return instance; }
