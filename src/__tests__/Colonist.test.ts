import {
  createColonist,
  generateRandomColonist,
  createNeeds,
  createSkills,
  updateNeeds,
  satisfyNeed,
  getWorkSpeed,
  setColonistState,
  getNeedStatus,
  isColonistCritical,
  isColonistDead,
  damageColonist,
  healColonist,
  moveColonist,
  setColonistPath,
  clearColonistPath,
  assignTask,
  clearTask,
  isHungry,
  isTired,
  isIdle,
  resetColonistIdCounter
} from '../game/Colonist';
import { ColonistState, Trait, TaskType } from '../game/types';
import { NEED_DECAY, NEED_THRESHOLDS, TRAIT_WORK_MODIFIER } from '../game/constants';

describe('Colonist', () => {
  beforeEach(() => {
    resetColonistIdCounter();
  });

  describe('createNeeds', () => {
    it('creates needs with correct defaults', () => {
      const needs = createNeeds();
      expect(needs.health).toBe(100);
      expect(needs.hunger).toBe(100);
      expect(needs.rest).toBe(100);
      expect(needs.mood).toBe(75);
    });
  });

  describe('createSkills', () => {
    it('creates skills with values in valid range', () => {
      const skills = createSkills();
      expect(skills.mining).toBeGreaterThanOrEqual(1);
      expect(skills.mining).toBeLessThanOrEqual(20);
      expect(skills.construction).toBeGreaterThanOrEqual(1);
      expect(skills.cooking).toBeGreaterThanOrEqual(1);
    });
  });

  describe('createColonist', () => {
    it('creates colonist with given name and position', () => {
      const colonist = createColonist('Test', { x: 10, y: 20 });
      expect(colonist.name).toBe('Test');
      expect(colonist.pos).toEqual({ x: 10, y: 20 });
      expect(colonist.id).toBe('colonist_1');
    });

    it('creates colonist with initial state IDLE', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      expect(colonist.state).toBe(ColonistState.IDLE);
    });

    it('creates colonist with no current task', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      expect(colonist.currentTask).toBeNull();
    });

    it('creates colonist with empty path', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      expect(colonist.path).toEqual([]);
    });
  });

  describe('generateRandomColonist', () => {
    it('creates colonist with random name', () => {
      const colonist = generateRandomColonist({ x: 0, y: 0 });
      expect(colonist.name).toBeTruthy();
    });
  });

  describe('updateNeeds', () => {
    it('decreases hunger over time', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.hunger = 100;
      updateNeeds(colonist, 1);
      expect(colonist.needs.hunger).toBeLessThan(100);
    });

    it('decreases rest over time', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.rest = 100;
      updateNeeds(colonist, 1);
      expect(colonist.needs.rest).toBeLessThan(100);
    });

    it('decreases mood over time', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.mood = 100;
      updateNeeds(colonist, 1);
      expect(colonist.needs.mood).toBeLessThan(100);
    });

    it('needs do not go below 0', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.hunger = 0.1;
      updateNeeds(colonist, 10);
      expect(colonist.needs.hunger).toBe(0);
    });

    it('damages health when starving', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.hunger = 0;
      colonist.needs.health = 100;
      updateNeeds(colonist, 1);
      expect(colonist.needs.health).toBeLessThan(100);
    });
  });

  describe('satisfyNeed', () => {
    it('increases need value', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.hunger = 50;
      satisfyNeed(colonist, 'hunger', 30);
      expect(colonist.needs.hunger).toBe(80);
    });

    it('caps need at 100', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.hunger = 90;
      satisfyNeed(colonist, 'hunger', 50);
      expect(colonist.needs.hunger).toBe(100);
    });
  });

  describe('getWorkSpeed', () => {
    it('returns base speed for colonist without modifiers', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.skills.mining = 0;
      colonist.trait = Trait.OPTIMIST; // No work modifier
      
      const speed = getWorkSpeed(colonist, TaskType.MINE);
      expect(speed).toBeCloseTo(1.0, 1);
    });

    it('applies skill bonus', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.skills.mining = 10;
      colonist.trait = Trait.OPTIMIST;
      
      const speed = getWorkSpeed(colonist, TaskType.MINE);
      expect(speed).toBeGreaterThan(1.0);
    });

    it('applies hardworker trait bonus', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.skills.mining = 0;
      colonist.trait = Trait.HARDWORKER;
      
      const speed = getWorkSpeed(colonist, TaskType.MINE);
      expect(speed).toBeCloseTo(1.2, 1);
    });

    it('applies lazy trait penalty', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.skills.mining = 0;
      colonist.trait = Trait.LAZY;
      
      const speed = getWorkSpeed(colonist, TaskType.MINE);
      expect(speed).toBeCloseTo(0.8, 1);
    });
  });

  describe('setColonistState', () => {
    it('changes colonist state', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      setColonistState(colonist, ColonistState.WORKING);
      expect(colonist.state).toBe(ColonistState.WORKING);
    });
  });

  describe('getNeedStatus', () => {
    it('returns good for values >= 75', () => {
      expect(getNeedStatus(75)).toBe('good');
      expect(getNeedStatus(100)).toBe('good');
    });

    it('returns okay for values 50-74', () => {
      expect(getNeedStatus(50)).toBe('okay');
      expect(getNeedStatus(74)).toBe('okay');
    });

    it('returns bad for values 25-49', () => {
      expect(getNeedStatus(25)).toBe('bad');
      expect(getNeedStatus(49)).toBe('bad');
    });

    it('returns critical for values < 25', () => {
      expect(getNeedStatus(24)).toBe('critical');
      expect(getNeedStatus(0)).toBe('critical');
    });
  });

  describe('isColonistCritical', () => {
    it('returns true when health is critical', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.health = 20;
      expect(isColonistCritical(colonist)).toBe(true);
    });

    it('returns true when hunger is critical', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.hunger = 20;
      expect(isColonistCritical(colonist)).toBe(true);
    });

    it('returns false when all needs are okay', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      expect(isColonistCritical(colonist)).toBe(false);
    });
  });

  describe('isColonistDead', () => {
    it('returns true when health is 0', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.health = 0;
      expect(isColonistDead(colonist)).toBe(true);
    });

    it('returns false when health is positive', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      expect(isColonistDead(colonist)).toBe(false);
    });
  });

  describe('damageColonist', () => {
    it('reduces health', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      damageColonist(colonist, 30);
      expect(colonist.needs.health).toBe(70);
    });

    it('does not go below 0', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      damageColonist(colonist, 150);
      expect(colonist.needs.health).toBe(0);
    });
  });

  describe('healColonist', () => {
    it('increases health', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.health = 50;
      healColonist(colonist, 20);
      expect(colonist.needs.health).toBe(70);
    });

    it('caps at max health', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.trait = Trait.OPTIMIST;
      healColonist(colonist, 200);
      expect(colonist.needs.health).toBe(100);
    });
  });

  describe('moveColonist', () => {
    it('updates position', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      moveColonist(colonist, { x: 10, y: 20 });
      expect(colonist.pos).toEqual({ x: 10, y: 20 });
    });
  });

  describe('setColonistPath', () => {
    it('sets path', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      const path = [{ x: 1, y: 0 }, { x: 2, y: 0 }];
      setColonistPath(colonist, path);
      expect(colonist.path).toEqual(path);
    });
  });

  describe('clearColonistPath', () => {
    it('clears path', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.path = [{ x: 1, y: 0 }];
      clearColonistPath(colonist);
      expect(colonist.path).toEqual([]);
    });
  });

  describe('assignTask', () => {
    it('sets task and state', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      assignTask(colonist, 'task_1');
      expect(colonist.currentTask).toBe('task_1');
      expect(colonist.state).toBe(ColonistState.WORKING);
    });
  });

  describe('clearTask', () => {
    it('clears task and sets idle', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.currentTask = 'task_1';
      colonist.state = ColonistState.WORKING;
      clearTask(colonist);
      expect(colonist.currentTask).toBeNull();
      expect(colonist.state).toBe(ColonistState.IDLE);
    });
  });

  describe('isHungry', () => {
    it('returns true when hunger below threshold', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.hunger = 40;
      expect(isHungry(colonist)).toBe(true);
    });

    it('returns false when hunger above threshold', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.hunger = 60;
      expect(isHungry(colonist)).toBe(false);
    });
  });

  describe('isTired', () => {
    it('returns true when rest below threshold', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.rest = 20;
      expect(isTired(colonist)).toBe(true);
    });

    it('returns false when rest above threshold', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.needs.rest = 50;
      expect(isTired(colonist)).toBe(false);
    });
  });

  describe('isIdle', () => {
    it('returns true when state is IDLE', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      expect(isIdle(colonist)).toBe(true);
    });

    it('returns false when state is not IDLE', () => {
      const colonist = createColonist('Test', { x: 0, y: 0 });
      colonist.state = ColonistState.WORKING;
      expect(isIdle(colonist)).toBe(false);
    });
  });
});
