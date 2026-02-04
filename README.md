# Burrow

A Dwarf Fortress-inspired colony survival game with ASCII visuals. Manage colonists, designate tasks, and try to keep everyone alive.

Built with Next.js, TypeScript, and Canvas. No external game libraries - just vanilla rendering and a lot of pathfinding.

## What It Does

Drop 3 colonists into a procedurally generated world. They have needs (hunger, rest, mood) and skills (mining, construction, cooking). You designate areas to mine, trees to chop, and things to build. Colonists figure out the rest - mostly.

The AI isn't fancy. Colonists pathfind to tasks, work until they're done or starving, then go find food. Night makes everything darker. Day makes it brighter. The loop continues until everyone dies or you get bored.

## Controls

- **D** - Cycle through designation modes (mine, chop)
- **B** - Toggle build mode, cycle through building types (wall, floor, door, bed)
- **S** - Stockpile mode
- **Space** - Pause/unpause
- **Escape** - Cancel current mode
- **?** - Show help overlay
- **1-9** - Set task priority (lower = higher priority)
- **Right-click** - Cancel current mode

Click and drag to select areas for designation. Click to place buildings.

## Running It

```bash
npm install
npm run dev
```

Open http://localhost:3000 in a browser.

## Testing

```bash
npm test
```

248 tests covering world generation, pathfinding, colonist needs, task assignment, and building construction. The game logic is fully tested. The rendering isn't - you'll have to trust that Canvas works.

## Project Structure

```
src/
  game/        # Core game logic
    types.ts   # All the interfaces and enums
    World.ts   # Map generation and tile operations
    Colonist.ts # Need decay, skills, traits
    Task.ts    # Task creation and assignment
    Resource.ts # Item stacking and management
    Building.ts # Construction and materials
    Pathfinding.ts # A* algorithm
    Time.ts    # Day/night cycle
    Game.ts    # Main game state orchestration
    Renderer.ts # ASCII canvas rendering
  components/  # React UI overlays
  __tests__/   # Jest tests
```

## Technical Notes

- World is 64x48 tiles, rendered to a 1024x768 canvas
- Pathfinding uses A* with Manhattan distance heuristic and diagonal movement
- Game loop runs via requestAnimationFrame, capped at 100ms delta
- Colonist AI is priority-based: hungry? eat. tired? sleep. haul items? cook food? otherwise work.
- Rest at 0 halves movement speed. Mood at 0 halves work speed.
- Night renders a semi-transparent overlay. Fancy.

## License

MIT
