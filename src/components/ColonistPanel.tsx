'use client';

import { Colonist } from '../game/types';

interface ColonistPanelProps {
  colonists: Colonist[];
}

function NeedBar({ label, value, color }: { label: string; value: number; color: string }) {
  const width = Math.max(0, Math.min(100, value));
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-12">{label}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded">
        <div
          className={`h-full rounded transition-all ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{Math.round(value)}</span>
    </div>
  );
}

function ColonistCard({ colonist }: { colonist: Colonist }) {
  return (
    <div className="bg-gray-800 rounded p-2 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-green-400 font-bold">{colonist.name}</span>
        <span className="text-xs text-gray-500">{colonist.state}</span>
      </div>
      
      <div className="space-y-1">
        <NeedBar label="HP" value={colonist.needs.health} color="bg-red-500" />
        <NeedBar label="Food" value={colonist.needs.hunger} color="bg-yellow-500" />
        <NeedBar label="Rest" value={colonist.needs.rest} color="bg-blue-500" />
        <NeedBar label="Mood" value={colonist.needs.mood} color="bg-purple-500" />
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Trait: <span className="text-gray-400">{colonist.trait}</span>
      </div>
    </div>
  );
}

export default function ColonistPanel({ colonists }: ColonistPanelProps) {
  return (
    <div className="absolute top-10 right-2 w-48 bg-gray-900 border border-gray-700 rounded p-2 font-mono text-sm max-h-96 overflow-y-auto">
      <h3 className="text-green-400 mb-2 border-b border-gray-700 pb-1">Colonists</h3>
      
      <div className="space-y-2">
        {colonists.map((colonist) => (
          <ColonistCard key={colonist.id} colonist={colonist} />
        ))}
        
        {colonists.length === 0 && (
          <p className="text-gray-500 text-xs">No colonists</p>
        )}
      </div>
    </div>
  );
}
