import {
  GameState,
  GameScreen,
  DesignMode,
  Colonist,
  ColonistState,
  Task,
  TaskType,
  BuildType,
  Position,
  TileType,
  ItemType,
} from './types';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  STARTING_COLONISTS,
  MAX_MESSAGES,
  FORAGE_SPAWN_INTERVAL,
  FORAGE_SPAWN_CHANCE,
  MINE_YIELD,
  CHOP_YIELD,
  MEAL_HUNGER_RESTORE,
  SLEEP_REST_PER_SECOND,
} from './constants';
import {
  createWorld,
  getTile,
  setTileType,
  designateTile,
  clearDesignation,
  placeItem,
  removeItem,
} from './World';
import {
  generateRandomColonist,
  updateNeeds,
  satisfyNeed,
  getWorkSpeed,
  getMovementSpeed,
  setColonistState,
  isColonistDead,
  moveColonist,
  setColonistPath,
  clearColonistPath,
  clearTask as clearColonistTask,
  isHungry,
  isTired,
  isIdle,
} from './Colonist';
import {
  createTask,
  assignTask as assignTaskToTask,
  unassignTask,
  progressTask,
  getUnassignedTasks,
  removeTask,
} from './Task';
import { findPath } from './Pathfinding';
import { canBuild, build, createStockpile, getBuildCost, hasMaterials, consumeMaterials } from './Building';
import { getNearestItem, createItem } from './Resource';
import { findNearestStockpileSpace, isInStockpile } from './Building';

let lastForageTime = 0;

export function createGame(): GameState {
  return {
    screen: GameScreen.TITLE,
    world: createWorld(),
    colonists: [],
    tasks: [],
    stockpiles: [],
    day: 1,
    hour: 8,
    minute: 0,
    paused: false,
    messages: [],
    designMode: DesignMode.NONE,
    selectedBuild: null,
    selectedPriority: 5,
  };
}

export function setSelectedPriority(game: GameState, priority: number): void {
  game.selectedPriority = Math.max(1, Math.min(9, priority));
}

export function startGame(game: GameState): void {
  game.screen = GameScreen.PLAYING;
  
  // Spawn starting colonists in center
  const centerX = Math.floor(WORLD_WIDTH / 2);
  const centerY = Math.floor(WORLD_HEIGHT / 2);
  
  for (let i = 0; i < STARTING_COLONISTS; i++) {
    const offsetX = (i % 3) - 1;
    const offsetY = Math.floor(i / 3) - 1;
    const colonist = generateRandomColonist({
      x: centerX + offsetX,
      y: centerY + offsetY,
    });
    game.colonists.push(colonist);
    addMessage(game, `${colonist.name} has joined the colony`);
  }
  
  lastForageTime = 0;
}

export function updateGame(game: GameState, dt: number): void {
  if (game.paused || game.screen !== GameScreen.PLAYING) return;
  
  // Update time
  advanceGameTime(game, dt);
  
  // Update colonist needs
  for (const colonist of game.colonists) {
    updateNeeds(colonist, dt);
  }
  
  // Remove dead colonists
  game.colonists = game.colonists.filter(c => {
    if (isColonistDead(c)) {
      addMessage(game, `${c.name} has died`);
      // Unassign their task
      if (c.currentTask) {
        const task = game.tasks.find(t => t.id === c.currentTask);
        if (task) unassignTask(task);
      }
      return false;
    }
    return true;
  });
  
  // Process colonist AI
  for (const colonist of game.colonists) {
    processColonistAI(game, colonist);
  }
  
  // Process work
  processWork(game, dt);
  
  // Spawn forage items periodically
  lastForageTime += dt;
  if (lastForageTime >= FORAGE_SPAWN_INTERVAL) {
    spawnForageItems(game);
    lastForageTime = 0;
  }
}

function advanceGameTime(game: GameState, dt: number): void {
  // 1 real second = 1 game minute
  game.minute += dt;
  while (game.minute >= 60) {
    game.minute -= 60;
    game.hour++;
    if (game.hour >= 24) {
      game.hour = 0;
      game.day++;
      addMessage(game, `Day ${game.day} begins`);
    }
  }
}

export function pauseGame(game: GameState): void {
  game.paused = true;
}

export function resumeGame(game: GameState): void {
  game.paused = false;
}

export function togglePause(game: GameState): void {
  game.paused = !game.paused;
}

export function addMessage(game: GameState, msg: string): void {
  game.messages.push(msg);
  while (game.messages.length > MAX_MESSAGES) {
    game.messages.shift();
  }
}

export function setDesignMode(game: GameState, mode: DesignMode): void {
  game.designMode = mode;
  if (mode !== DesignMode.BUILD) {
    game.selectedBuild = null;
  }
}

