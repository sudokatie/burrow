import {
  createWorld,
  createTile,
  getTile,
  setTile,
  setTileType,
  isInBounds,
  isWalkable,
  isWalkableAt,
  designateTile,
  clearDesignation,
  getDesignatedTiles,
  placeItem,
  removeItem,
  getItemAt,
  countTilesByType,
  setSeed
} from '../game/World';
import { TileType, TaskType, ItemType } from '../game/types';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../game/constants';

describe('World', () => {
  beforeEach(() => {
    setSeed(12345);
  });

  describe('createWorld', () => {
    it('creates world with correct dimensions', () => {
      const world = createWorld();
      expect(world.length).toBe(WORLD_HEIGHT);
      expect(world[0].length).toBe(WORLD_WIDTH);
    });

    it('has rock edges', () => {
      const world = createWorld();
      // Check top edge
      expect(world[0][10].type).toBe(TileType.ROCK);
      // Check bottom edge
      expect(world[WORLD_HEIGHT - 1][10].type).toBe(TileType.ROCK);
      // Check left edge
      expect(world[10][0].type).toBe(TileType.ROCK);
      // Check right edge
      expect(world[10][WORLD_WIDTH - 1].type).toBe(TileType.ROCK);
    });

    it('has grass in central area', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      expect(world[centerY][centerX].type).toBe(TileType.GRASS);
    });

    it('contains trees', () => {
      const world = createWorld();
      const treeCount = countTilesByType(world, TileType.TREE);
      expect(treeCount).toBeGreaterThan(0);
    });

    it('contains water pools', () => {
      const world = createWorld();
      const waterCount = countTilesByType(world, TileType.WATER);
      expect(waterCount).toBeGreaterThan(0);
    });
  });

  describe('createTile', () => {
    it('creates tile with correct type', () => {
      const tile = createTile(TileType.GRASS);
      expect(tile.type).toBe(TileType.GRASS);
      expect(tile.designation).toBeNull();
      expect(tile.item).toBeNull();
    });
  });

  describe('isInBounds', () => {
    it('returns true for valid coordinates', () => {
      expect(isInBounds(0, 0)).toBe(true);
      expect(isInBounds(WORLD_WIDTH - 1, WORLD_HEIGHT - 1)).toBe(true);
      expect(isInBounds(10, 10)).toBe(true);
    });

    it('returns false for out of bounds coordinates', () => {
      expect(isInBounds(-1, 0)).toBe(false);
      expect(isInBounds(0, -1)).toBe(false);
      expect(isInBounds(WORLD_WIDTH, 0)).toBe(false);
      expect(isInBounds(0, WORLD_HEIGHT)).toBe(false);
    });
  });

  describe('getTile', () => {
    it('returns tile at valid position', () => {
      const world = createWorld();
      const tile = getTile(world, 10, 10);
      expect(tile).not.toBeNull();
    });

    it('returns null for out of bounds', () => {
      const world = createWorld();
      expect(getTile(world, -1, 0)).toBeNull();
      expect(getTile(world, WORLD_WIDTH, 0)).toBeNull();
    });
  });

  describe('setTile', () => {
    it('sets tile at position', () => {
      const world = createWorld();
      const newTile = createTile(TileType.FLOOR);
      setTile(world, 10, 10, newTile);
      expect(world[10][10].type).toBe(TileType.FLOOR);
    });

    it('does nothing for out of bounds', () => {
      const world = createWorld();
      const newTile = createTile(TileType.FLOOR);
      setTile(world, -1, 0, newTile); // Should not throw
    });
  });

  describe('setTileType', () => {
    it('changes tile type', () => {
      const world = createWorld();
      setTileType(world, 10, 10, TileType.WALL);
      expect(world[10][10].type).toBe(TileType.WALL);
    });
  });

  describe('isWalkable', () => {
    it('returns true for grass', () => {
      const tile = createTile(TileType.GRASS);
      expect(isWalkable(tile)).toBe(true);
    });

    it('returns true for floor', () => {
      const tile = createTile(TileType.FLOOR);
      expect(isWalkable(tile)).toBe(true);
    });

    it('returns true for door', () => {
      const tile = createTile(TileType.DOOR);
      expect(isWalkable(tile)).toBe(true);
    });

    it('returns false for rock', () => {
      const tile = createTile(TileType.ROCK);
      expect(isWalkable(tile)).toBe(false);
    });

    it('returns false for wall', () => {
      const tile = createTile(TileType.WALL);
      expect(isWalkable(tile)).toBe(false);
    });

    it('returns false for water', () => {
      const tile = createTile(TileType.WATER);
      expect(isWalkable(tile)).toBe(false);
    });

    it('returns false for tree', () => {
      const tile = createTile(TileType.TREE);
      expect(isWalkable(tile)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isWalkable(null)).toBe(false);
    });
  });

  describe('isWalkableAt', () => {
    it('checks walkability at position', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      expect(isWalkableAt(world, centerX, centerY)).toBe(true);
      expect(isWalkableAt(world, 0, 0)).toBe(false); // Rock edge
    });
  });

  describe('designateTile', () => {
    it('designates rock for mining', () => {
      const world = createWorld();
      const result = designateTile(world, 0, 0, TaskType.MINE);
      expect(result).toBe(true);
      expect(world[0][0].designation).toBe(TaskType.MINE);
    });

    it('fails to designate non-rock for mining', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      const result = designateTile(world, centerX, centerY, TaskType.MINE);
      expect(result).toBe(false);
    });

    it('designates tree for chopping', () => {
      const world = createWorld();
      // Find a tree
      let treeX = 0, treeY = 0;
      outer: for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
          if (world[y][x].type === TileType.TREE) {
            treeX = x;
            treeY = y;
            break outer;
          }
        }
      }
      const result = designateTile(world, treeX, treeY, TaskType.CHOP);
      expect(result).toBe(true);
      expect(world[treeY][treeX].designation).toBe(TaskType.CHOP);
    });
  });

  describe('clearDesignation', () => {
    it('clears designation from tile', () => {
      const world = createWorld();
      designateTile(world, 0, 0, TaskType.MINE);
      clearDesignation(world, 0, 0);
      expect(world[0][0].designation).toBeNull();
    });
  });

  describe('getDesignatedTiles', () => {
    it('returns all tiles with given designation', () => {
      const world = createWorld();
      designateTile(world, 0, 0, TaskType.MINE);
      designateTile(world, 1, 0, TaskType.MINE);
      designateTile(world, 2, 0, TaskType.MINE);
      
      const positions = getDesignatedTiles(world, TaskType.MINE);
      expect(positions.length).toBe(3);
    });

    it('returns empty array if no designations', () => {
      const world = createWorld();
      const positions = getDesignatedTiles(world, TaskType.MINE);
      expect(positions.length).toBe(0);
    });
  });

  describe('placeItem', () => {
    it('places item on walkable tile', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      const item = { type: ItemType.STONE, quantity: 5 };
      
      const result = placeItem(world, centerX, centerY, item);
      expect(result).toBe(true);
      expect(world[centerY][centerX].item).toEqual(item);
    });

    it('stacks items of same type', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      
      placeItem(world, centerX, centerY, { type: ItemType.STONE, quantity: 5 });
      placeItem(world, centerX, centerY, { type: ItemType.STONE, quantity: 3 });
      
      expect(world[centerY][centerX].item?.quantity).toBe(8);
    });

    it('fails to place on non-walkable tile', () => {
      const world = createWorld();
      const result = placeItem(world, 0, 0, { type: ItemType.STONE, quantity: 5 });
      expect(result).toBe(false);
    });

    it('fails to place different item type on occupied tile', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      
      placeItem(world, centerX, centerY, { type: ItemType.STONE, quantity: 5 });
      const result = placeItem(world, centerX, centerY, { type: ItemType.WOOD, quantity: 3 });
      expect(result).toBe(false);
    });
  });

  describe('removeItem', () => {
    it('removes and returns item', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      
      placeItem(world, centerX, centerY, { type: ItemType.STONE, quantity: 5 });
      const item = removeItem(world, centerX, centerY);
      
      expect(item).toEqual({ type: ItemType.STONE, quantity: 5 });
      expect(world[centerY][centerX].item).toBeNull();
    });

    it('returns null if no item', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      
      const item = removeItem(world, centerX, centerY);
      expect(item).toBeNull();
    });
  });

  describe('getItemAt', () => {
    it('returns item at position', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      
      placeItem(world, centerX, centerY, { type: ItemType.STONE, quantity: 5 });
      const item = getItemAt(world, centerX, centerY);
      
      expect(item?.type).toBe(ItemType.STONE);
    });

    it('returns null if no item', () => {
      const world = createWorld();
      const centerX = Math.floor(WORLD_WIDTH / 2);
      const centerY = Math.floor(WORLD_HEIGHT / 2);
      
      const item = getItemAt(world, centerX, centerY);
      expect(item).toBeNull();
    });
  });
});
