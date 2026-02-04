import { Colonist, ColonistState, Needs, Skills, Trait, Position, TaskType } from './types';
import { 
  NEED_DECAY, 
  NEED_THRESHOLDS, 
  TRAIT_WORK_MODIFIER, 
  TRAIT_MOOD_MODIFIER,
  TRAIT_HEALTH_MODIFIER,
  COLONIST_NAMES,
  MIN_SKILL,
  MAX_SKILL,
  STARVATION_DAMAGE
} from './constants';

let colonistIdCounter = 0;

export function resetColonistIdCounter(): void {
  colonistIdCounter = 0;
}

function generateId(): string {
  return `colonist_${++colonistIdCounter}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTrait(): Trait {
  const traits = Object.values(Trait);
  return traits[Math.floor(Math.random() * traits.length)];
}

function randomName(): string {
  return COLONIST_NAMES[Math.floor(Math.random() * COLONIST_NAMES.length)];
}

export function createNeeds(): Needs {
  return {
    health: 100,
    hunger: 100,
    rest: 100,
    mood: 75
  };
}

export function createSkills(): Skills {
  return {
    mining: randomInt(MIN_SKILL, MAX_SKILL),
    construction: randomInt(MIN_SKILL, MAX_SKILL),
    farming: randomInt(MIN_SKILL, MAX_SKILL),
    cooking: randomInt(MIN_SKILL, MAX_SKILL),
    combat: randomInt(MIN_SKILL, MAX_SKILL)
  };
}

export function createColonist(name: string, pos: Position): Colonist {
  return {
    id: generateId(),
    name,
    pos: { ...pos },
    needs: createNeeds(),
    skills: createSkills(),
    trait: randomTrait(),
    state: ColonistState.IDLE,
    currentTask: null,
    path: []
  };
}

export function generateRandomColonist(pos: Position): Colonist {
  return createColonist(randomName(), pos);
}

export function updateNeeds(colonist: Colonist, dt: number): void {
  // Apply mood modifier from trait
  const moodMod = TRAIT_MOOD_MODIFIER[colonist.trait];
  const moodDecay = NEED_DECAY.mood * (1 - moodMod);
  
  colonist.needs.hunger = Math.max(0, colonist.needs.hunger - NEED_DECAY.hunger * dt);
  colonist.needs.rest = Math.max(0, colonist.needs.rest - NEED_DECAY.rest * dt);
  colonist.needs.mood = Math.max(0, colonist.needs.mood - moodDecay * dt);
  
  // Starvation damage
  if (colonist.needs.hunger <= 0) {
    colonist.needs.health = Math.max(0, colonist.needs.health - STARVATION_DAMAGE * dt);
  }
}

export function satisfyNeed(colonist: Colonist, need: keyof Needs, amount: number): void {
  colonist.needs[need] = Math.min(100, colonist.needs[need] + amount);
}

export function getSkillForTask(taskType: TaskType): keyof Skills | null {
  switch (taskType) {
    case TaskType.MINE: return 'mining';
    case TaskType.BUILD: return 'construction';
    case TaskType.COOK: return 'cooking';
    default: return null;
  }
}

export function getWorkSpeed(colonist: Colonist, taskType: TaskType): number {
  const baseSpeed = 1.0;
  
  // Skill bonus
  const skillKey = getSkillForTask(taskType);
  const skillBonus = skillKey ? colonist.skills[skillKey] * 0.05 : 0;
  
  // Trait bonus
  const traitBonus = TRAIT_WORK_MODIFIER[colonist.trait];
  
  // Mood penalty - work speed halved at 0 mood
  const moodPenalty = colonist.needs.mood <= 0 ? 0.5 : 1.0;
  
  return baseSpeed * (1 + skillBonus + traitBonus) * moodPenalty;
}

export function getMovementSpeed(colonist: Colonist): number {
  // Rest penalty - movement speed halved at 0 rest
  return colonist.needs.rest <= 0 ? 0.5 : 1.0;
}

export function setColonistState(colonist: Colonist, state: ColonistState): void {
  colonist.state = state;
}

export function getNeedStatus(value: number): 'good' | 'okay' | 'bad' | 'critical' {
  if (value >= NEED_THRESHOLDS.good) return 'good';
  if (value >= NEED_THRESHOLDS.okay) return 'okay';
  if (value >= NEED_THRESHOLDS.bad) return 'bad';
  return 'critical';
}

export function isColonistCritical(colonist: Colonist): boolean {
  return colonist.needs.health < NEED_THRESHOLDS.bad ||
         colonist.needs.hunger < NEED_THRESHOLDS.bad ||
         colonist.needs.rest < NEED_THRESHOLDS.bad;
}

export function isColonistDead(colonist: Colonist): boolean {
  return colonist.needs.health <= 0;
}

export function damageColonist(colonist: Colonist, amount: number): void {
  colonist.needs.health = Math.max(0, colonist.needs.health - amount);
}

export function healColonist(colonist: Colonist, amount: number): void {
  // Apply tough trait bonus
  const healthMod = TRAIT_HEALTH_MODIFIER[colonist.trait];
  const maxHealth = 100 * (1 + healthMod);
  colonist.needs.health = Math.min(maxHealth, colonist.needs.health + amount);
}

export function getColonistNeedStatus(colonist: Colonist): Record<keyof Needs, string> {
  return {
    health: getNeedStatus(colonist.needs.health),
    hunger: getNeedStatus(colonist.needs.hunger),
    rest: getNeedStatus(colonist.needs.rest),
    mood: getNeedStatus(colonist.needs.mood)
  };
}

export function moveColonist(colonist: Colonist, pos: Position): void {
  colonist.pos = { ...pos };
}

export function setColonistPath(colonist: Colonist, path: Position[]): void {
  colonist.path = [...path];
}

export function clearColonistPath(colonist: Colonist): void {
  colonist.path = [];
}

export function assignTask(colonist: Colonist, taskId: string): void {
  colonist.currentTask = taskId;
  colonist.state = ColonistState.WORKING;
}

export function clearTask(colonist: Colonist): void {
  colonist.currentTask = null;
  colonist.state = ColonistState.IDLE;
}

export function isHungry(colonist: Colonist): boolean {
  return colonist.needs.hunger < NEED_THRESHOLDS.okay;
}

export function isTired(colonist: Colonist): boolean {
  return colonist.needs.rest < NEED_THRESHOLDS.bad;
}

export function isIdle(colonist: Colonist): boolean {
  return colonist.state === ColonistState.IDLE;
}
