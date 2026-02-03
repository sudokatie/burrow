import { TileType, ItemType, TaskType, BuildType, Trait } from './types';

// World dimensions
export const WORLD_WIDTH = 64;
export const WORLD_HEIGHT = 48;
export const TILE_SIZE = 16;

// Canvas
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

// Time
export const DAY_START_HOUR = 6;
export const NIGHT_START_HOUR = 20;
export const STARTING_DAY = 1;
export const STARTING_HOUR = 8;

// Colonists
export const STARTING_COLONISTS = 3;
export const MAX_SKILL = 20;
export const MIN_SKILL = 1;

// Need decay rates per second
export const NEED_DECAY: Record<keyof import('./types').Needs, number> = {
  health: 0,      // Only decays when starving
  hunger: 0.5,
  rest: 0.3,
  mood: 0.1
};

// Need thresholds
export const NEED_THRESHOLDS = {
  good: 75,
  okay: 50,
  bad: 25,
  critical: 0
};

// Trait modifiers
export const TRAIT_WORK_MODIFIER: Record<Trait, number> = {
  [Trait.HARDWORKER]: 0.2,
  [Trait.LAZY]: -0.2,
  [Trait.OPTIMIST]: 0,
  [Trait.PESSIMIST]: 0,
  [Trait.TOUGH]: 0
};

export const TRAIT_MOOD_MODIFIER: Record<Trait, number> = {
  [Trait.HARDWORKER]: 0,
  [Trait.LAZY]: 0,
  [Trait.OPTIMIST]: 0.5,
  [Trait.PESSIMIST]: -0.5,
  [Trait.TOUGH]: 0
};

export const TRAIT_HEALTH_MODIFIER: Record<Trait, number> = {
  [Trait.HARDWORKER]: 0,
  [Trait.LAZY]: 0,
  [Trait.OPTIMIST]: 0,
  [Trait.PESSIMIST]: 0,
  [Trait.TOUGH]: 0.25
};

// Work times (ticks to complete, at 10 ticks/second)
export const WORK_TIMES: Record<TaskType, number> = {
  [TaskType.MINE]: 100,
  [TaskType.CHOP]: 80,
  [TaskType.HAUL]: 20,
  [TaskType.BUILD]: 50,  // Base, modified by build type
  [TaskType.COOK]: 40,
  [TaskType.EAT]: 30,
  [TaskType.SLEEP]: 0    // Sleep uses time-based restoration
};

export const BUILD_WORK_TIMES: Record<BuildType, number> = {
  [BuildType.WALL]: 50,
  [BuildType.FLOOR]: 30,
  [BuildType.DOOR]: 40,
  [BuildType.BED]: 60,
  [BuildType.STOCKPILE]: 0
};

// Build costs
export const BUILD_COSTS: Record<BuildType, Partial<Record<ItemType, number>>> = {
  [BuildType.WALL]: { [ItemType.STONE]: 2 },
  [BuildType.FLOOR]: { [ItemType.STONE]: 1 },
  [BuildType.DOOR]: { [ItemType.WOOD]: 1 },
  [BuildType.BED]: { [ItemType.WOOD]: 2 },
  [BuildType.STOCKPILE]: {}
};

// Resource yields
export const MINE_YIELD = 2;  // Stone from mining rock
export const CHOP_YIELD = 2;  // Wood from chopping tree

// Item stacking
export const MAX_STACK = 99;

// Need satisfaction
export const MEAL_HUNGER_RESTORE = 50;
export const SLEEP_REST_PER_SECOND = 2;
export const STARVATION_DAMAGE = 1;  // Health lost per second when hunger = 0

// ASCII characters
export const ASCII_CHARS: Record<TileType | 'COLONIST' | 'ITEM' | 'BED' | 'STOCKPILE_ZONE', string> = {
  [TileType.GRASS]: '.',
  [TileType.ROCK]: '#',
  [TileType.TREE]: 'T',
  [TileType.WATER]: '~',
  [TileType.FLOOR]: '_',
  [TileType.WALL]: 'W',
  [TileType.DOOR]: '+',
  COLONIST: '@',
  ITEM: 'o',
  BED: 'B',
  STOCKPILE_ZONE: 'S'
};

// Colors (terminal-style)
export const TILE_COLORS: Record<TileType, string> = {
  [TileType.GRASS]: '#4a7a4a',
  [TileType.ROCK]: '#6a6a6a',
  [TileType.TREE]: '#2a5a2a',
  [TileType.WATER]: '#4a6a9a',
  [TileType.FLOOR]: '#5a5a4a',
  [TileType.WALL]: '#8a7a6a',
  [TileType.DOOR]: '#6a5a4a'
};

export const ENTITY_COLORS = {
  colonist: '#ffffff',
  colonistSelected: '#ffff00',
  item: '#7acaca',
  designation: '#ff8844',
  stockpile: '#aa88ff'
};

// Colonist names
export const COLONIST_NAMES = [
  'Nira', 'Josk', 'Val', 'Bram', 'Petra',
  'Kira', 'Thom', 'Alia', 'Dex', 'Yara',
  'Finn', 'Mira', 'Ryn', 'Cade', 'Lira'
];

// Message log
export const MAX_MESSAGES = 10;

// Forage spawn
export const FORAGE_SPAWN_INTERVAL = 60;  // Game seconds between spawns
export const FORAGE_SPAWN_CHANCE = 0.3;   // Chance per interval
