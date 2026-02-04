# Changelog

## 0.1.0 (2026-02-04)

Initial release.

### Features

- Procedurally generated 64x48 tile world with grass, rock, trees, and water
- 3 starting colonists with randomized names, skills, and personality traits
- Need system: hunger, rest, mood, health - all slowly decaying
- Task system: mining, chopping, hauling, building, cooking
- Building system: walls, floors, doors, beds, stockpiles
- A* pathfinding for colonist movement
- Day/night cycle with visual overlay
- ASCII-style rendering to canvas
- Drag-to-select designation for mining and chopping
- Colonist AI with priority-based task selection
- Pause/resume functionality
- UI panels for status, colonist needs, active tasks, and alerts

### Technical

- Next.js 14 with TypeScript
- Pure Canvas rendering (no game libraries)
- 241 unit tests covering core game logic
- ESLint clean