export function setSelectedBuild(game: GameState, buildType: BuildType): void {
  game.selectedBuild = buildType;
  game.designMode = DesignMode.BUILD;
}

export function designateArea(game: GameState, start: Position, end: Position): void {
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);
  
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const tile = getTile(game.world, x, y);
      if (!tile) continue;
      
      let taskType: TaskType | null = null;
      
      switch (game.designMode) {
        case DesignMode.MINE:
          if (tile.type === TileType.ROCK) {
            taskType = TaskType.MINE;
          }
          break;
        case DesignMode.CHOP:
          if (tile.type === TileType.TREE) {
            taskType = TaskType.CHOP;
          }
          break;
        case DesignMode.STOCKPILE:
          if (tile.type === TileType.GRASS || tile.type === TileType.FLOOR) {
            // Create stockpile tile (handled separately)
          }
          break;
      }
      
      if (taskType) {
        if (designateTile(game.world, x, y, taskType)) {
          // Create task for this designation with selected priority
          const task = createTask(taskType, { x, y }, game.selectedPriority);
          game.tasks.push(task);
        }
      }
    }
  }
  
  // Handle stockpile creation
  if (game.designMode === DesignMode.STOCKPILE) {
    const tiles: Position[] = [];
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const tile = getTile(game.world, x, y);
        if (tile && (tile.type === TileType.GRASS || tile.type === TileType.FLOOR)) {
          tiles.push({ x, y });
        }
      }
    }
    if (tiles.length > 0) {
      const stockpile = createStockpile(tiles);
      game.stockpiles.push(stockpile);
      addMessage(game, `Created stockpile with ${tiles.length} tiles`);
    }
  }
}

export function placeBuild(game: GameState, pos: Position): void {
  if (!game.selectedBuild) return;
  
  if (canBuild(game.world, pos.x, pos.y, game.selectedBuild)) {
    // Create build task
    const task = createTask(TaskType.BUILD, pos, 5, game.selectedBuild);
    game.tasks.push(task);
    addMessage(game, `Queued ${game.selectedBuild.toLowerCase()} construction`);
  }
}

export function assignTasks(game: GameState): void {
  const unassigned = getUnassignedTasks(game.tasks);
  
  for (const task of unassigned) {
    // Find idle colonist nearest to task
    const idleColonists = game.colonists.filter(c => isIdle(c));
    if (idleColonists.length === 0) break;
    
    let nearest: Colonist | null = null;
    let nearestDist = Infinity;
    
    for (const colonist of idleColonists) {
      const dist = Math.abs(colonist.pos.x - task.pos.x) + Math.abs(colonist.pos.y - task.pos.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = colonist;
      }
    }
    
    if (nearest) {
      assignTaskToTask(task, nearest.id);
      nearest.currentTask = task.id;
      setColonistState(nearest, ColonistState.WORKING);
      
      // Set path to task
      const path = findPath(game.world, nearest.pos, task.pos);
      setColonistPath(nearest, path);
    }
  }
}

// Track movement cooldown per colonist
const movementCooldowns = new Map<string, number>();

export function processWork(game: GameState, dt: number): void {
  for (const colonist of game.colonists) {
    if (colonist.state !== ColonistState.WORKING) continue;
    if (!colonist.currentTask) continue;
    
    const task = game.tasks.find(t => t.id === colonist.currentTask);
    if (!task) {
      clearColonistTask(colonist);
      continue;
    }
    
    // Move along path if not at task location
    if (colonist.path.length > 1) {
      // Apply movement speed (rest penalty)
      const moveSpeed = getMovementSpeed(colonist);
      const cooldown = movementCooldowns.get(colonist.id) || 0;
      const newCooldown = cooldown - dt * moveSpeed;
      
      if (newCooldown <= 0) {
        // Move toward next path node
        const next = colonist.path[1];
        moveColonist(colonist, next);
        colonist.path.shift();
        movementCooldowns.set(colonist.id, 0.1); // Base 100ms between moves
      } else {
        movementCooldowns.set(colonist.id, newCooldown);
      }
      continue;
    }
    
    // At task location - do work
    const workAmount = getWorkSpeed(colonist, task.type) * dt * 10; // 10 ticks per second
    const complete = progressTask(task, workAmount);
    
    if (complete) {
      completeTask(game, task, colonist);
    }
  }
}

