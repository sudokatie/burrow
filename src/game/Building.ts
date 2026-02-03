import { Tile, TileType, BuildType, Position, Stockpile, ItemType } from './types';
import { BUILD_COSTS } from './constants';
import { getItemAt } from './Resource';

let stockpileIdCounter = 0;

export function canBuild(world: Tile[][], x: number, y: number, type: BuildType): boolean {
  if (y < 0 || y >= world.length) return false;
  if (x < 0 || x >= world[0].length) return false;

  const tile = world[y][x];
  
  // Can only build on floor tiles (except stockpile which can be on anything walkable)
  if (type === BuildType.STOCKPILE) {
    return tile.type === TileType.GRASS || tile.type === TileType.FLOOR;
  }
  
  return tile.type === TileType.FLOOR;
}

export function build(world: Tile[][], x: number, y: number, type: BuildType): boolean {
  if (!canBuild(world, x, y, type)) return false;

  switch (type) {
    case BuildType.WALL:
      world[y][x].type = TileType.WALL;
      break;
    case BuildType.FLOOR:
      world[y][x].type = TileType.FLOOR;
      break;
    case BuildType.DOOR:
      world[y][x].type = TileType.DOOR;
      break;
    case BuildType.BED:
      // BED doesn't change tile type, tracked separately
      break;
    case BuildType.STOCKPILE:
      // Stockpile doesn't change tile type, tracked in stockpiles array
      break;
  }

  return true;
}

export function getBuildCost(type: BuildType): Record<ItemType, number> {
  const cost = BUILD_COSTS[type];
  const result: Record<ItemType, number> = {
    [ItemType.STONE]: 0,
    [ItemType.WOOD]: 0,
    [ItemType.RAW_FOOD]: 0,
    [ItemType.MEAL]: 0,
  };
  
  for (const [itemType, amount] of Object.entries(cost)) {
    result[itemType as ItemType] = amount as number;
  }
  
  return result;
}

export function hasMaterials(
  world: Tile[][],
  stockpiles: Stockpile[],
  cost: Record<ItemType, number>
): boolean {
  for (const [itemType, required] of Object.entries(cost)) {
    if (required <= 0) continue;
    
    let available = 0;
    for (const stockpile of stockpiles) {
      for (const pos of stockpile.tiles) {
        const item = getItemAt(world, pos.x, pos.y);
        if (item && item.type === (itemType as ItemType)) {
          available += item.quantity;
        }
      }
    }
    
    if (available < required) return false;
  }
  
  return true;
}

export function consumeMaterials(
  world: Tile[][],
  stockpiles: Stockpile[],
  cost: Record<ItemType, number>
): boolean {
  if (!hasMaterials(world, stockpiles, cost)) return false;

  for (const [itemType, required] of Object.entries(cost)) {
    let remaining = required;
    if (remaining <= 0) continue;
    
    for (const stockpile of stockpiles) {
      for (const pos of stockpile.tiles) {
        if (remaining <= 0) break;
        
        const item = getItemAt(world, pos.x, pos.y);
        if (item && item.type === (itemType as ItemType)) {
          const take = Math.min(item.quantity, remaining);
          item.quantity -= take;
          remaining -= take;
          
          if (item.quantity <= 0) {
            world[pos.y][pos.x].item = null;
          }
        }
      }
    }
  }
  
  return true;
}

export function createStockpile(tiles: Position[]): Stockpile {
  return {
    id: `stockpile-${++stockpileIdCounter}`,
    tiles: tiles.map(t => ({ ...t })),
  };
}

export function isInStockpile(stockpiles: Stockpile[], pos: Position): boolean {
  for (const stockpile of stockpiles) {
    for (const tile of stockpile.tiles) {
      if (tile.x === pos.x && tile.y === pos.y) {
        return true;
      }
    }
  }
  return false;
}

export function findNearestStockpileSpace(
  world: Tile[][],
  stockpiles: Stockpile[],
  pos: Position
): Position | null {
  let nearest: Position | null = null;
  let nearestDist = Infinity;

  for (const stockpile of stockpiles) {
    for (const tile of stockpile.tiles) {
      const item = getItemAt(world, tile.x, tile.y);
      if (!item) {
        const dist = Math.abs(tile.x - pos.x) + Math.abs(tile.y - pos.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = { x: tile.x, y: tile.y };
        }
      }
    }
  }

  return nearest;
}

export function resetStockpileIdCounter(): void {
  stockpileIdCounter = 0;
}
