import { GameState, TileType, Colonist, Position } from './types';
import {
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  ASCII_CHARS,
  TILE_COLORS,
  ENTITY_COLORS,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from './constants';
import { isDaytime } from './Game';

const FONT_SIZE = 14;

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState): void {
  // Clear canvas
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Render layers
  renderWorld(ctx, state);
  renderDesignations(ctx, state);
  renderItems(ctx, state);
  renderColonists(ctx, state.colonists);
  renderDayNightOverlay(ctx, state);
}

export function renderWorld(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.font = `${FONT_SIZE}px monospace`;
  ctx.textBaseline = 'top';

  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const tile = state.world[y][x];
      const char = getAsciiChar(tile.type);
      const color = getTileColor(tile.type);

      ctx.fillStyle = color;
      ctx.fillText(char, x * TILE_SIZE, y * TILE_SIZE);
    }
  }
}

export function renderDesignations(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.font = `${FONT_SIZE}px monospace`;

  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const tile = state.world[y][x];
      if (tile.designation) {
        // Draw designation marker
        ctx.fillStyle = ENTITY_COLORS.designation;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.globalAlpha = 1.0;
      }
    }
  }
  
  // Draw stockpile zones
  for (const stockpile of state.stockpiles) {
    for (const pos of stockpile.tiles) {
      ctx.fillStyle = ENTITY_COLORS.stockpile;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(pos.x * TILE_SIZE, pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.globalAlpha = 1.0;
    }
  }
}

export function renderItems(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.font = `${FONT_SIZE}px monospace`;
  ctx.textBaseline = 'top';

  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const tile = state.world[y][x];
      if (tile.item) {
        ctx.fillStyle = ENTITY_COLORS.item;
        ctx.fillText(ASCII_CHARS.ITEM, x * TILE_SIZE, y * TILE_SIZE);
      }
    }
  }
}

export function renderColonists(ctx: CanvasRenderingContext2D, colonists: Colonist[]): void {
  ctx.font = `bold ${FONT_SIZE}px monospace`;
  ctx.textBaseline = 'top';

  for (const colonist of colonists) {
    ctx.fillStyle = ENTITY_COLORS.colonist;
    ctx.fillText(ASCII_CHARS.COLONIST, colonist.pos.x * TILE_SIZE, colonist.pos.y * TILE_SIZE);
    
    // Draw name below
    ctx.font = `${FONT_SIZE - 4}px monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(colonist.name, colonist.pos.x * TILE_SIZE - 8, colonist.pos.y * TILE_SIZE + TILE_SIZE);
    ctx.font = `bold ${FONT_SIZE}px monospace`;
  }
}

export function renderSelection(
  ctx: CanvasRenderingContext2D,
  start: Position,
  end: Position
): void {
  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxY = Math.max(start.y, end.y);

  const width = (maxX - minX + 1) * TILE_SIZE;
  const height = (maxY - minY + 1) * TILE_SIZE;

  ctx.strokeStyle = '#ffff00';
  ctx.lineWidth = 2;
  ctx.strokeRect(minX * TILE_SIZE, minY * TILE_SIZE, width, height);
  
  ctx.fillStyle = '#ffff00';
  ctx.globalAlpha = 0.2;
  ctx.fillRect(minX * TILE_SIZE, minY * TILE_SIZE, width, height);
  ctx.globalAlpha = 1.0;
}

export function renderDayNightOverlay(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!isDaytime(state)) {
    ctx.fillStyle = '#000033';
    ctx.globalAlpha = 0.4;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1.0;
  }
}

export function getAsciiChar(tileType: TileType): string {
  return ASCII_CHARS[tileType] ?? '?';
}

export function getTileColor(tileType: TileType): string {
  return TILE_COLORS[tileType] ?? '#ffffff';
}
