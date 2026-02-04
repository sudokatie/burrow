'use client';

import { GameState, DesignMode } from '../game/types';
import { getTimeString, isDaytime } from '../game/Game';

interface StatusBarProps {
  game: GameState;
}

export default function StatusBar({ game }: StatusBarProps) {
  const timeStr = getTimeString(game);
  const dayNight = isDaytime(game) ? 'DAY' : 'NIGHT';
  
  return (
    <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 font-mono text-sm">
      <div className="flex items-center gap-6">
        <span className="text-green-400">{timeStr}</span>
        <span className={isDaytime(game) ? 'text-yellow-400' : 'text-blue-400'}>
          [{dayNight}]
        </span>
        <span className="text-gray-400">
          Colonists: <span className="text-white">{game.colonists.length}</span>
        </span>
        <span className="text-gray-400">
          Tasks: <span className="text-white">{game.tasks.length}</span>
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {game.designMode !== DesignMode.NONE && (
          <span className="text-orange-400">
            MODE: {game.designMode}
            {game.selectedBuild && ` (${game.selectedBuild})`}
          </span>
        )}
        {game.paused && (
          <span className="text-red-400 animate-pulse">[ PAUSED ]</span>
        )}
      </div>
    </div>
  );
}
