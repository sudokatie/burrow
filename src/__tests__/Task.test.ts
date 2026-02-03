import {
  createTask,
  assignTask,
  unassignTask,
  progressTask,
  isTaskComplete,
  getUnassignedTasks,
  getTasksByType,
  getHighestPriorityTask,
  removeTask,
  getTaskWorkTime,
  resetTaskIdCounter,
} from '../game/Task';
import { TaskType, BuildType, Task } from '../game/types';
import { WORK_TIMES, BUILD_WORK_TIMES } from '../game/constants';

describe('Task System', () => {
  beforeEach(() => {
    resetTaskIdCounter();
  });

  describe('createTask', () => {
    it('creates a task with required fields', () => {
      const task = createTask(TaskType.MINE, { x: 5, y: 10 });
      expect(task.type).toBe(TaskType.MINE);
      expect(task.pos).toEqual({ x: 5, y: 10 });
      expect(task.priority).toBe(5);
      expect(task.assignedTo).toBeNull();
      expect(task.progress).toBe(0);
    });

    it('creates a task with custom priority', () => {
      const task = createTask(TaskType.CHOP, { x: 0, y: 0 }, 10);
      expect(task.priority).toBe(10);
    });

    it('creates a build task with build type', () => {
      const task = createTask(TaskType.BUILD, { x: 3, y: 4 }, 5, BuildType.WALL);
      expect(task.type).toBe(TaskType.BUILD);
      expect(task.buildType).toBe(BuildType.WALL);
    });

    it('generates unique task ids', () => {
      const t1 = createTask(TaskType.MINE, { x: 0, y: 0 });
      const t2 = createTask(TaskType.MINE, { x: 1, y: 1 });
      expect(t1.id).not.toBe(t2.id);
    });

    it('copies position to avoid mutation', () => {
      const pos = { x: 5, y: 5 };
      const task = createTask(TaskType.MINE, pos);
      pos.x = 99;
      expect(task.pos.x).toBe(5);
    });
  });

  describe('assignTask', () => {
    it('assigns a colonist to the task', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      assignTask(task, 'colonist-1');
      expect(task.assignedTo).toBe('colonist-1');
    });

    it('can reassign to different colonist', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      assignTask(task, 'colonist-1');
      assignTask(task, 'colonist-2');
      expect(task.assignedTo).toBe('colonist-2');
    });
  });

  describe('unassignTask', () => {
    it('removes colonist assignment', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      assignTask(task, 'colonist-1');
      unassignTask(task);
      expect(task.assignedTo).toBeNull();
    });
  });

  describe('progressTask', () => {
    it('adds progress to task', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      progressTask(task, 10);
      expect(task.progress).toBe(10);
    });

    it('returns false when task not complete', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      expect(progressTask(task, 10)).toBe(false);
    });

    it('returns true when task becomes complete', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      const workTime = WORK_TIMES[TaskType.MINE];
      expect(progressTask(task, workTime)).toBe(true);
    });

    it('accumulates progress over multiple calls', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      progressTask(task, 30);
      progressTask(task, 30);
      expect(task.progress).toBe(60);
    });
  });

  describe('isTaskComplete', () => {
    it('returns false for new task', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      expect(isTaskComplete(task)).toBe(false);
    });

    it('returns true when progress meets work time', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      task.progress = WORK_TIMES[TaskType.MINE];
      expect(isTaskComplete(task)).toBe(true);
    });

    it('returns true when progress exceeds work time', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      task.progress = WORK_TIMES[TaskType.MINE] + 50;
      expect(isTaskComplete(task)).toBe(true);
    });

    it('uses build type work time for build tasks', () => {
      const task = createTask(TaskType.BUILD, { x: 0, y: 0 }, 5, BuildType.FLOOR);
      task.progress = BUILD_WORK_TIMES[BuildType.FLOOR];
      expect(isTaskComplete(task)).toBe(true);
    });
  });

  describe('getUnassignedTasks', () => {
    it('returns empty array for empty list', () => {
      expect(getUnassignedTasks([])).toEqual([]);
    });

    it('returns all unassigned tasks', () => {
      const t1 = createTask(TaskType.MINE, { x: 0, y: 0 });
      const t2 = createTask(TaskType.CHOP, { x: 1, y: 1 });
      assignTask(t2, 'colonist-1');
      const t3 = createTask(TaskType.HAUL, { x: 2, y: 2 });
      
      const unassigned = getUnassignedTasks([t1, t2, t3]);
      expect(unassigned).toHaveLength(2);
      expect(unassigned).toContain(t1);
      expect(unassigned).toContain(t3);
    });

    it('returns all tasks when none assigned', () => {
      const tasks = [
        createTask(TaskType.MINE, { x: 0, y: 0 }),
        createTask(TaskType.CHOP, { x: 1, y: 1 }),
      ];
      expect(getUnassignedTasks(tasks)).toHaveLength(2);
    });
  });

  describe('getTasksByType', () => {
    it('returns empty for empty list', () => {
      expect(getTasksByType([], TaskType.MINE)).toEqual([]);
    });

    it('filters tasks by type', () => {
      const tasks = [
        createTask(TaskType.MINE, { x: 0, y: 0 }),
        createTask(TaskType.CHOP, { x: 1, y: 1 }),
        createTask(TaskType.MINE, { x: 2, y: 2 }),
      ];
      const mineTasks = getTasksByType(tasks, TaskType.MINE);
      expect(mineTasks).toHaveLength(2);
    });

    it('returns empty when no matches', () => {
      const tasks = [createTask(TaskType.MINE, { x: 0, y: 0 })];
      expect(getTasksByType(tasks, TaskType.COOK)).toEqual([]);
    });
  });

  describe('getHighestPriorityTask', () => {
    it('returns null for empty list', () => {
      expect(getHighestPriorityTask([])).toBeNull();
    });

    it('returns null when all tasks assigned', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      assignTask(task, 'colonist-1');
      expect(getHighestPriorityTask([task])).toBeNull();
    });

    it('returns highest priority unassigned task', () => {
      const low = createTask(TaskType.MINE, { x: 0, y: 0 }, 3);
      const high = createTask(TaskType.CHOP, { x: 1, y: 1 }, 10);
      const mid = createTask(TaskType.HAUL, { x: 2, y: 2 }, 5);
      
      expect(getHighestPriorityTask([low, high, mid])).toBe(high);
    });

    it('ignores assigned tasks even if high priority', () => {
      const assigned = createTask(TaskType.MINE, { x: 0, y: 0 }, 100);
      assignTask(assigned, 'colonist-1');
      const unassigned = createTask(TaskType.CHOP, { x: 1, y: 1 }, 5);
      
      expect(getHighestPriorityTask([assigned, unassigned])).toBe(unassigned);
    });
  });

  describe('removeTask', () => {
    it('removes task by id', () => {
      const t1 = createTask(TaskType.MINE, { x: 0, y: 0 });
      const t2 = createTask(TaskType.CHOP, { x: 1, y: 1 });
      
      const remaining = removeTask([t1, t2], t1.id);
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toBe(t2);
    });

    it('returns same array if id not found', () => {
      const tasks = [createTask(TaskType.MINE, { x: 0, y: 0 })];
      const result = removeTask(tasks, 'nonexistent');
      expect(result).toHaveLength(1);
    });

    it('returns empty array when removing only task', () => {
      const task = createTask(TaskType.MINE, { x: 0, y: 0 });
      expect(removeTask([task], task.id)).toEqual([]);
    });
  });

  describe('getTaskWorkTime', () => {
    it('returns work time for regular tasks', () => {
      expect(getTaskWorkTime(TaskType.MINE)).toBe(WORK_TIMES[TaskType.MINE]);
      expect(getTaskWorkTime(TaskType.CHOP)).toBe(WORK_TIMES[TaskType.CHOP]);
      expect(getTaskWorkTime(TaskType.HAUL)).toBe(WORK_TIMES[TaskType.HAUL]);
    });

    it('returns build type work time for build tasks', () => {
      expect(getTaskWorkTime(TaskType.BUILD, BuildType.WALL)).toBe(BUILD_WORK_TIMES[BuildType.WALL]);
      expect(getTaskWorkTime(TaskType.BUILD, BuildType.FLOOR)).toBe(BUILD_WORK_TIMES[BuildType.FLOOR]);
    });

    it('returns base build time when no build type specified', () => {
      expect(getTaskWorkTime(TaskType.BUILD)).toBe(WORK_TIMES[TaskType.BUILD]);
    });
  });
});
