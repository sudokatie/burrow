'use client';

import { Task, TaskType } from '../game/types';
import { getTaskWorkTime } from '../game/Task';

interface TaskPanelProps {
  tasks: Task[];
}

function getTaskIcon(type: TaskType): string {
  switch (type) {
    case TaskType.MINE: return '⛏';
    case TaskType.CHOP: return '🪓';
    case TaskType.HAUL: return '📦';
    case TaskType.BUILD: return '🔨';
    case TaskType.COOK: return '🍳';
    case TaskType.EAT: return '🍖';
    case TaskType.SLEEP: return '💤';
    default: return '?';
  }
}

function TaskRow({ task }: { task: Task }) {
  const workTime = getTaskWorkTime(task.type, task.buildType);
  const progress = workTime > 0 ? (task.progress / workTime) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2 py-1 border-b border-gray-800 last:border-0">
      <span className="text-sm">{getTaskIcon(task.type)}</span>
      <span className="flex-1 text-xs text-gray-300">{task.type}</span>
      {task.assignedTo ? (
        <div className="w-16 h-1.5 bg-gray-700 rounded overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : (
        <span className="text-xs text-yellow-500">pending</span>
      )}
    </div>
  );
}

export default function TaskPanel({ tasks }: TaskPanelProps) {
  const activeTasks = tasks.filter(t => t.assignedTo);
  const pendingTasks = tasks.filter(t => !t.assignedTo);
  
  return (
    <div className="absolute top-10 left-2 w-44 bg-gray-900 border border-gray-700 rounded p-2 font-mono text-sm max-h-64 overflow-y-auto">
      <h3 className="text-green-400 mb-2 border-b border-gray-700 pb-1">
        Tasks ({tasks.length})
      </h3>
      
      {activeTasks.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-gray-500 mb-1">Active</div>
          {activeTasks.slice(0, 5).map(task => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}
      
      {pendingTasks.length > 0 && (
        <div>
          <div className="text-xs text-gray-500 mb-1">Pending</div>
          {pendingTasks.slice(0, 5).map(task => (
            <TaskRow key={task.id} task={task} />
          ))}
          {pendingTasks.length > 5 && (
            <div className="text-xs text-gray-600 mt-1">
              +{pendingTasks.length - 5} more
            </div>
          )}
        </div>
      )}
      
      {tasks.length === 0 && (
        <p className="text-gray-500 text-xs">No tasks queued</p>
      )}
    </div>
  );
}
