import { Item, ItemType, Tile, Position, Stockpile } from './types';
import { MAX_STACK } from './constants';

export function createItem(type: ItemType, quantity: number = 1): Item {
  return { type, quantity };
}

export function addItems(item: Item, quantity: number): void {
  item.quantity = Math.min(item.quantity + quantity, MAX_STACK);
}

export function removeItems(item: Item, quantity: number): boolean {
  if (item.quantity < quantity) return false;
  item.quantity -= quantity;
  return true;
}

export function canStack(a: Item, b: Item): boolean {
  return a.type === b.type && a.quantity + b.quantity <= MAX_STACK;
}

export function mergeItems(a: Item, b: Item): Item {
  if (a.type !== b.type) {
    throw new Error('Cannot merge items of different types');
  }
  return createItem(a.type, Math.min(a.quantity + b.quantity, MAX_STACK));
}

export function splitItem(item: Item, quantity: number): Item | null {
  if (quantity <= 0 || quantity >= item.quantity) return null;
  item.quantity -= quantity;
  return createItem(item.type, quantity);
}

export function getItemAt(world: Tile[][], x: number, y: number): Item | null {
  if (y < 0 || y >= world.length) return null;
  if (x < 0 || x >= world[0].length) return null;
  return world[y][x].item;
}

export function getNearestItem(
  world: Tile[][],
  pos: Position,
  type: ItemType
): Position | null {
  let nearest: Position | null = null;
  let nearestDist = Infinity;

  for (let y = 0; y < world.length; y++) {
    for (let x = 0; x < world[0].length; x++) {
      const tile = world[y][x];
      if (tile.item && tile.item.type === type) {
        const dist = Math.abs(x - pos.x) + Math.abs(y - pos.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = { x, y };
        }
      }
    }
  }

  return nearest;
}

export function countItemsInStockpiles(
  world: Tile[][],
  stockpiles: Stockpile[],
  type: ItemType
): number {
  let count = 0;

  for (const stockpile of stockpiles) {
    for (const pos of stockpile.tiles) {
      const item = getItemAt(world, pos.x, pos.y);
      if (item && item.type === type) {
        count += item.quantity;
      }
    }
  }

  return count;
}
