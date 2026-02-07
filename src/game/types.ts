// Enums
export enum TileType {
  GRASS = 'GRASS',
  ROCK = 'ROCK',
  TREE = 'TREE',
  WATER = 'WATER',
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  DOOR = 'DOOR'
}

export enum ItemType {
  STONE = 'STONE',
  WOOD = 'WOOD',
  RAW_FOOD = 'RAW_FOOD',
  MEAL = 'MEAL'
}

export enum TaskType {
  MINE = 'MINE',
  CHOP = 'CHOP',
  HAUL = 'HAUL',
  BUILD = 'BUILD',
  COOK = 'COOK',
  EAT = 'EAT',
  SLEEP = 'SLEEP'
}

export enum ColonistState {
  IDLE = 'IDLE',
  WORKING = 'WORKING',
  EATING = 'EATING',
  SLEEPING = 'SLEEPING',
  MOVING = 'MOVING'
}

export enum BuildType {
  WALL = 'WALL',
  FLOOR = 'FLOOR',
  DOOR = 'DOOR',
  BED = 'BED',
  STOCKPILE = 'STOCKPILE'
}

export enum Trait {
  HARDWORKER = 'HARDWORKER',
  LAZY = 'LAZY',
  OPTIMIST = 'OPTIMIST',
  PESSIMIST = 'PESSIMIST',
  TOUGH = 'TOUGH'
}

export enum GameScreen {
  TITLE = 'TITLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  HELP = 'HELP'
}

export enum DesignMode {
  NONE = 'NONE',
  MINE = 'MINE',
  CHOP = 'CHOP',
  BUILD = 'BUILD',
  STOCKPILE = 'STOCKPILE'
}

// Interfaces
export interface Position {
  x: number;
  y: number;
}

export interface Item {
  type: ItemType;
  quantity: number;
}

export interface Tile {
  type: TileType;
  designation: TaskType | null;
  item: Item | null;
}

export interface Skills {
  mining: number;
  construction: number;
  farming: number;
  cooking: number;
  combat: number;
}

export interface Needs {
  health: number;
  hunger: number;
  rest: number;
  mood: number;
}

export interface Colonist {
  id: string;
  name: string;
  pos: Position;
  needs: Needs;
  skills: Skills;
  trait: Trait;
  state: ColonistState;
  currentTask: string | null;
  path: Position[];
}

export interface Task {
  id: string;
  type: TaskType;
  pos: Position;
  priority: number;
  assignedTo: string | null;
  progress: number;
  buildType?: BuildType;
}

export interface Stockpile {
  id: string;
  tiles: Position[];
}

export interface Bed {
  id: string;
  pos: Position;
  occupiedBy: string | null;
}

export interface GameState {
  screen: GameScreen;
  world: Tile[][];
  colonists: Colonist[];
  tasks: Task[];
  stockpiles: Stockpile[];
  beds: Bed[];
  day: number;
  hour: number;
  minute: number;
  paused: boolean;
  messages: string[];
  designMode: DesignMode;
  selectedBuild: BuildType | null;
  selectedPriority: number;
}
