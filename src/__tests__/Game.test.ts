import {
  createGame,
  startGame,
  updateGame,
  pauseGame,
  resumeGame,
  togglePause,
  addMessage,
  setDesignMode,
  setSelectedBuild,
  designateArea,
  processColonistAI,
  spawnForageItems,
  getTimeString,
  isDaytime,
  isGameOver,
  resetForageTimer,
} from '../game/Game';
import { GameScreen, DesignMode, BuildType, ColonistState, TaskType, ItemType } from '../game/types';
import { setSeed } from '../game/World';
import { resetColonistIdCounter } from '../game/Colonist';
import { resetTaskIdCounter } from '../game/Task';
import { resetStockpileIdCounter } from '../game/Building';

beforeEach(() => {
  setSeed(12345);
  resetColonistIdCounter();
  resetTaskIdCounter();
  resetStockpileIdCounter();
  resetForageTimer();
});

describe('createGame', () => {
  test('creates game with default state', () => {
    const game = createGame();
    
    expect(game.screen).toBe(GameScreen.TITLE);
    expect(game.world.length).toBe(48);
    expect(game.world[0].length).toBe(64);
    expect(game.colonists).toHaveLength(0);
    expect(game.tasks).toHaveLength(0);
    expect(game.stockpiles).toHaveLength(0);
    expect(game.day).toBe(1);
    expect(game.hour).toBe(8);
    expect(game.minute).toBe(0);
    expect(game.paused).toBe(false);
    expect(game.messages).toHaveLength(0);
    expect(game.designMode).toBe(DesignMode.NONE);
    expect(game.selectedBuild).toBeNull();
  });
});

describe('startGame', () => {
  test('sets screen to playing', () => {
    const game = createGame();
    startGame(game);
    
    expect(game.screen).toBe(GameScreen.PLAYING);
  });
  
  test('spawns starting colonists', () => {
    const game = createGame();
    startGame(game);
    
    expect(game.colonists.length).toBe(3);
  });
  
  test('adds join messages', () => {
    const game = createGame();
    startGame(game);
    
    expect(game.messages.length).toBe(3);
    expect(game.messages[0]).toContain('has joined the colony');
  });
  
  test('spawns colonists near center', () => {
    const game = createGame();
    startGame(game);
    
    for (const colonist of game.colonists) {
      expect(colonist.pos.x).toBeGreaterThanOrEqual(30);
      expect(colonist.pos.x).toBeLessThanOrEqual(34);
      expect(colonist.pos.y).toBeGreaterThanOrEqual(22);
      expect(colonist.pos.y).toBeLessThanOrEqual(26);
    }
  });
});

describe('pause/resume', () => {
  test('pauseGame sets paused to true', () => {
    const game = createGame();
    pauseGame(game);
    expect(game.paused).toBe(true);
  });
  
  test('resumeGame sets paused to false', () => {
    const game = createGame();
    game.paused = true;
    resumeGame(game);
    expect(game.paused).toBe(false);
  });
  
  test('togglePause toggles state', () => {
    const game = createGame();
    expect(game.paused).toBe(false);
    
    togglePause(game);
    expect(game.paused).toBe(true);
    
    togglePause(game);
    expect(game.paused).toBe(false);
  });
});

describe('addMessage', () => {
  test('adds message to array', () => {
    const game = createGame();
    addMessage(game, 'Test message');
    
    expect(game.messages).toContain('Test message');
  });
  
  test('limits messages to max', () => {
    const game = createGame();
    
    for (let i = 0; i < 15; i++) {
      addMessage(game, `Message ${i}`);
    }
    
    expect(game.messages.length).toBe(10);
    expect(game.messages[0]).toBe('Message 5');
    expect(game.messages[9]).toBe('Message 14');
  });
});

describe('setDesignMode', () => {
  test('sets design mode', () => {
    const game = createGame();
    setDesignMode(game, DesignMode.MINE);
    
    expect(game.designMode).toBe(DesignMode.MINE);
  });
  
  test('clears selected build when not BUILD mode', () => {
    const game = createGame();
    game.selectedBuild = BuildType.WALL;
    
    setDesignMode(game, DesignMode.CHOP);
    
    expect(game.selectedBuild).toBeNull();
  });
  
  test('keeps selected build when BUILD mode', () => {
    const game = createGame();
    game.selectedBuild = BuildType.WALL;
    
    setDesignMode(game, DesignMode.BUILD);
    
    expect(game.selectedBuild).toBe(BuildType.WALL);
  });
});

describe('setSelectedBuild', () => {
  test('sets selected build and mode', () => {
    const game = createGame();
    setSelectedBuild(game, BuildType.DOOR);
    
    expect(game.selectedBuild).toBe(BuildType.DOOR);
    expect(game.designMode).toBe(DesignMode.BUILD);
  });
});

