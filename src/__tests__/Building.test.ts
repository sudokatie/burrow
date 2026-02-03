import {
  canBuild,
  build,
  getBuildCost,
  hasMaterials,
  consumeMaterials,
  createStockpile,
  isInStockpile,
  findNearestStockpileSpace,
  resetStockpileIdCounter,
} from '../game/Building';
import { createItem } from '../game/Resource';
import { TileType, BuildType, Tile, ItemType, Stockpile } from '../game/types';

function createEmptyTile(type: TileType = TileType.GRASS): Tile {
  return { type, designation: null, item: null };
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

describe('Building System', () => {
  beforeEach(() => {
    resetStockpileIdCounter();
  });

  describe('canBuild', () => {
    it('returns false for out of bounds', () => {
      const world = createWorld(10, 10);
      expect(canBuild(world, -1, 5, BuildType.WALL)).toBe(false);
      expect(canBuild(world, 5, -1, BuildType.WALL)).toBe(false);
      expect(canBuild(world, 100, 5, BuildType.WALL)).toBe(false);
    });

    it('returns true for wall on floor', () => {
      const world = createWorld(10, 10);
      world[5][5].type = TileType.FLOOR;
      expect(canBuild(world, 5, 5, BuildType.WALL)).toBe(true);
    });

    it('returns false for wall on grass', () => {
      const world = createWorld(10, 10);
      expect(canBuild(world, 5, 5, BuildType.WALL)).toBe(false);
    });

    it('allows stockpile on grass', () => {
      const world = createWorld(10, 10);
      expect(canBuild(world, 5, 5, BuildType.STOCKPILE)).toBe(true);
    });

    it('allows stockpile on floor', () => {
      const world = createWorld(10, 10);
      world[5][5].type = TileType.FLOOR;
      expect(canBuild(world, 5, 5, BuildType.STOCKPILE)).toBe(true);
    });

    it('disallows stockpile on rock', () => {
      const world = createWorld(10, 10);
      world[5][5].type = TileType.ROCK;
      expect(canBuild(world, 5, 5, BuildType.STOCKPILE)).toBe(false);
    });
  });

  describe('build', () => {
    it('builds wall on floor tile', () => {
      const world = createWorld(10, 10);
      world[5][5].type = TileType.FLOOR;
      expect(build(world, 5, 5, BuildType.WALL)).toBe(true);
      expect(world[5][5].type).toBe(TileType.WALL);
    });

    it('builds door on floor tile', () => {
      const world = createWorld(10, 10);
      world[5][5].type = TileType.FLOOR;
      expect(build(world, 5, 5, BuildType.DOOR)).toBe(true);
      expect(world[5][5].type).toBe(TileType.DOOR);
    });

    it('returns false when cannot build', () => {
      const world = createWorld(10, 10);
      expect(build(world, 5, 5, BuildType.WALL)).toBe(false);
    });
  });

  describe('getBuildCost', () => {
    it('returns wall cost', () => {
      const cost = getBuildCost(BuildType.WALL);
      expect(cost[ItemType.STONE]).toBe(2);
    });

    it('returns door cost', () => {
      const cost = getBuildCost(BuildType.DOOR);
      expect(cost[ItemType.WOOD]).toBe(1);
    });

    it('returns empty cost for stockpile', () => {
      const cost = getBuildCost(BuildType.STOCKPILE);
      expect(cost[ItemType.STONE]).toBe(0);
      expect(cost[ItemType.WOOD]).toBe(0);
    });
  });

  describe('hasMaterials', () => {
    it('returns true when materials available', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE, 5);
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }] },
      ];
      
      const cost = { [ItemType.STONE]: 2, [ItemType.WOOD]: 0, [ItemType.RAW_FOOD]: 0, [ItemType.MEAL]: 0 };
      expect(hasMaterials(world, stockpiles, cost)).toBe(true);
    });

    it('returns false when not enough materials', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE, 1);
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }] },
      ];
      
      const cost = { [ItemType.STONE]: 5, [ItemType.WOOD]: 0, [ItemType.RAW_FOOD]: 0, [ItemType.MEAL]: 0 };
      expect(hasMaterials(world, stockpiles, cost)).toBe(false);
    });

    it('sums materials across multiple stockpiles', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE, 3);
      world[1][1].item = createItem(ItemType.STONE, 3);
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }] },
        { id: 's2', tiles: [{ x: 1, y: 1 }] },
      ];
      
      const cost = { [ItemType.STONE]: 5, [ItemType.WOOD]: 0, [ItemType.RAW_FOOD]: 0, [ItemType.MEAL]: 0 };
      expect(hasMaterials(world, stockpiles, cost)).toBe(true);
    });
  });

  describe('consumeMaterials', () => {
    it('removes materials from stockpile', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE, 5);
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }] },
      ];
      
      const cost = { [ItemType.STONE]: 2, [ItemType.WOOD]: 0, [ItemType.RAW_FOOD]: 0, [ItemType.MEAL]: 0 };
      expect(consumeMaterials(world, stockpiles, cost)).toBe(true);
      expect(world[0][0].item!.quantity).toBe(3);
    });

    it('removes item when fully consumed', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE, 2);
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }] },
      ];
      
      const cost = { [ItemType.STONE]: 2, [ItemType.WOOD]: 0, [ItemType.RAW_FOOD]: 0, [ItemType.MEAL]: 0 };
      consumeMaterials(world, stockpiles, cost);
      expect(world[0][0].item).toBeNull();
    });

    it('returns false when not enough materials', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE, 1);
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }] },
      ];
      
      const cost = { [ItemType.STONE]: 5, [ItemType.WOOD]: 0, [ItemType.RAW_FOOD]: 0, [ItemType.MEAL]: 0 };
      expect(consumeMaterials(world, stockpiles, cost)).toBe(false);
      expect(world[0][0].item!.quantity).toBe(1); // Unchanged
    });
  });

  describe('createStockpile', () => {
    it('creates stockpile with tiles', () => {
      const tiles = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
      const stockpile = createStockpile(tiles);
      
      expect(stockpile.id).toMatch(/^stockpile-/);
      expect(stockpile.tiles).toHaveLength(2);
    });

    it('generates unique ids', () => {
      const s1 = createStockpile([{ x: 0, y: 0 }]);
      const s2 = createStockpile([{ x: 1, y: 1 }]);
      expect(s1.id).not.toBe(s2.id);
    });

    it('copies tiles to avoid mutation', () => {
      const tiles = [{ x: 5, y: 5 }];
      const stockpile = createStockpile(tiles);
      tiles[0].x = 99;
      expect(stockpile.tiles[0].x).toBe(5);
    });
  });

  describe('isInStockpile', () => {
    it('returns true for position in stockpile', () => {
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 5, y: 5 }, { x: 6, y: 5 }] },
      ];
      expect(isInStockpile(stockpiles, { x: 5, y: 5 })).toBe(true);
    });

    it('returns false for position not in stockpile', () => {
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 5, y: 5 }] },
      ];
      expect(isInStockpile(stockpiles, { x: 0, y: 0 })).toBe(false);
    });

    it('returns false for empty stockpiles', () => {
      expect(isInStockpile([], { x: 5, y: 5 })).toBe(false);
    });
  });

  describe('findNearestStockpileSpace', () => {
    it('finds nearest empty stockpile tile', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE); // Occupied
      // Tile at 0,1 is empty
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
      ];
      
      const nearest = findNearestStockpileSpace(world, stockpiles, { x: 5, y: 5 });
      expect(nearest).toEqual({ x: 1, y: 0 });
    });

    it('returns null when all spaces occupied', () => {
      const world = createWorld(10, 10);
      world[0][0].item = createItem(ItemType.STONE);
      
      const stockpiles: Stockpile[] = [
        { id: 's1', tiles: [{ x: 0, y: 0 }] },
      ];
      
      expect(findNearestStockpileSpace(world, stockpiles, { x: 5, y: 5 })).toBeNull();
    });

    it('returns null for empty stockpiles', () => {
      const world = createWorld(10, 10);
      expect(findNearestStockpileSpace(world, [], { x: 5, y: 5 })).toBeNull();
    });
  });
});
