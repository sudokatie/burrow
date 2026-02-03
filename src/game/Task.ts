import { Task, TaskType, BuildType } from './types';
import { WORK_TIMES, BUILD_WORK_TIMES } from './constants';

let taskIdCounter = 0;

export function createTask(
  type: TaskType,
  pos: { x: number; y: number },
  priority: number = 5,
  buildType?: BuildType
): Task {
  return {
    id: `task-${++taskIdCounter}`,
    type,
    pos: { ...pos },
    priority,
    assignedTo: null,
    progress: 0,
    buildType,
  };
}

export function assignTask(task: Task, colonistId: string): void {
  task.assignedTo = colonistId;
}

export function unassignTask(task: Task): void {
  task.assignedTo = null;
}

export function progressTask(task: Task, amount: number): boolean {
  const workTime = getTaskWorkTime(task.type, task.buildType);
  task.progress += amount;
  return task.progress >= workTime;
}

export function isTaskComplete(task: Task): boolean {
  const workTime = getTaskWorkTime(task.type, task.buildType);
  return task.progress >= workTime;
}

export function getUnassignedTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.assignedTo === null);
}

export function getTasksByType(tasks: Task[], type: TaskType): Task[] {
  return tasks.filter((t) => t.type === type);
}

export function getHighestPriorityTask(tasks: Task[]): Task | null {
  if (tasks.length === 0) return null;
  
  const unassigned = getUnassignedTasks(tasks);
  if (unassigned.length === 0) return null;
  
  return unassigned.reduce((best, current) => 
    current.priority > best.priority ? current : best
  );
}

export function removeTask(tasks: Task[], taskId: string): Task[] {
  return tasks.filter((t) => t.id !== taskId);
}

export function getTaskWorkTime(type: TaskType, buildType?: BuildType): number {
  if (type === TaskType.BUILD && buildType !== undefined) {
    return BUILD_WORK_TIMES[buildType] ?? WORK_TIMES[TaskType.BUILD];
  }
  return WORK_TIMES[type] ?? 50;
}

export function resetTaskIdCounter(): void {
  taskIdCounter = 0;
}