function completeTask(game: GameState, task: Task, colonist: Colonist): void {
  switch (task.type) {
    case TaskType.MINE: {
      // Clear rock, drop stone
      setTileType(game.world, task.pos.x, task.pos.y, TileType.FLOOR);
      clearDesignation(game.world, task.pos.x, task.pos.y);
      placeItem(game.world, task.pos.x, task.pos.y, { type: ItemType.STONE, quantity: MINE_YIELD });
      addMessage(game, `${colonist.name} finished mining`);
      break;
    }
    case TaskType.CHOP: {
      // Clear tree, drop wood
      setTileType(game.world, task.pos.x, task.pos.y, TileType.GRASS);
      clearDesignation(game.world, task.pos.x, task.pos.y);
      placeItem(game.world, task.pos.x, task.pos.y, { type: ItemType.WOOD, quantity: CHOP_YIELD });
      addMessage(game, `${colonist.name} finished chopping`);
      break;
    }
    case TaskType.HAUL: {
      // Pick up item and place in stockpile
      const item = removeItem(game.world, task.pos.x, task.pos.y);
      if (item) {
        const stockpilePos = findNearestStockpileSpace(game.world, game.stockpiles, colonist.pos);
        if (stockpilePos) {
          placeItem(game.world, stockpilePos.x, stockpilePos.y, item);
          addMessage(game, `${colonist.name} hauled ${item.type.toLowerCase()}`);
        } else {
          // No space, drop it back
          placeItem(game.world, task.pos.x, task.pos.y, item);
        }
      }
      break;
    }
    case TaskType.COOK: {
      // Consume raw food, produce meal
      const rawFood = removeItem(game.world, task.pos.x, task.pos.y);
      if (rawFood && rawFood.type === ItemType.RAW_FOOD) {
        placeItem(game.world, task.pos.x, task.pos.y, createItem(ItemType.MEAL, 1));
        addMessage(game, `${colonist.name} cooked a meal`);
      }
      break;
    }
    case TaskType.BUILD: {
      if (task.buildType) {
        const cost = getBuildCost(task.buildType);
        // Check and consume materials (stockpile has none = free for now, but correct flow)
        if (hasMaterials(game.world, game.stockpiles, cost)) {
          consumeMaterials(game.world, game.stockpiles, cost);
        }
        build(game.world, task.pos.x, task.pos.y, task.buildType);
        addMessage(game, `${colonist.name} finished building ${task.buildType.toLowerCase()}`);
      }
      break;
    }
    case TaskType.EAT: {
      satisfyNeed(colonist, 'hunger', MEAL_HUNGER_RESTORE);
      addMessage(game, `${colonist.name} ate a meal`);
      break;
    }
    case TaskType.SLEEP: {
      // Sleep is time-based, handled in AI
      break;
    }
  }
  
  // Remove task and clear colonist
  game.tasks = removeTask(game.tasks, task.id);
  clearColonistTask(colonist);
}

export function processColonistAI(game: GameState, colonist: Colonist): void {
  // Handle sleeping
  if (colonist.state === ColonistState.SLEEPING) {
    satisfyNeed(colonist, 'rest', SLEEP_REST_PER_SECOND);
    if (colonist.needs.rest >= 100) {
      setColonistState(colonist, ColonistState.IDLE);
      clearColonistPath(colonist);
      addMessage(game, `${colonist.name} woke up`);
    }
    return;
  }
  
  // Handle eating
  if (colonist.state === ColonistState.EATING) {
    // Eating is handled by task completion
    return;
  }
  
  // If working, let processWork handle it
  if (colonist.state === ColonistState.WORKING && colonist.currentTask) {
    return;
  }
  
  // AI decision making for idle colonists
  if (!isIdle(colonist)) return;
  
  // Priority 1: Eat if hungry
  if (isHungry(colonist)) {
    // Prefer cooked meals
    const mealPos = getNearestItem(game.world, colonist.pos, ItemType.MEAL);
    if (mealPos) {
      createAndAssignEatTask(game, colonist, mealPos);
      return;
    }
    // Fall back to raw food
    const rawFoodPos = getNearestItem(game.world, colonist.pos, ItemType.RAW_FOOD);
    if (rawFoodPos) {
      createAndAssignEatTask(game, colonist, rawFoodPos);
      return;
    }
  }
  
  // Priority 2: Sleep if tired
  if (isTired(colonist)) {
    setColonistState(colonist, ColonistState.SLEEPING);
    addMessage(game, `${colonist.name} went to sleep`);
    return;
  }
  
  // Priority 3: Find unassigned task (user-designated)
  const unassigned = getUnassignedTasks(game.tasks);
  if (unassigned.length > 0) {
    // Sort by priority (lower number = higher priority)
    const sortedTasks = [...unassigned].sort((a, b) => a.priority - b.priority);
    const nearest = findNearestTask(colonist.pos, sortedTasks);
    
    if (nearest) {
      assignTaskToTask(nearest, colonist.id);
      colonist.currentTask = nearest.id;
      setColonistState(colonist, ColonistState.WORKING);
      
      const path = findPath(game.world, colonist.pos, nearest.pos);
      setColonistPath(colonist, path);
      return;
    }
  }
  
  // Priority 4: Auto-haul items to stockpiles
  if (game.stockpiles.length > 0) {
    const haulPos = findItemToHaul(game);
    if (haulPos) {
      const task = createTask(TaskType.HAUL, haulPos, 8); // Low priority
      game.tasks.push(task);
      assignTaskToTask(task, colonist.id);
      colonist.currentTask = task.id;
      setColonistState(colonist, ColonistState.WORKING);
      
      const path = findPath(game.world, colonist.pos, haulPos);
      setColonistPath(colonist, path);
      return;
    }
  }
  
  // Priority 5: Auto-cook raw food in stockpiles
  const cookPos = findRawFoodToCook(game);
  if (cookPos) {
    const task = createTask(TaskType.COOK, cookPos, 7); // Medium-low priority
    game.tasks.push(task);
    assignTaskToTask(task, colonist.id);
    colonist.currentTask = task.id;
    setColonistState(colonist, ColonistState.WORKING);
    
    const path = findPath(game.world, colonist.pos, cookPos);
    setColonistPath(colonist, path);
    return;
  }
}

