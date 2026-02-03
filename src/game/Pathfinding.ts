import { Tile, TileType, Position } from './types';
import { WORLD_WIDTH, WORLD_HEIGHT } from './constants';

export function isWalkable(tile: Tile): boolean {
  return tile.type === TileType.GRASS || 
         tile.type === TileType.FLOOR || 
         tile.type === TileType.DOOR;
}

export function getDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function heuristic(a: Position, b: Position): number {
  return getDistance(a, b);
}

export function getNeighbors(world: Tile[][], pos: Position): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];

  for (const dir of directions) {
    const nx = pos.x + dir.x;
    const ny = pos.y + dir.y;

    if (nx >= 0 && nx < WORLD_WIDTH && ny >= 0 && ny < WORLD_HEIGHT) {
      if (isWalkable(world[ny][nx])) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }

  return neighbors;
}

function posKey(pos: Position): string {
  return `${pos.x},${pos.y}`;
}

export function findPath(world: Tile[][], start: Position, end: Position): Position[] {
  if (!isWalkable(world[end.y]?.[end.x])) {
    return [];
  }
  
  if (start.x === end.x && start.y === end.y) {
    return [{ ...start }];
  }

  const openSet: Position[] = [{ ...start }];
  const cameFrom = new Map<string, Position>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  gScore.set(posKey(start), 0);
  fScore.set(posKey(start), heuristic(start, end));

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let currentIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      const iScore = fScore.get(posKey(openSet[i])) ?? Infinity;
      const curScore = fScore.get(posKey(openSet[currentIdx])) ?? Infinity;
      if (iScore < curScore) {
        currentIdx = i;
      }
    }

    const current = openSet[currentIdx];

    if (current.x === end.x && current.y === end.y) {
      // Reconstruct path
      const path: Position[] = [];
      let node: Position | undefined = current;
      while (node) {
        path.unshift({ ...node });
        node = cameFrom.get(posKey(node));
      }
      return path;
    }

    openSet.splice(currentIdx, 1);

    for (const neighbor of getNeighbors(world, current)) {
      const tentativeG = (gScore.get(posKey(current)) ?? Infinity) + 1;
      const neighborKey = posKey(neighbor);

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeG + heuristic(neighbor, end));

        if (!openSet.some(p => p.x === neighbor.x && p.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return []; // No path found
}

export function hasPath(world: Tile[][], start: Position, end: Position): boolean {
  return findPath(world, start, end).length > 0;
}
