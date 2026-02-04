import {
  findPath,
  hasPath,
  getDistance,
  getNeighbors,
  heuristic,
  isWalkable,
} from '../game/Pathfinding';
import { TileType, Tile } from '../game/types';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../game/constants';

function createEmptyTile(type: TileType = TileType.GRASS): Tile {
  return { type, designation: null, item: null };
}

function createWorld(width: number, height: number, type: TileType = TileType.GRASS): Tile[][] {
  const world: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    world[y] = [];
    for (let x = 0; x < width; x++) {
      world[y][x] = createEmptyTile(type);
    }
  }
  return world;
}

describe('Pathfinding', () => {
  describe('isWalkable', () => {
    it('returns true for grass', () => {
      expect(isWalkable(createEmptyTile(TileType.GRASS))).toBe(true);
    });

    it('returns true for floor', () => {
      expect(isWalkable(createEmptyTile(TileType.FLOOR))).toBe(true);
    });

    it('returns true for door', () => {
      expect(isWalkable(createEmptyTile(TileType.DOOR))).toBe(true);
    });

    it('returns false for rock', () => {
      expect(isWalkable(createEmptyTile(TileType.ROCK))).toBe(false);
    });

    it('returns false for wall', () => {
      expect(isWalkable(createEmptyTile(TileType.WALL))).toBe(false);
    });

    it('returns false for water', () => {
      expect(isWalkable(createEmptyTile(TileType.WATER))).toBe(false);
    });

    it('returns false for tree', () => {
      expect(isWalkable(createEmptyTile(TileType.TREE))).toBe(false);
    });
  });

  describe('getDistance', () => {
    it('returns 0 for same position', () => {
      expect(getDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
    });

    it('returns manhattan distance', () => {
      expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
    });

    it('handles negative coordinates correctly', () => {
      expect(getDistance({ x: -2, y: -3 }, { x: 2, y: 3 })).toBe(10);
    });
  });

  describe('heuristic', () => {
    it('returns same as getDistance', () => {
      const a = { x: 1, y: 2 };
      const b = { x: 5, y: 8 };
      expect(heuristic(a, b)).toBe(getDistance(a, b));
    });
  });

  describe('getNeighbors', () => {
    it('returns 8 neighbors in open space (includes diagonals)', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      const neighbors = getNeighbors(world, { x: 5, y: 5 });
      expect(neighbors).toHaveLength(8);
    });

    it('excludes unwalkable tiles', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      world[4][5].type = TileType.ROCK; // Above
      world[6][5].type = TileType.WALL; // Below
      
      const neighbors = getNeighbors(world, { x: 5, y: 5 });
      // Left, right, and 4 diagonals = 6
      expect(neighbors).toHaveLength(6);
    });

    it('excludes out of bounds', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      const neighbors = getNeighbors(world, { x: 0, y: 0 });
      // Right, down, and down-right diagonal = 3
      expect(neighbors).toHaveLength(3);
    });

    it('returns empty for fully blocked position', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      // Block all 8 directions
      world[4][5].type = TileType.ROCK; // up
      world[6][5].type = TileType.ROCK; // down
      world[5][4].type = TileType.ROCK; // left
      world[5][6].type = TileType.ROCK; // right
      world[4][4].type = TileType.ROCK; // up-left
      world[4][6].type = TileType.ROCK; // up-right
      world[6][4].type = TileType.ROCK; // down-left
      world[6][6].type = TileType.ROCK; // down-right
      
      const neighbors = getNeighbors(world, { x: 5, y: 5 });
      expect(neighbors).toHaveLength(0);
    });
  });

  describe('findPath', () => {
    it('returns single position for same start and end', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      const path = findPath(world, { x: 5, y: 5 }, { x: 5, y: 5 });
      expect(path).toHaveLength(1);
      expect(path[0]).toEqual({ x: 5, y: 5 });
    });

    it('finds direct path', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      const path = findPath(world, { x: 5, y: 5 }, { x: 8, y: 5 });
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual({ x: 5, y: 5 });
      expect(path[path.length - 1]).toEqual({ x: 8, y: 5 });
    });

    it('returns optimal path length with diagonals', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      const path = findPath(world, { x: 0, y: 0 }, { x: 3, y: 2 });
      // With diagonals: 2 diagonal + 1 horizontal = 4 positions (including start)
      expect(path).toHaveLength(4);
    });

    it('navigates around obstacles', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      // Create wall between start and end
      world[5][4].type = TileType.ROCK;
      world[5][5].type = TileType.ROCK;
      world[5][6].type = TileType.ROCK;
      
      const path = findPath(world, { x: 5, y: 4 }, { x: 5, y: 6 });
      expect(path.length).toBeGreaterThan(0);
      expect(path[path.length - 1]).toEqual({ x: 5, y: 6 });
    });

    it('returns empty for unreachable destination', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      // Surround destination with walls
      world[4][4].type = TileType.ROCK;
      world[4][5].type = TileType.ROCK;
      world[4][6].type = TileType.ROCK;
      world[5][4].type = TileType.ROCK;
      world[5][6].type = TileType.ROCK;
      world[6][4].type = TileType.ROCK;
      world[6][5].type = TileType.ROCK;
      world[6][6].type = TileType.ROCK;
      
      const path = findPath(world, { x: 0, y: 0 }, { x: 5, y: 5 });
      expect(path).toHaveLength(0);
    });

    it('returns empty for unwalkable destination', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      world[5][5].type = TileType.ROCK;
      
      const path = findPath(world, { x: 0, y: 0 }, { x: 5, y: 5 });
      expect(path).toHaveLength(0);
    });

    it('path includes start and end', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      const path = findPath(world, { x: 2, y: 2 }, { x: 5, y: 5 });
      expect(path[0]).toEqual({ x: 2, y: 2 });
      expect(path[path.length - 1]).toEqual({ x: 5, y: 5 });
    });

    it('each step is adjacent to previous (including diagonals)', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      const path = findPath(world, { x: 0, y: 0 }, { x: 10, y: 10 });
      
      for (let i = 1; i < path.length; i++) {
        const dx = Math.abs(path[i].x - path[i-1].x);
        const dy = Math.abs(path[i].y - path[i-1].y);
        // Each step should be at most 1 tile away in both x and y (allows diagonal)
        expect(dx).toBeLessThanOrEqual(1);
        expect(dy).toBeLessThanOrEqual(1);
        expect(dx + dy).toBeGreaterThan(0); // Must move at least 1
      }
    });
  });

  describe('hasPath', () => {
    it('returns true when path exists', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      expect(hasPath(world, { x: 0, y: 0 }, { x: 10, y: 10 })).toBe(true);
    });

    it('returns false when no path exists', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      world[5][5].type = TileType.ROCK;
      
      // Surround destination
      world[4][4].type = TileType.ROCK;
      world[4][5].type = TileType.ROCK;
      world[4][6].type = TileType.ROCK;
      world[5][4].type = TileType.ROCK;
      world[5][6].type = TileType.ROCK;
      world[6][4].type = TileType.ROCK;
      world[6][5].type = TileType.ROCK;
      world[6][6].type = TileType.ROCK;
      
      expect(hasPath(world, { x: 0, y: 0 }, { x: 5, y: 5 })).toBe(false);
    });

    it('returns true for same position', () => {
      const world = createWorld(WORLD_WIDTH, WORLD_HEIGHT);
      expect(hasPath(world, { x: 5, y: 5 }, { x: 5, y: 5 })).toBe(true);
    });
  });
});