function findNearestTask(pos: Position, tasks: Task[]): Task | null {
  let nearest: Task | null = null;
  let nearestDist = Infinity;
  
  for (const task of tasks) {
    const dist = Math.abs(pos.x - task.pos.x) + Math.abs(pos.y - task.pos.y);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = task;
    }
  }
  
  return nearest;
}

function findItemToHaul(game: GameState): Position | null {
  // Find items on the ground that are NOT in stockpiles
  for (let y = 0; y < game.world.length; y++) {
    for (let x = 0; x < game.world[y].length; x++) {
      const tile = game.world[y][x];
      if (tile.item && !isInStockpile(game.stockpiles, { x, y })) {
        // Check not already being hauled
        const alreadyTasked = game.tasks.some(
          t => t.type === TaskType.HAUL && t.pos.x === x && t.pos.y === y
        );
        if (!alreadyTasked) {
          return { x, y };
        }
      }
    }
  }
  return null;
}

function findRawFoodToCook(game: GameState): Position | null {
  // Find raw food in stockpiles to cook
  for (const stockpile of game.stockpiles) {
    for (const pos of stockpile.tiles) {
      const tile = game.world[pos.y]?.[pos.x];
      if (tile?.item?.type === ItemType.RAW_FOOD) {
        // Check not already being cooked
        const alreadyTasked = game.tasks.some(
          t => t.type === TaskType.COOK && t.pos.x === pos.x && t.pos.y === pos.y
        );
        if (!alreadyTasked) {
          return { x: pos.x, y: pos.y };
        }
      }
    }
  }
  return null;
}

function createAndAssignEatTask(game: GameState, colonist: Colonist, foodPos: Position): void {
  const task = createTask(TaskType.EAT, foodPos, 10);
  game.tasks.push(task);
  assignTaskToTask(task, colonist.id);
  colonist.currentTask = task.id;
  setColonistState(colonist, ColonistState.EATING);
  
  const path = findPath(game.world, colonist.pos, foodPos);
  setColonistPath(colonist, path);
  
  // Remove the food item
  removeItem(game.world, foodPos.x, foodPos.y);
}

export function spawnForageItems(game: GameState): void {
  if (Math.random() > FORAGE_SPAWN_CHANCE) return;
  
  // Find a random grass tile to spawn food
  const attempts = 50;
  for (let i = 0; i < attempts; i++) {
    const x = Math.floor(Math.random() * (WORLD_WIDTH - 10)) + 5;
    const y = Math.floor(Math.random() * (WORLD_HEIGHT - 10)) + 5;
    
    const tile = getTile(game.world, x, y);
    if (tile && tile.type === TileType.GRASS && !tile.item) {
      placeItem(game.world, x, y, { type: ItemType.RAW_FOOD, quantity: 1 });
      return;
    }
  }
}

export function getTimeString(game: GameState): string {
  const hourStr = game.hour.toString().padStart(2, '0');
  const minStr = Math.floor(game.minute).toString().padStart(2, '0');
  return `Day ${game.day}, ${hourStr}:${minStr}`;
}

export function isDaytime(game: GameState): boolean {
  return game.hour >= 6 && game.hour < 20;
}

export function isGameOver(game: GameState): boolean {
  return game.colonists.length === 0 && game.screen === GameScreen.PLAYING;
}

export function resetForageTimer(): void {
  lastForageTime = 0;
}