describe('designateArea', () => {
  test('creates mine tasks for rock tiles', () => {
    const game = createGame();
    setDesignMode(game, DesignMode.MINE);
    
    // Top-left corner has rock
    designateArea(game, { x: 0, y: 0 }, { x: 2, y: 2 });
    
    expect(game.tasks.length).toBeGreaterThan(0);
    expect(game.tasks[0].type).toBe(TaskType.MINE);
  });
  
  test('creates stockpile for valid tiles', () => {
    const game = createGame();
    setDesignMode(game, DesignMode.STOCKPILE);
    
    // Center has grass
    designateArea(game, { x: 30, y: 22 }, { x: 32, y: 24 });
    
    expect(game.stockpiles.length).toBe(1);
    expect(game.stockpiles[0].tiles.length).toBeGreaterThan(0);
  });
});

describe('updateGame', () => {
  test('does not update when paused', () => {
    const game = createGame();
    startGame(game);
    pauseGame(game);
    
    const initialMinute = game.minute;
    updateGame(game, 1);
    
    expect(game.minute).toBe(initialMinute);
  });
  
  test('does not update when not playing', () => {
    const game = createGame();
    // Still on title screen
    
    const initialMinute = game.minute;
    updateGame(game, 1);
    
    expect(game.minute).toBe(initialMinute);
  });
  
  test('advances time', () => {
    const game = createGame();
    startGame(game);
    
    updateGame(game, 60);
    
    expect(game.hour).toBe(9);
  });
  
  test('rolls over to next day', () => {
    const game = createGame();
    startGame(game);
    game.hour = 23;
    game.minute = 59;
    
    updateGame(game, 2);
    
    expect(game.day).toBe(2);
    expect(game.hour).toBe(0);
  });
  
  test('updates colonist needs', () => {
    const game = createGame();
    startGame(game);
    
    const initialHunger = game.colonists[0].needs.hunger;
    updateGame(game, 10);
    
    expect(game.colonists[0].needs.hunger).toBeLessThan(initialHunger);
  });
});

describe('getTimeString', () => {
  test('formats time correctly', () => {
    const game = createGame();
    game.day = 5;
    game.hour = 14;
    game.minute = 30;
    
    expect(getTimeString(game)).toBe('Day 5, 14:30');
  });
  
  test('pads single digits', () => {
    const game = createGame();
    game.day = 1;
    game.hour = 8;
    game.minute = 5;
    
    expect(getTimeString(game)).toBe('Day 1, 08:05');
  });
});

describe('isDaytime', () => {
  test('returns true during day hours', () => {
    const game = createGame();
    game.hour = 12;
    expect(isDaytime(game)).toBe(true);
  });
  
  test('returns false during night hours', () => {
    const game = createGame();
    game.hour = 22;
    expect(isDaytime(game)).toBe(false);
  });
  
  test('returns true at dawn', () => {
    const game = createGame();
    game.hour = 6;
    expect(isDaytime(game)).toBe(true);
  });
  
  test('returns false at dusk', () => {
    const game = createGame();
    game.hour = 20;
    expect(isDaytime(game)).toBe(false);
  });
});

describe('isGameOver', () => {
  test('returns false when colonists alive', () => {
    const game = createGame();
    startGame(game);
    
    expect(isGameOver(game)).toBe(false);
  });
  
  test('returns true when no colonists', () => {
    const game = createGame();
    startGame(game);
    game.colonists = [];
    
    expect(isGameOver(game)).toBe(true);
  });
  
  test('returns false when on title screen', () => {
    const game = createGame();
    game.colonists = [];
    
    expect(isGameOver(game)).toBe(false);
  });
});

describe('processColonistAI', () => {
  test('idle colonist finds unassigned task', () => {
    const game = createGame();
    startGame(game);
    
    // Create a task
    setDesignMode(game, DesignMode.MINE);
    designateArea(game, { x: 1, y: 1 }, { x: 1, y: 1 });
    
    const colonist = game.colonists[0];
    colonist.state = ColonistState.IDLE;
    colonist.currentTask = null;
    
    processColonistAI(game, colonist);
    
    expect(colonist.currentTask).not.toBeNull();
    expect(colonist.state).toBe(ColonistState.WORKING);
  });
  
  test('tired colonist goes to sleep', () => {
    const game = createGame();
    startGame(game);
    
    const colonist = game.colonists[0];
    colonist.needs.rest = 20;
    colonist.state = ColonistState.IDLE;
    colonist.currentTask = null;
    
    processColonistAI(game, colonist);
    
    expect(colonist.state).toBe(ColonistState.SLEEPING);
  });
  
  test('sleeping colonist wakes when rested', () => {
    const game = createGame();
    startGame(game);
    
    const colonist = game.colonists[0];
    colonist.state = ColonistState.SLEEPING;
    colonist.needs.rest = 100;
    
    processColonistAI(game, colonist);
    
    expect(colonist.state).toBe(ColonistState.IDLE);
  });
});

describe('spawnForageItems', () => {
  test('sometimes spawns food on grass', () => {
    const game = createGame();
    
    // Run many times to ensure it spawns at least once
    let spawned = false;
    for (let i = 0; i < 100; i++) {
      spawnForageItems(game);
    }
    
    // Check if any grass tile has food
    for (let y = 0; y < game.world.length; y++) {
      for (let x = 0; x < game.world[y].length; x++) {
        if (game.world[y][x].item?.type === ItemType.RAW_FOOD) {
          spawned = true;
          break;
        }
      }
    }
    
    expect(spawned).toBe(true);
  });
});
