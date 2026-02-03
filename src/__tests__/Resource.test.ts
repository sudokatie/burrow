import {
  createItem,
  addItems,
  removeItems,
  canStack,
  mergeItems,
  splitItem,
  getItemAt,
  getNearestItem,
  countItemsInStockpiles,
} from '../game/Resource';
import { ItemType, TileType, Tile, Stockpile } from '../game/types';
import { MAX_STACK } from '../game/constants';

function createEmptyTile(): Tile {
  return { type: TileType.GRASS, designation: null, item: null };
}

function createWorld(width: number, height: number): Tile[][] {
  const world: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    world[y] = [];
    for (let x = 0; x < width; x++) {
      world[y][x] = createEmptyTile();
    }
  }
  return world;
}

describe('Resource System', () => {
  describe('createItem', () => {
    it('creates item with default quantity 1', () => {
      const item = createItem(ItemType.STONE);
      expect(item.type).toBe(ItemType.STONE);
      expect(item.quantity).toBe(1);
    });

    it('creates item with specified quantity', () => {
      const item = createItem(ItemType.WOOD, 10);
      expect(item.quantity).toBe(10);
    });
  });

  describe('addItems', () => {
    it('adds quantity to item', () => {
      const item = createItem(ItemType.STONE, 5);
      addItems(item, 3);
      expect(item.quantity).toBe(8);
    });

    it('caps at max stack', () => {
      const item = createItem(ItemType.STONE, MAX_STACK - 5);
      addItems(item, 10);
      expect(item.quantity).toBe(MAX_STACK);
    });
  });

  describe('removeItems', () => {
    it('removes quantity from item', () => {
      const item = createItem(ItemType.STONE, 10);
      expect(removeItems(item, 3)).toBe(true);
      expect(item.quantity).toBe(7);
    });

    it('returns false if not enough items', () => {
      const item = createItem(ItemType.STONE, 2);
      expect(removeItems(item, 5)).toBe(false);
      expect(item.quantity).toBe(2);
    });

    it('allows removing exact quantity', () => {
      const item = createItem(ItemType.STONE, 5);
      expect(removeItems(item, 5)).toBe(true);
      expect(item.quantity).toBe(0);
    });
  });

  describe('canStack', () => {
    it('returns true for same type within limit', () => {
      const a = createItem(ItemType.STONE, 30);
      const b = createItem(ItemType.STONE, 30);
      expect(canStack(a, b)).toBe(true);
    });

    it('returns false for different types', () => {
      const a = createItem(ItemType.STONE, 10);
      const b = createItem(ItemType.WOOD, 10);
      expect(canStack(a, b)).toBe(false);
    });

    it('returns false if combined exceeds max', () => {
      const a = createItem(ItemType.STONE, 50);
      const b = createItem(ItemType.STONE, 50);
      expect(canStack(a, b)).toBe(false);
    });
  });

  describe('mergeItems', () => {
    it('merges same type items', () => {
      const a = createItem(ItemType.STONE, 10);
      const b = createItem(ItemType.STONE, 15);
      const merged = mergeItems(a, b);
      expect(merged.type).toBe(ItemType.STONE);
      expect(merged.quantity).toBe(25);
    });

    it('caps at max stack', () => {
      const a = createItem(ItemType.STONE, MAX_STACK - 10);
      const b = createItem(ItemType.STONE, 20);
      const merged = mergeItems(a, b);
      expect(merged.quantity).toBe(MAX_STACK);
    });

    it('throws for different types', () => {
      const a = createItem(ItemType.STONE, 10);
      const b = createItem(ItemType.WOOD, 10);
      expect(() => mergeItems(a, b)).toThrow();
    });
  });

  describe('splitItem', () => {
    it('splits item into two', () => {
      const item = createItem(ItemType.STONE, 10);
      const split = splitItem(item, 3);
      expect(split).not.toBeNull();
      expect(split!.quantity).toBe(3);
      expect(item.quantity).toBe(7);
    });

    it('returns null for zero or negative quantity', () => {
      const item = createItem(ItemType.STONE, 10);
      expect(splitItem(item, 0)).toBeNull();
      expect(splitItem(item, -1)).toBeNull();
    });

    it('returns null if splitting full quantity', () => {
      const item = createItem(ItemType.STONE, 10);
      expect(splitItem(item, 10)).toBeNull();
    });

    it('returns null if splitting more than available', () => {
      const item = createItem(ItemType.STONE, 5);
      expect(splitItem(item, 10)).toBeNull();
    });
  });

  describe('getItemAt', () => {
    it('returns item at position', () => {
      const world = createWorld(10, 10);
      world[5][5].item = createItem(ItemType.WOOD, 3);
      
      const item = getItemAt(world, 5, 5);
      expect(item).not.toBeNull();
      expect(item!.type).toBe(ItemType.WOOD);
    });

    it('returns null for empty tile', () => {
      const world = createWorld(10, 10);
      expect(getItemAt(world, 5, 5)).toBeNull();
    });

    it('returns null for out of bounds', () => {
      const world = createWorld(10, 10);
      expect(getItemAt(world, -1, 5)).toBeNull();
      expect(getItemAt(world, 5, -1)).toBeNull();
      expect(getItemAt(world, 100, 5)).toBeNull();
      expect(getItemAt(world, 5, 100)).toBeNull();
    });
  });

  describe('getNearestItem', () => {
    it('finds nearest item of type', () => {
      const world = createWorld(10, 10);
      world[2][2].item = createItem(ItemType.STONE);
      world[8][8].item = createItem(ItemType.STONE);
      
      const nearest = getNearestItem(world, { x: 3, y: 3 }, ItemType.STONE);
      expect(nearest).toEqual({ x: 2, y: 2 });
    });

    it('returns null if no items of type', () => {
      const world = createWorld(10, 10);
      world[5][5].item = createItem(ItemType.WOOD);
      
      expect(getNearestItem(world, { x: 0, y: 0 }, ItemType.STONE)).toBeNull();
    });

    it('returns null for empty world', () => {
      const world = createWorld(10, 10);
      expect(getNearestItem(world, { x: 5, y: 5 }, ItemType.STONE)).toBeNull();
    });
  });

  describe('countItemsInStockpiles', () => {
    it('counts items across stockpiles', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE, 5);
      world[0][1].item = createItem(ItemType.STONE, 3);
      world[5][5].item = createItem(ItemType.STONE, 10);
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
        { id: 's2', tiles: [{ x: 5, y: 5 }] },
      ];
      
      expect(countItemsInStockpiles(world, stockpiles, ItemType.STONE)).toBe(18);
    });

    it('only counts matching item type', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE, 5);
      world[0][1].item = createItem(ItemType.WOOD, 10);
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
      ];
      
      expect(countItemsInStockpiles(world, stockpiles, ItemType.STONE)).toBe(5);
    });

    it('returns 0 for empty stockpiles', () => {
      const world = createWorld(10, 10);
      expect(countItemsInStockpiles(world, [], ItemType.STONE)).toBe(0);
    });
  });
});
