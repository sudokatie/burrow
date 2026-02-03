import { Tile, TileType, TaskType, Item, Position } from './types';
import { WORLD_WIDTH, WORLD_HEIGHT } from './constants';

// Seeded random for deterministic generation
let seed = 12345;
export function setSeed(s: number): void {
  seed = s;
}

function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}

export function createTile(type: TileType): Tile {
  return {
    type,
    designation: null,
    item: null
  };
}

export function createWorld(): Tile[][] {
  const world: Tile[][] = [];
  
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < WORLD_WIDTH; x++) {
      // Edges are rock
      if (x < 3 || x >= WORLD_WIDTH - 3 || y < 3 || y >= WORLD_HEIGHT - 3) {
        row.push(createTile(TileType.ROCK));
      } else {
        row.push(createTile(TileType.GRASS));
      }
    }
    world.push(row);
  }
  
  // Add random trees (10-15% of grass tiles)
  for (let y = 3; y < WORLD_HEIGHT - 3; y++) {
    for (let x = 3; x < WORLD_WIDTH - 3; x++) {
      if (seededRandom() < 0.12) {
        world[y][x] = createTile(TileType.TREE);
      }
    }
  }
  
  // Add water pools (2-3 pools of 5-8 tiles each)
  const numPools = 2 + Math.floor(seededRandom() * 2);
  for (let i = 0; i < numPools; i++) {
    const poolX = 10 + Math.floor(seededRandom() * (WORLD_WIDTH - 20));
    const poolY = 10 + Math.floor(seededRandom() * (WORLD_HEIGHT - 20));
    const poolSize = 5 + Math.floor(seededRandom() * 4);
    
    // Simple flood-fill style pool
    const queue: Position[] = [{ x: poolX, y: poolY }];
    let placed = 0;
    
    while (queue.length > 0 && placed < poolSize) {
      const pos = queue.shift()!;
      if (pos.x >= 5 && pos.x < WORLD_WIDTH - 5 && 
          pos.y >= 5 && pos.y < WORLD_HEIGHT - 5) {
        const tile = world[pos.y][pos.x];
        if (tile.type === TileType.GRASS || tile.type === TileType.TREE) {
          world[pos.y][pos.x] = createTile(TileType.WATER);
          placed++;
          
          // Add neighbors with some randomness
          if (seededRandom() < 0.7) queue.push({ x: pos.x + 1, y: pos.y });
          if (seededRandom() < 0.7) queue.push({ x: pos.x - 1, y: pos.y });
          if (seededRandom() < 0.7) queue.push({ x: pos.x, y: pos.y + 1 });
          if (seededRandom() < 0.7) queue.push({ x: pos.x, y: pos.y - 1 });
        }
      }
    }
  }
  
  // Clear a central starting area (10x10)
  const centerX = Math.floor(WORLD_WIDTH / 2);
  const centerY = Math.floor(WORLD_HEIGHT / 2);
  for (let y = centerY - 5; y < centerY + 5; y++) {
    for (let x = centerX - 5; x < centerX + 5; x++) {
      if (isInBounds(x, y)) {
        world[y][x] = createTile(TileType.GRASS);
      }
    }
  }
  
  return world;
}

export function isInBounds(x: number, y: number): boolean {
  return x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT;
}

export function getTile(world: Tile[][], x: number, y: number): Tile | null {
  if (!isInBounds(x, y)) return null;
  return world[y][x];
}

export function setTile(world: Tile[][], x: number, y: number, tile: Tile): void {
  if (!isInBounds(x, y)) return;
  world[y][x] = tile;
}

export function setTileType(world: Tile[][], x: number, y: number, type: TileType): void {
  if (!isInBounds(x, y)) return;
  world[y][x].type = type;
}

export function isWalkable(tile: Tile | null): boolean {
  if (!tile) return false;
  return tile.type === TileType.GRASS || 
         tile.type === TileType.FLOOR || 
         tile.type === TileType.DOOR;
}

export function isWalkableAt(world: Tile[][], x: number, y: number): boolean {
  return isWalkable(getTile(world, x, y));
}

export function designateTile(world: Tile[][], x: number, y: number, designation: TaskType): boolean {
  const tile = getTile(world, x, y);
  if (!tile) return false;
  
  // Validate designation makes sense
  if (designation === TaskType.MINE && tile.type !== TileType.ROCK) return false;
  if (designation === TaskType.CHOP && tile.type !== TileType.TREE) return false;
  
  tile.designation = designation;
  return true;
}

export function clearDesignation(world: Tile[][], x: number, y: number): void {
  const tile = getTile(world, x, y);
  if (tile) {
    tile.designation = null;
  }
}

export function getDesignatedTiles(world: Tile[][], type: TaskType): Position[] {
  const positions: Position[] = [];
  
  for (let y = 0; y < world.length; y++) {
    for (let x = 0; x < world[y].length; x++) {
      if (world[y][x].designation === type) {
        positions.push({ x, y });
      }
    }
  }
  
  return positions;
}

export function placeItem(world: Tile[][], x: number, y: number, item: Item): boolean {
  const tile = getTile(world, x, y);
  if (!tile) return false;
  if (!isWalkable(tile)) return false;
  
  // Stack if same type
  if (tile.item && tile.item.type === item.type) {
    tile.item.quantity += item.quantity;
  } else if (!tile.item) {
    tile.item = { ...item };
  } else {
    return false; // Different item already there
  }
  
  return true;
}

export function removeItem(world: Tile[][], x: number, y: number): Item | null {
  const tile = getTile(world, x, y);
  if (!tile || !tile.item) return null;
  
  const item = tile.item;
  tile.item = null;
  return item;
}

export function getItemAt(world: Tile[][], x: number, y: number): Item | null {
  const tile = getTile(world, x, y);
  return tile?.item || null;
}

export function countTilesByType(world: Tile[][], type: TileType): number {
  let count = 0;
  for (let y = 0; y < world.length; y++) {
    for (let x = 0; x < world[y].length; x++) {
      if (world[y][x].type === type) {
        count++;
      }
    }
  }
  return count;
}
